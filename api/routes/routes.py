from datetime import date, datetime, time, timedelta, timezone
from typing import Literal, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import Select, and_, func, or_, select
from sqlalchemy.dialects.postgresql import distinct_on
from sqlalchemy.orm import Session, contains_eager
from api.config.config import get_session
from api.entity import entities as db
from api.model.model import CategoryNode, Price, ProductPage, ProductWithPrice, Suggestions
from api.serializer.serializer import convertPrices, convertProduct, convertProducts

marketApi = APIRouter(prefix="/api")

Market = Literal["a101", "carrefour", "getir", "migros", "sok"]

# Turkey has been on UTC+3 all year since 2016; the scraper buckets prices by Istanbul day
ISTANBUL = timezone(timedelta(hours=3))


def latest_day(session: Session, market: Optional[str]) -> date:
    """The last (Istanbul) day the market, or any market, was scraped; today if never.
    Lists default to it, so they aren't empty before the 06:00 scrape or after a
    market's scrape failed."""
    query = select(func.max(db.Price.scraped_at))
    if market:
        query = query.join(db.Price.product).join(db.Product.market).where(db.Market.name == market)
    latest = session.scalar(query)
    return latest.astimezone(ISTANBUL).date() if latest else datetime.now(ISTANBUL).date()


def products_on(day: date) -> Select:
    """Products with their price on day, one price per product: the cheapest when
    several stores were scraped that day"""
    start = datetime.combine(day, time(), ISTANBUL)
    return (
        select(db.Product, db.Price)
        .join(db.Product.market)
        .join(db.Product.prices)
        .options(contains_eager(db.Product.market))
        .where(db.Price.scraped_at >= start, db.Price.scraped_at < start + timedelta(days=1))
        .ext(distinct_on(db.Product.id))
        .order_by(db.Product.id, db.Price.price)
    )


def matches(column, q: str):
    """True when every word of q appears in the column, ignoring case and Turkish letters.
    Both sides go through search_fold() (marketScraper/db/init.sql), which the trigram
    index on product names is built on."""
    words = q.split()[:5]
    patterns = ["%" + w.replace("/", "//").replace("%", "/%").replace("_", "/_") + "%" for w in words]
    return and_(*[func.search_fold(column).like(func.search_fold(p), escape="/") for p in patterns])


def in_category(query: Select, slug: str) -> Select:
    """Keeps the products of the category with this slug and of every category below it"""
    resolution = db.category_resolution
    return (
        query.join(
            resolution,
            (resolution.c.market_id == db.Product.market_id)
            & (resolution.c.category == db.Product.category),
        )
        .join(db.Category, db.Category.id == resolution.c.category_id)
        .where(
            or_(
                db.Category.slug == slug,
                db.Category.slug.startswith(slug + "/", autoescape=True),
            )
        )
    )


@marketApi.get("/")
def healt_check():
    return {"message": "API is up and running!"}


@marketApi.get("/categories", response_model=list[CategoryNode])
def get_categories(session: Session = Depends(get_session)):
    """The whole category tree, main categories first, each with its children"""
    categories = session.scalars(select(db.Category).order_by(db.Category.position))
    nodes = {}
    roots = []
    # position orders parents before their children, so a parent's node always exists
    for category in categories:
        node = {"name": category.name, "slug": category.slug, "children": []}
        nodes[category.id] = node
        siblings = nodes[category.parent_id]["children"] if category.parent_id else roots
        siblings.append(node)
    return roots


@marketApi.get("/products", response_model=ProductPage)
def get_products(
    market: Optional[Market] = None,
    category: Optional[str] = Query(None, description="A category slug, e.g. sut-kahvaltilik/peynir"),
    q: Optional[str] = Query(None, max_length=100, description="Words the product name must contain"),
    day: Optional[date] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(30, ge=1, le=100),
    session: Session = Depends(get_session),
):
    """One page of products priced on day (default: the market's last scrape day),
    optionally of one market and one category, and matching a search"""
    query = products_on(day or latest_day(session, market))
    if market:
        query = query.where(db.Market.name == market)
    if category:
        query = in_category(query, category)
    if q and q.strip():
        query = query.where(matches(db.Product.name, q))
    total = session.scalar(select(func.count()).select_from(query.subquery()))
    rows = session.execute(query.limit(page_size).offset((page - 1) * page_size))
    return {
        "items": convertProducts(rows),
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@marketApi.get("/suggestions", response_model=Suggestions)
def get_suggestions(
    q: str = Query(..., min_length=2, max_length=100), session: Session = Depends(get_session)
):
    """Categories and products whose names contain every word of q, for the search bar"""
    parent = db.Category.__table__.alias("parent")
    categories = session.execute(
        select(db.Category.name, db.Category.slug, parent.c.name)
        .outerjoin(parent, parent.c.id == db.Category.parent_id)
        .where(matches(db.Category.name, q))
        .order_by(db.Category.position)
        .limit(5)
    )
    # Only products still on sale: priced in the last week. Shorter names first, as
    # they are usually the plain product ("Starking Elma Kg" before "Starking Elma Suyu 1 L")
    recent = datetime.now(ISTANBUL) - timedelta(days=7)
    products = session.execute(
        select(db.Product.id, db.Product.name, db.Market.name)
        .join(db.Product.market)
        .where(
            matches(db.Product.name, q),
            select(db.Price.id)
            .where(db.Price.product_id == db.Product.id, db.Price.scraped_at >= recent)
            .exists(),
        )
        .order_by(func.length(db.Product.name), db.Product.name)
        .limit(8)
    )
    return {
        "categories": [{"name": n, "slug": s, "parent": p} for n, s, p in categories],
        "products": [{"id": i, "name": n, "market": m} for i, n, m in products],
    }


@marketApi.get("/product/{product_id}", response_model=ProductWithPrice)
def get_product(product_id: int, session: Session = Depends(get_session)):
    # the latest price, the cheapest store if several share the latest scrape
    row = session.execute(
        select(db.Product, db.Price)
        .join(db.Product.prices)
        .where(db.Product.id == product_id)
        .order_by(db.Price.scraped_at.desc(), db.Price.price)
        .limit(1)
    ).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return convertProduct(*row)


@marketApi.get("/product/{product_id}/prices", response_model=list[Price])
def get_product_prices(product_id: int, session: Session = Depends(get_session)):
    prices = session.scalars(
        select(db.Price).where(db.Price.product_id == product_id).order_by(db.Price.scraped_at)
    )
    return convertPrices(prices)
