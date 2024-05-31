from fastapi import APIRouter, Query
from api.config.config import client
from api.model.model import KeywordModel
from api.serializer.serializer import convertMarketItem, convertMarketItems
from bson import ObjectId

db = client.ceng599Project
sokApi = APIRouter(prefix="/api/sok")


@sokApi.get("/")
def get_sok_market_items(date: str):
    # Query the MongoDB collection with the relative date
    market_items = db["sok"].find({"scrapedDate": date})

    # Convert MongoDB cursor to a list of dictionaries
    market_items_list = convertMarketItems(market_items)

    return market_items_list


@sokApi.get("/product")
def get_sok_item_by_id(id: str = Query(..., description="The ID of the Sok item")):
    # Query sok database
    sok_item = db["sok"].find_one({"_id": ObjectId(id)})

    # Convert filtered_items list to a list of dictionaries
    market_item = convertMarketItem(sok_item)

    return market_item


@sokApi.post("/chartData")
def get_sok_chartdata(keyword: KeywordModel):
    # Perform case-insensitive search for documents with the given title and containing the keyword in the name field
    market_items = db["sok"].find(
        {"name": {"$regex": keyword.keyword, "$options": "i"}}
    )

    # Convert MongoDB cursor to a list of dictionaries
    market_items_list = convertMarketItems(market_items)
    # initialize data
    data = []
    for item in market_items_list:
        data.append({"value": item["price"], "date": item["scrapedDate"]})

    return data
