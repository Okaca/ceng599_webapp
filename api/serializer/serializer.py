from sqlalchemy import inspect
from api.entity import entities as db
from api.model.model import Price, ProductWithPrice


def columns(entity) -> dict:
  return {attr.key: getattr(entity, attr.key) for attr in inspect(entity).mapper.column_attrs}


def convertProduct(product: db.Product, price: db.Price, unit_price, price_unit) -> dict:
  # product's columns come last so its id wins over the price row's id
  row = {
    **columns(price),
    **columns(product),
    "market": product.market.name,
    "unit_price": unit_price,
    "price_unit": price_unit,
  }
  return ProductWithPrice.model_validate(row).model_dump()


def convertProducts(rows) -> list:
  """rows of (Product, Price, unit_price, price_unit), as the product queries return them"""
  return [convertProduct(*row) for row in rows]


def convertPrices(prices) -> list:
  return [Price.model_validate(price).model_dump() for price in prices]
