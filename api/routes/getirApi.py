from fastapi import APIRouter, Query
from api.config.config import client
from api.model.model import KeywordModel
from api.serializer.serializer import convertMarketItem, convertMarketItems
from bson import ObjectId

db = client.ceng599Project
getirApi = APIRouter(prefix="/api/getir")


@getirApi.get("/")
def get_getir_market_items(date: str):
    # Query the MongoDB collection with the relative date
    market_items = db["getir"].find({"scrapedDate": date})

    # Convert MongoDB cursor to a list of dictionaries
    market_items_list = convertMarketItems(market_items)

    return market_items_list


@getirApi.get("/product")
def get_getir_item_by_id(id: str = Query(..., description="The ID of the Getir item")):
    # Query getir database
    getir_item = db["getir"].find_one({"_id": ObjectId(id)})

    # Convert filtered_items list to a list of dictionaries
    market_item = convertMarketItem(getir_item)

    return market_item


@getirApi.post("/chartData")
def get_getir_chartdata(keyword: KeywordModel):
    # Perform case-insensitive search for documents with the given title and containing the keyword in the name field
    market_items = db["getir"].find(
        {"name": {"$regex": keyword.keyword, "$options": "i"}}
    )

    # Convert MongoDB cursor to a list of dictionaries
    market_items_list = convertMarketItems(market_items)
    # initialize data
    data = []
    for item in market_items_list:
        data.append({"value": item["price"], "date": item["scrapedDate"]})

    return data
