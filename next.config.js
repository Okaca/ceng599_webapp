/** @type {import('next').NextConfig} */

// Where the FastAPI server is: localhost in development, the API container's
// address in Docker (e.g. API_URL=http://api:8000). Rewrites are fixed when
// `next build` runs, so API_URL must be set at build time.
const API_URL = process.env.API_URL || "http://127.0.0.1:8000";

const nextConfig = {
  rewrites: async () => {
    return [
      { source: "/api/:path*", destination: `${API_URL}/api/:path*` },
      { source: "/docs", destination: `${API_URL}/docs` },
      { source: "/openapi.json", destination: `${API_URL}/openapi.json` },
    ];
  },
};

module.exports = nextConfig;
