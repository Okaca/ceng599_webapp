from datetime import datetime
from typing import Counter
from fastapi import APIRouter, Query
from api.config.config import client
from api.model.model import KeywordJsonModel, KeywordModel
from api.serializer.serializer import convertMarketItem, convertMarketItems
from bson import ObjectId

db = client.ceng599Project
marketApi = APIRouter(prefix="/api")


@marketApi.get("/")
def healt_check():
    return {"message": "API is up and running!"}


@marketApi.post("/filter")
def filter_all_market_by_item(keywordJson: KeywordJsonModel):
    print(keywordJson)
    # Get today's date in yyyy-mm-dd format
    today_date = datetime.now().strftime("%Y-%m-%d")
    # Perform case-insensitive search for documents with the given title and containing the keyword in the name field
    marketsList = ["migros", "sok", "carefour", "a101", "getir"]
    finalMarketItemList = []
    for marketName in marketsList:
        market_items = db[marketName].find(
            {
                "$and": [
                    {"name": {"$regex": keywordJson.main, "$options": "i"}},
                    {"name": {"$regex": keywordJson.sub, "$options": "i"}},
                    {"scrapedDate": today_date},
                ]
            }
        )
        # Convert MongoDB cursor to a list of dictionaries
        market_items_list = convertMarketItems(market_items)
        finalMarketItemList = finalMarketItemList + market_items_list

    return finalMarketItemList
