import axios from "axios";

// Relative URL, so it works on any host without CORS: in production the same server
// serves the pages and /api, in development next.config.js forwards /api to FastAPI.
// NEXT_PUBLIC_BASE_PATH is the path the site lives under (e.g. /marketScraper), fixed
// at build time; Next.js adds it to links by itself, but not to requests made here.
const api = axios.create({ baseURL: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api` });

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
  // The category tree: [{ name, slug, children: [...] }, ...]
  getCategories() {
    return request(api.get("/categories"), [], "categories");
  }

  // One page of products priced on day ("YYYY-MM-DD", the market's last scrape day if omitted),
  // optionally of one market and one category slug, and whose names contain every word
  // of q: { items, total, page, page_size }
  /** @param {{ market?: string, category?: string, q?: string, page?: number, pageSize?: number, day?: string }} [options] */
  getProducts({ market, category, q, page = 1, pageSize = 30, day } = {}) {
    return request(
      api.get("/products", { params: { market, category, q, page, page_size: pageSize, day } }),
      { items: [], total: 0, page, page_size: pageSize },
      `products of ${market ?? "all markets"} in ${category ?? "all categories"}`
    );
  }

  // Categories and products matching q (2+ letters), for the search bar
  getSuggestions(q) {
    return request(
      api.get("/suggestions", { params: { q } }),
      { categories: [], products: [] },
      `suggestions for ${q}`
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
}

export default Dataprovider;
