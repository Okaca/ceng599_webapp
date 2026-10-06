from sqlalchemy import inspect
from api.entity import entities as db
from api.model.model import Price, ProductWithPrice


def columns(entity) -> dict:
  return {attr.key: getattr(entity, attr.key) for attr in inspect(entity).mapper.column_attrs}


def convertProduct(product: db.Product, price: db.Price) -> dict:
  # product's columns come last so its id wins over the price row's id
  row = {**columns(price), **columns(product), "market": product.market.name}
  return ProductWithPrice.model_validate(row).model_dump()


def convertProducts(rows) -> list:
  """rows of (Product, Price) pairs, as returned by select(db.Product, db.Price)"""
  return [convertProduct(product, price) for product, price in rows]


def convertPrices(prices) -> list:
  return [Price.model_validate(price).model_dump() for price in prices]
