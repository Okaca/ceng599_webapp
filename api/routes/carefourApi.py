from typing import Counter
from fastapi import APIRouter, Query
from api.config.config import client
from api.model.model import KeywordModel
from api.serializer.serializer import convertMarketItem, convertMarketItems
from bson import ObjectId

db = client.ceng599Project
carefourApi = APIRouter(prefix="/api/carefour")


@carefourApi.get("/")
def get_carefour_market_items(date: str):
    # Query the MongoDB collection with the relative date
    market_items = db["carefour"].find({"scrapedDate": date})

    # Convert MongoDB cursor to a list of dictionaries
    market_items_list = convertMarketItems(market_items)

    return market_items_list


@carefourApi.get("/product")
def get_carefour_item_by_id(
    id: str = Query(..., description="The ID of the Carefour item")
):
    # Query carefour database
    carefour_item = db["carefour"].find_one({"_id": ObjectId(id)})

    # Convert filtered_items list to a list of dictionaries
    market_item = convertMarketItem(carefour_item)

    return market_item


@carefourApi.post("/chartData")
def get_carefour_chartdata(keyword: KeywordModel):
    # Perform case-insensitive search for documents with the given title and containing the keyword in the name field
    market_items = db["carefour"].find(
        {"name": {"$regex": keyword.keyword, "$options": "i"}}
    )

    # Convert MongoDB cursor to a list of dictionaries
    market_items_list = convertMarketItems(market_items)
    # initialize data
    data = []
    for item in market_items_list:
        data.append({"value": item["price"], "date": item["scrapedDate"]})

    return data
