from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, SmallInteger, Table, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# The tables are created by the marketScraper's db/init.sql. These classes only
# map them for reading: never call Base.metadata.create_all().


class Base(DeclarativeBase):
    pass


class Market(Base):
    __tablename__ = "markets"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True)

    products: Mapped[list["Product"]] = relationship(back_populates="market")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    market_id: Mapped[int] = mapped_column(ForeignKey("markets.id"))
    external_id: Mapped[str]
    name: Mapped[str]
    brand: Mapped[Optional[str]]
    barcode: Mapped[Optional[str]]
    category: Mapped[Optional[str]]
    quantity: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 3))
    unit: Mapped[Optional[str]]
    url: Mapped[Optional[str]]
    image_url: Mapped[Optional[str]]

    market: Mapped[Market] = relationship(back_populates="products")
    prices: Mapped[list["Price"]] = relationship(
        back_populates="product", order_by="Price.scraped_at"
    )


class Price(Base):
    __tablename__ = "prices"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    regular_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    discount_rate: Mapped[Optional[int]] = mapped_column(SmallInteger)
    in_stock: Mapped[bool]
    store_code: Mapped[str]
    scraped_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    product: Mapped[Product] = relationship(back_populates="prices")


class Category(Base):
    """Our own category tree: main > sub, the same for every market"""

    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("categories.id"))
    name: Mapped[str]
    slug: Mapped[str] = mapped_column(unique=True)  # the path, e.g. 'sut-kahvaltilik/peynir'
    position: Mapped[int]  # display order among siblings


# A view: every (market, market category) pair in products, with the category of
# our tree it resolves to. Market categories no rule covers are absent.
category_resolution = Table(
    "category_resolution",
    Base.metadata,
    Column("market_id", Integer),
    Column("category", Text),
    Column("category_id", Integer),
)

# A materialized view: every product's group. Products of different markets with the
# same group_key (size plus the words of name and brand) are the same product.
product_groups = Table(
    "product_groups",
    Base.metadata,
    Column("product_id", Integer),
    Column("group_key", Text),
)

# Words that mean the same thing ("hiyar" -> "salatalik"), already folded like search_fold()
synonyms = Table(
    "synonyms",
    Base.metadata,
    Column("word", Text),
    Column("canonical", Text),
)
