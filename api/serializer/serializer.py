from api.model.model import Price, ProductWithPrice

# Rows come from the pool as dicts (dict_row), keyed by the SELECT's column names.
# Validating them through the models turns Decimal into float and drops any
# extra columns a query might select.


def convertProduct(row) -> dict:
  return ProductWithPrice.model_validate(row).model_dump()


def convertProducts(rows) -> list:
  return [convertProduct(row) for row in rows]


def convertPrice(row) -> dict:
  return Price.model_validate(row).model_dump()


def convertPrices(rows) -> list:
  return [convertPrice(row) for row in rows]
