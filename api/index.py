import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from api.routes.routes import marketApi

app = FastAPI()

app.include_router(marketApi)

# The frontend, exported by `next build` (next.config.js) as plain HTML/JS/CSS. Mounted
# after the API router, so /api/* reaches the routes and every other path is a file.
# html=True serves a folder's index.html and out/404.html for unknown paths.
# Absent in development, where `next dev` serves the pages instead.
FRONTEND_DIR = os.getenv("FRONTEND_DIR", "out")
if os.path.isdir(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
