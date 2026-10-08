from datetime import date, datetime, time, timedelta, timezone
from typing import Literal, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import Date, Select, and_, case, false, func, or_, select
from sqlalchemy.orm import Session, aliased, contains_eager
from api.config.config import get_session
from api.entity import entities as db
from api.model.model import (
    CategoryNode,
    GroupPage,
    Price,
    ProductPage,
    ProductWithPrice,
    Suggestions,
)
from api.serializer.serializer import convertPrices, convertProduct, convertProducts

marketApi = APIRouter(prefix="/api")

Market = Literal["a101", "carrefour", "getir", "migros", "sok"]
Sort = Literal["unit_price", "price"]

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


def latest_days(session: Session) -> dict[int, date]:
    """Each market's last scrape day of the past two weeks, by market id"""
    rows = session.execute(
        select(db.Product.market_id, func.max(db.Price.scraped_at))
        .join(db.Price.product)
        .where(db.Price.scraped_at >= datetime.now(ISTANBUL) - timedelta(days=14))
        .group_by(db.Product.market_id)
    )
    return {market_id: latest.astimezone(ISTANBUL).date() for market_id, latest in rows}


# The scraper stores sizes in g, ml or adet (kg and L are converted). A unit price is
# per kg, per L or per piece, so different sizes of the same product compare fairly.
# Products without a size get none.
UNIT_PRICE = case(
    (
        db.Product.quantity > 0,
        db.Price.price
        * case((db.Product.unit.in_(["g", "ml"]), 1000), else_=1)
        / db.Product.quantity,
    ),
).label("unit_price")
PRICE_UNIT = case(
    (db.Product.quantity.is_(None) | (db.Product.quantity <= 0), None),
    (db.Product.unit.in_(["g", "kg"]), "kg"),
    (db.Product.unit.in_(["ml", "l"]), "l"),
    else_="adet",
).label("price_unit")

# Unit prices only compare within one unit, so "cheapest per unit" groups kg first,
# then L, then pieces, then products without a size
UNIT_ORDER = case(
    (PRICE_UNIT == "kg", 0), (PRICE_UNIT == "l", 1), (PRICE_UNIT == "adet", 2), else_=3
).label("unit_order")

SORTS = {
    "unit_price": [UNIT_ORDER, UNIT_PRICE, db.Price.price, db.Product.id],
    "price": [db.Price.price, db.Product.id],
}


def istanbul_day(column):
    """The Istanbul date of a timestamp, as the scraper's daily price index uses it"""
    return func.timezone("Europe/Istanbul", column).cast(Date)


def cheapest_of_its_day():
    """True for the cheapest of a product's prices on that day, when several stores were
    scraped; ties go to the first one saved"""
    other = aliased(db.Price)
    return ~(
        select(other.id)
        .where(
            other.product_id == db.Price.product_id,
            istanbul_day(other.scraped_at) == istanbul_day(db.Price.scraped_at),
            (other.price < db.Price.price) | ((other.price == db.Price.price) & (other.id < db.Price.id)),
        )
        .exists()
    )


def between_days(start_day: date):
    start = datetime.combine(start_day, time(), ISTANBUL)
    return (db.Price.scraped_at >= start) & (db.Price.scraped_at < start + timedelta(days=1))


def products_on(day: date) -> Select:
    """Products with their price on day, one price per product. Rows are
    (Product, Price, unit_price, price_unit)."""
    return (
        select(db.Product, db.Price, UNIT_PRICE, PRICE_UNIT)
        .join(db.Product.market)
        .join(db.Product.prices)
        .options(contains_eager(db.Product.market))
        .where(between_days(day), cheapest_of_its_day())
    )


def priced_offers(columns, days: dict[int, date]) -> Select:
    """Every product with its price on its market's last scrape day, one price per
    product, and its group. Selects the given columns."""
    on_latest_day = or_(
        *[(db.Product.market_id == market_id) & between_days(day) for market_id, day in days.items()]
    )
    return (
        select(*columns)
        .select_from(db.Product)
        .join(db.Product.market)
        .join(db.Product.prices)
        .join(db.product_groups, db.product_groups.c.product_id == db.Product.id)
        .where(on_latest_day if days else false(), cheapest_of_its_day())
    )


def offers_of(session: Session, days: dict[int, date], condition) -> dict[str, list[dict]]:
    """The offers of the groups the condition selects, by group key: one per market,
    in stock before out of stock, cheapest first"""
    rows = session.execute(
        priced_offers([db.Product, db.Price, UNIT_PRICE, PRICE_UNIT, db.product_groups.c.group_key], days)
        .options(contains_eager(db.Product.market))
        .where(condition)
        .order_by(db.Price.in_stock.desc(), db.Price.price, db.Product.id)
    )
    groups: dict[str, list[dict]] = {}
    for product, price, unit_price, price_unit, key in rows:
        offers = groups.setdefault(key, [])
        # a market can list the same product twice; its cheapest one stands for it
        if all(offer["market"] != product.market.name for offer in offers):
            offers.append(convertProduct(product, price, unit_price, price_unit))
    return groups


def group_of(key: str, offers: list[dict]) -> dict:
    cheapest = offers[0]
    image = cheapest["image_url"] or next((o["image_url"] for o in offers if o["image_url"]), None)
    return {
        "key": key,
        "name": cheapest["name"],
        "image_url": image,
        "quantity": cheapest["quantity"],
        "unit": cheapest["unit"],
        "price_unit": cheapest["price_unit"],
        "offers": offers,
    }


def search_terms(session: Session, q: str) -> list[list[str]]:
    """The words of q, folded like search_fold(), each with the words that mean the same
    (synonyms table): "hıyar" -> ["hiyar", "salatalik"]. At most five words."""
    words = q.split()[:5]
    if not words:
        return []
    folded = session.execute(select(*[func.search_fold(word) for word in words])).one()
    pairs = session.execute(select(db.synonyms.c.word, db.synonyms.c.canonical)).all()
    terms = []
    for word in folded:
        canonical = next((c for w, c in pairs if w == word), word)
        same = {word, canonical} | {w for w, c in pairs if c == canonical}
        terms.append(sorted(same))
    return terms


def matches(column, terms: list[list[str]]):
    """True when the column contains every term (one of its alternatives), ignoring case and
    Turkish letters. search_fold() is what the trigram index on product names is built on."""
    def pattern(word: str) -> str:
        return "%" + word.replace("/", "//").replace("%", "/%").replace("_", "/_") + "%"

    return and_(
        *[or_(*[func.search_fold(column).like(pattern(w), escape="/") for w in alternatives]) for alternatives in terms]
    )


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
    sort: Optional[Sort] = Query(None, description="Cheapest first; product id order if omitted"),
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
        query = query.where(matches(db.Product.name, search_terms(session, q)))
    total = session.scalar(select(func.count()).select_from(query.subquery()))
    query = query.order_by(*SORTS.get(sort, [db.Product.id]))
    rows = session.execute(query.limit(page_size).offset((page - 1) * page_size))
    return {
        "items": convertProducts(rows),
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@marketApi.get("/groups", response_model=GroupPage)
def get_groups(
    category: Optional[str] = Query(None, description="A category slug, e.g. meyve-sebze/meyve"),
    q: Optional[str] = Query(None, max_length=100, description="Words the product name must contain"),
    sort: Sort = Query("unit_price", description="Cheapest per kg/L/piece, or by shelf price"),
    page: int = Query(1, ge=1),
    page_size: int = Query(30, ge=1, le=100),
    session: Session = Depends(get_session),
):
    """One page of products as every market sells them: the same product of different
    markets together, each market's price on its last scrape day, cheapest group first.
    A group matches when any market's product in it matches the search and category."""
    days = latest_days(session)
    group_key = db.product_groups.c.group_key

    matching = priced_offers([group_key], days)
    if category:
        matching = in_category(matching, category)
    if q and q.strip():
        matching = matching.where(matches(db.Product.name, search_terms(session, q)))

    # Rank the matching groups by their cheapest offer in stock
    offers = priced_offers(
        [group_key, UNIT_ORDER, UNIT_PRICE, db.Price.price, db.Price.in_stock], days
    ).subquery()
    best_unit_price = func.min(case((offers.c.in_stock, offers.c.unit_price)))
    best_price = func.min(case((offers.c.in_stock, offers.c.price)))
    ranked = (
        select(offers.c.group_key)
        .where(offers.c.group_key.in_(matching.distinct()))
        .group_by(offers.c.group_key)
    )
    if sort == "unit_price":
        ranked = ranked.order_by(
            func.min(offers.c.unit_order), best_unit_price.asc().nulls_last(), best_price.asc().nulls_last(), offers.c.group_key
        )
    else:
        ranked = ranked.order_by(best_price.asc().nulls_last(), offers.c.group_key)

    total = session.scalar(select(func.count()).select_from(ranked.subquery()))
    keys = session.scalars(ranked.limit(page_size).offset((page - 1) * page_size)).all()
    groups = offers_of(session, days, group_key.in_(keys)) if keys else {}
    return {
        "items": [group_of(key, groups[key]) for key in keys if key in groups],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@marketApi.get("/suggestions", response_model=Suggestions)
def get_suggestions(
    q: str = Query(..., min_length=2, max_length=100), session: Session = Depends(get_session)
):
    """Categories and products whose names contain every word of q, for the search bar"""
    terms = search_terms(session, q)
    parent = db.Category.__table__.alias("parent")
    categories = session.execute(
        select(db.Category.name, db.Category.slug, parent.c.name)
        .outerjoin(parent, parent.c.id == db.Category.parent_id)
        .where(matches(db.Category.name, terms))
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
            matches(db.Product.name, terms),
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
        select(db.Product, db.Price, UNIT_PRICE, PRICE_UNIT)
        .join(db.Product.prices)
        .where(db.Product.id == product_id)
        .order_by(db.Price.scraped_at.desc(), db.Price.price)
        .limit(1)
    ).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return convertProduct(*row)


@marketApi.get("/product/{product_id}/offers", response_model=list[ProductWithPrice])
def get_product_offers(product_id: int, session: Session = Depends(get_session)):
    """The same product in every market that sells it (its group), cheapest first"""
    key = session.scalar(
        select(db.product_groups.c.group_key).where(db.product_groups.c.product_id == product_id)
    )
    if key is None:
        return []
    return offers_of(session, latest_days(session), db.product_groups.c.group_key == key).get(key, [])


@marketApi.get("/product/{product_id}/prices", response_model=list[Price])
def get_product_prices(product_id: int, session: Session = Depends(get_session)):
    prices = session.scalars(
        select(db.Price).where(db.Price.product_id == product_id).order_by(db.Price.scraped_at)
    )
    return convertPrices(prices)
