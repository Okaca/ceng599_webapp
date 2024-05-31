from typing import Optional
from pydantic import BaseModel


class MarketItem(BaseModel):
    title: str
    scrapedDate: str
    imageUrl: str
    itemURL: str
    name: str
    price: str
    marketName: str


class KeywordModel(BaseModel):
    keyword: str


class KeywordJsonModel(BaseModel):
    main: str
    sub: Optional[str] = ""
