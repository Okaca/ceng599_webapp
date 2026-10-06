from datetime import datetime
from typing import Optional
from pydantic import BaseModel

# NUMERIC columns arrive from psycopg as Decimal; they are declared as float so
# the JSON response carries numbers (pydantic would serialize Decimal as "12.50")


class Product(BaseModel):
    """A row of products, with its market's name instead of market_id"""

    id: int
    market: str
    external_id: str
    name: str
    brand: Optional[str] = None
    barcode: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    url: Optional[str] = None
    image_url: Optional[str] = None


class Price(BaseModel):
    """A row of prices: one product's price in one store on one day"""

    price: float
    regular_price: Optional[float] = None
    discount_rate: Optional[int] = None
    in_stock: bool
    store_code: str
    scraped_at: datetime


class ProductWithPrice(Product):
    """A product with its latest price, for lists, search results and detail pages"""

    price: float
    regular_price: Optional[float] = None
    discount_rate: Optional[int] = None
    in_stock: bool
    scraped_at: datetime


class KeywordModel(BaseModel):
    keyword: str


class KeywordJsonModel(BaseModel):
    main: str
    sub: Optional[str] = ""
