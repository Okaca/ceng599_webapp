from fastapi import APIRouter, Query
from api.config.config import client
from api.model.model import KeywordModel
from api.serializer.serializer import convertMarketItem, convertMarketItems
from bson import ObjectId

db = client.ceng599Project
migrosApi = APIRouter(prefix="/api/migros")


@migrosApi.get("/")
def get_migros_market_items(date: str):
    # Query the MongoDB collection with the relative date
    market_items = db["migros"].find({"scrapedDate": date})

    # Convert MongoDB cursor to a list of dictionaries
    market_items_list = convertMarketItems(market_items)

    return market_items_list


@migrosApi.get("/product")
def get_migros_item_by_id(
    id: str = Query(..., description="The ID of the Migros item")
):
    # Query migros database
    migros_item = db["migros"].find_one({"_id": ObjectId(id)})

    # Convert filtered_items list to a list of dictionaries
    market_item = convertMarketItem(migros_item)

    return market_item


@migrosApi.post("/chartData")
def get_migros_chartdata(keyword: KeywordModel):
    print(keyword)
    # Perform case-insensitive search for documents with the given title and containing the keyword in the name field
    market_items = db["migros"].find({"name": keyword.keyword})

    # Convert MongoDB cursor to a list of dictionaries
    market_items_list = convertMarketItems(market_items)
    # initialize data
    data = []
    for item in market_items_list:
        data.append({"value": item["price"], "date": item["scrapedDate"]})

    return data
