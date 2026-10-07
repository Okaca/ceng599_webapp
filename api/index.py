import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from api.routes.routes import marketApi

# The path the site lives under behind a proxy, e.g. /marketScraper for
# onurkagancoskun.com/marketScraper; empty when it is the root of a domain.
BASE_PATH = os.getenv("BASE_PATH", "").rstrip("/")


class StripBasePath:
    """Serves /marketScraper/api/... as /api/..., so the app works whether the proxy in
    front passes the base path on or removes it. root_path keeps the prefix in URLs the
    app builds itself, such as redirects."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        path = scope.get("path", "")
        if BASE_PATH and scope["type"] in ("http", "websocket") and (
            path == BASE_PATH or path.startswith(BASE_PATH + "/")
        ):
            stripped = path[len(BASE_PATH):] or "/"
            scope = {
                **scope,
                "path": stripped,
                "raw_path": stripped.encode(),
                "root_path": scope.get("root_path", "") + BASE_PATH,
            }
        await self.app(scope, receive, send)


app = FastAPI()
app.add_middleware(StripBasePath)

app.include_router(marketApi)

# The frontend, exported by `next build` (next.config.js) as plain HTML/JS/CSS. Mounted
# after the API router, so /api/* reaches the routes and every other path is a file.
# html=True serves a folder's index.html and out/404.html for unknown paths.
# Absent in development, where `next dev` serves the pages instead.
FRONTEND_DIR = os.getenv("FRONTEND_DIR", "out")
if os.path.isdir(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
