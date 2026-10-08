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
  // of q, ordered by sort ("unit_price" or "price"; product id if omitted):
  // { items, total, page, page_size }
  /** @param {{ market?: string, category?: string, q?: string, sort?: string, page?: number, pageSize?: number, day?: string }} [options] */
  getProducts({ market, category, q, sort, page = 1, pageSize = 30, day } = {}) {
    return request(
      api.get("/products", { params: { market, category, q, sort, page, page_size: pageSize, day } }),
      { items: [], total: 0, page, page_size: pageSize },
      `products of ${market ?? "all markets"} in ${category ?? "all categories"}`
    );
  }

  // One page of products as every market sells them, the same product of different
  // markets together, cheapest group first: { items, total, page, page_size }
  /** @param {{ category?: string, q?: string, sort?: string, page?: number, pageSize?: number }} [options] */
  getGroups({ category, q, sort, page = 1, pageSize = 30 } = {}) {
    return request(
      api.get("/groups", { params: { category, q, sort, page, page_size: pageSize } }),
      { items: [], total: 0, page, page_size: pageSize },
      `product groups for ${q ?? category ?? "everything"}`
    );
  }

  // The same product in every market that sells it, cheapest first, for the product page
  getProductOffers(id) {
    return request(api.get(`/product/${id}/offers`), [], `offers of product ${id}`);
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
