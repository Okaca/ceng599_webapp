/** @type {import('next').NextConfig} */

// In production the frontend is plain files: `next build` exports it to out/, and the
// FastAPI server serves those files next to /api (api/index.py), so one server runs both.
// In development `next dev` serves the pages and forwards /api to the FastAPI dev server.
const isDev = process.env.NODE_ENV === "development";
const API_URL = process.env.API_URL || "http://127.0.0.1:8000";

const nextConfig = isDev
  ? {
      rewrites: async () => [
        { source: "/api/:path*", destination: `${API_URL}/api/:path*` },
        { source: "/docs", destination: `${API_URL}/docs` },
        { source: "/openapi.json", destination: `${API_URL}/openapi.json` },
      ],
    }
  : {
      output: "export",
      // /product/ instead of /product.html, so the file server finds every page as
      // <folder>/index.html
      trailingSlash: true,
      // The path the site lives under, e.g. /marketScraper for
      // onurkagancoskun.com/marketScraper; empty for the root of a domain. Pages, links
      // and assets get it in front; the Dockerfile sets it.
      basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
    };

module.exports = nextConfig;
