from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict

# Response shapes, built from the entities in api/entity/entities.py.
# NUMERIC columns arrive as Decimal; they are declared as float so the JSON
# response carries numbers (pydantic would serialize Decimal as "12.50")


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

    # Lets model_validate read a db.Price entity's attributes (price.in_stock, ...)
    # instead of requiring a dict; pydantic v1 called this orm_mode. ProductWithPrice
    # doesn't need it: the serializer merges its sources into a dict first
    model_config = ConfigDict(from_attributes=True)

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
    unit_price: Optional[float] = None  # price per kg, L or piece; None without a size
    price_unit: Optional[Literal["kg", "l", "adet"]] = None


class ProductPage(BaseModel):
    """One page of a product list, with the size of the whole list"""

    items: list[ProductWithPrice]
    total: int
    page: int
    page_size: int


class CategorySuggestion(BaseModel):
    name: str
    slug: str
    parent: Optional[str] = None  # the main category's name, for a subcategory


class ProductSuggestion(BaseModel):
    id: int
    name: str
    market: str


class Suggestions(BaseModel):
    """What the search bar offers while the user types"""

    categories: list[CategorySuggestion]
    products: list[ProductSuggestion]


class CategoryNode(BaseModel):
    """A category with its subcategories, for the sidebar"""

    name: str
    slug: str  # the path, e.g. 'sut-kahvaltilik/peynir'
    children: list["CategoryNode"] = []
