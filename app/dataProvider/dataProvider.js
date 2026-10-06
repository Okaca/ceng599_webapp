import axios from "axios";

// Relative URL: next.config.js rewrites /api/* to the FastAPI server, so this
// works on any host without CORS
const api = axios.create({ baseURL: "/api" });

// Requests resolve to `fallback` on failure, so a page still renders with empty data
async function request(promise, fallback, what) {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${what}:`, error);
    return fallback;
  }
}

class Dataprovider {
  // One page of a market's products with their price on day ("YYYY-MM-DD"), today
  // if omitted: { items, total, page, page_size }
  getMarket(market, page = 1, pageSize = 30, day) {
    return request(
      api.get(`/${market}`, { params: { page, page_size: pageSize, day } }),
      { items: [], total: 0, page, page_size: pageSize },
      market
    );
  }

  // One product with its latest price
  getProduct(id) {
    return request(api.get(`/product/${id}`), null, `product ${id}`);
  }

  // Every price of one product, oldest first, for the chart
  getPriceHistory(id) {
    return request(api.get(`/product/${id}/prices`), [], `prices of product ${id}`);
  }

  // Products in all markets whose name contains keywordJson.main and keywordJson.sub
  getMarketItemByKeyword(keywordJson, day) {
    return request(
      api.post("/filter", { main: keywordJson.main, sub: keywordJson.sub }, { params: { day } }),
      [],
      `products matching ${keywordJson.main}`
    );
  }
}

export default Dataprovider;
