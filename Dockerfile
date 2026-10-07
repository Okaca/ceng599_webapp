# The whole webapp in one image: FastAPI serves the API at /api and the exported
# Next.js frontend at every other path. Builds for both the Raspberry Pi (arm64) and
# a normal PC (amd64). The database login comes from the environment at runtime.

# The path the site lives under: onurkagancoskun.com/marketScraper. Build with
# --build-arg BASE_PATH= to serve it from the root of a domain instead.
ARG BASE_PATH=/marketScraper

# 1. Export the frontend to plain HTML/JS/CSS. The files are the same on every CPU, so
#    this stage runs on the building machine's own platform: no slow emulated Next.js
#    build for arm64.
FROM --platform=$BUILDPLATFORM node:20-alpine AS frontend
ARG BASE_PATH
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_BASE_PATH=$BASE_PATH
WORKDIR /app
# installed before copying the code, so code changes do not reinstall every package
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. The API, with the exported frontend next to it
FROM python:3.11-slim
ARG BASE_PATH

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    FRONTEND_DIR=/app/frontend \
    BASE_PATH=$BASE_PATH

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api ./api
COPY --from=frontend /app/out ./frontend

EXPOSE 8000
CMD ["uvicorn", "api.index:app", "--host", "0.0.0.0", "--port", "8000"]
