from datetime import date, datetime, time, timedelta, timezone
from typing import Literal, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Select, or_, select
from sqlalchemy.dialects.postgresql import distinct_on
from sqlalchemy.orm import Session, contains_eager
from api.config.config import get_session
from api.entity import entities as db
from api.model.model import KeywordJsonModel, Price, ProductWithPrice
from api.serializer.serializer import convertPrices, convertProduct, convertProducts

marketApi = APIRouter(prefix="/api")

Market = Literal["a101", "carrefour", "getir", "migros", "sok"]

# Turkey has been on UTC+3 all year since 2016; the scraper buckets prices by Istanbul day
ISTANBUL = timezone(timedelta(hours=3))

# Extra names a search keyword should also match
SYNONYMS = {"Salatalık": ["hıyar"]}


def products_on(day: Optional[date]) -> Select:
    """Products with their price on day (default today), one price per product:
    the cheapest when several stores were scraped that day"""
    start = datetime.combine(day or datetime.now(ISTANBUL).date(), time(), ISTANBUL)
    return (
        select(db.Product, db.Price)
        .join(db.Product.market)
        .join(db.Product.prices)
        .options(contains_eager(db.Product.market))
        .where(db.Price.scraped_at >= start, db.Price.scraped_at < start + timedelta(days=1))
        .ext(distinct_on(db.Product.id))
        .order_by(db.Product.id, db.Price.price)
    )


@marketApi.get("/")
def healt_check():
    return {"message": "API is up and running!"}


@marketApi.post("/filter", response_model=list[ProductWithPrice])
def filter_all_market_by_item(
    keywordJson: KeywordJsonModel,
    day: Optional[date] = None,
    session: Session = Depends(get_session),
):
    names = [keywordJson.main] + SYNONYMS.get(keywordJson.main, [])
    query = products_on(day).where(
        or_(*[db.Product.name.icontains(name, autoescape=True) for name in names]),
        db.Product.name.icontains(keywordJson.sub or "", autoescape=True),
    )
    return convertProducts(session.execute(query))


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


@marketApi.get("/{market}", response_model=list[ProductWithPrice])
def get_market_products(
    market: Market, day: Optional[date] = None, session: Session = Depends(get_session)
):
    query = products_on(day).where(db.Market.name == market)
    return convertProducts(session.execute(query))
