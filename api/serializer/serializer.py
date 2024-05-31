def convertMarketItem(marketItem) -> dict:
  return {
    "id" : str(marketItem["_id"]),
    "title" : marketItem["title"],
    "scrapedDate" : marketItem["scrapedDate"],
    "imageUrl" : marketItem["imageUrl"],
    "itemURL" : marketItem["itemURL"],
    "name" : marketItem["name"],
    "price" : marketItem["price"],
    "marketName" : marketItem["marketName"]
  }
  
def convertMarketItems(marketItems) -> list:
  return [convertMarketItem(marketItem) for marketItem in marketItems]