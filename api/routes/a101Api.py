from typing import Counter
from fastapi import APIRouter, Query
from api.config.config import client
from api.model.model import KeywordModel
from api.serializer.serializer import convertMarketItem, convertMarketItems
from bson import ObjectId

db = client.ceng599Project
a101Api = APIRouter(prefix="/api/a101")


@a101Api.get("/")
def get_A101_market_items(date: str):
    # Query the MongoDB collection with the relative date
    market_items = db["a101"].find({"scrapedDate": date})

    # Convert MongoDB cursor to a list of dictionaries
    market_items_list = convertMarketItems(market_items)

    return market_items_list


@a101Api.get("/product")
def get_A101_item_by_id(id: str = Query(..., description="The ID of the A101 item")):
    # Query a101 database
    a101_item = db["a101"].find_one({"_id": ObjectId(id)})

    # Convert filtered_items list to a list of dictionaries
    market_item = convertMarketItem(a101_item)

    return market_item


@a101Api.post("/chartData")
def get_a101_chartdata(keyword: KeywordModel):
    # Perform case-insensitive search for documents with the given title and containing the keyword in the name field
    market_items = db["a101"].find(
        {"name": {"$regex": keyword.keyword, "$options": "i"}}
    )

    # Convert MongoDB cursor to a list of dictionaries
    market_items_list = convertMarketItems(market_items)
    # initialize data
    data = []
    for item in market_items_list:
        data.append({"value": item["price"], "date": item["scrapedDate"]})

    return data
