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

// A product with its price on one day: GET /api/{market}, /api/product/{id}, POST /api/filter
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
}

// One price of a product's history: GET /api/product/{id}/prices
export interface PricePoint {
  price: number;
  regular_price: number | null;
  discount_rate: number | null;
  in_stock: boolean;
  store_code: string; // '' when the market has one price
  scraped_at: string;
}
