// Response shapes of the FastAPI backend (api/model/model.py)

export type MarketName = "a101" | "carrefour" | "getir" | "migros" | "sok";

export const MARKETS: MarketName[] = ["migros", "a101", "getir", "carrefour", "sok"];

// How each market's name is shown in the UI
export const MARKET_LABELS: Record<MarketName, string> = {
  a101: "A101",
  carrefour: "Carrefour",
  getir: "Getir",
  migros: "Migros",
  sok: "ŞOK",
};

// A product with its price on one day: GET /api/products, /api/product/{id}
export interface Product {
  id: number;
  market: MarketName;
  external_id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  category: string | null;
  quantity: number | null;
  unit: string | null; // 'g', 'kg', 'ml', 'l', 'adet'
  url: string | null;
  image_url: string | null;
  price: number;
  regular_price: number | null; // price before discount
  discount_rate: number | null; // e.g. 33 for %33
  in_stock: boolean;
  scraped_at: string; // ISO timestamp, e.g. "2026-10-06T11:37:00Z"
  unit_price: number | null; // price per kg, L or piece; null without a size
  price_unit: PriceUnit | null;
}

export type PriceUnit = "kg" | "l" | "adet";

// How products are ordered: per kg/L/piece (grouped by unit) or by shelf price
export type Sort = "unit_price" | "price";

// A node of the category tree: GET /api/categories
export interface Category {
  name: string;
  slug: string; // the path, e.g. "sut-kahvaltilik/peynir"
  children: Category[];
}

// What the search bar offers while typing: GET /api/suggestions?q=
export interface Suggestions {
  categories: { name: string; slug: string; parent: string | null }[];
  products: { id: number; name: string; market: MarketName }[];
}

// One page of a product list: GET /api/products?market=&category=&q=&page=&page_size=
export interface ProductPage {
  items: Product[];
  total: number; // products in the whole list, across all pages
  page: number;
  page_size: number;
}

export const PAGE_SIZES = [10, 20, 30, 50, 100];
export const DEFAULT_PAGE_SIZE = 30;

// One price of a product's history: GET /api/product/{id}/prices
export interface PricePoint {
  price: number;
  regular_price: number | null;
  discount_rate: number | null;
  in_stock: boolean;
  store_code: string; // '' when the market has one price
  scraped_at: string;
}
