from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import DateTime, ForeignKey, Numeric, SmallInteger
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

# The tables are created and written by the marketScraper (db/init.sql). These
# classes only map them for reading: never call Base.metadata.create_all().


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
