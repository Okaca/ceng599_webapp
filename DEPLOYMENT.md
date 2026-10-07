# Deployment

How to run the webapp on the Raspberry Pi next to the market scraper, which already runs
there with its PostgreSQL database (see the scraper's `deployment.md`).

The image is built on the PC, pushed to Docker Hub as `metu1onurc1/market-webapp`, and
pulled by the Pi. The Pi never needs the source code.

```
PC (webapp folder)                Docker Hub                      Raspberry Pi (~/marketScraper)
docker buildx build --push   →   metu1onurc1/market-webapp   →   docker compose pull / up
```

## How it runs

One container runs the whole webapp. FastAPI answers `/api/*` from the database and serves
the frontend at every other path: `next build` exports the Next.js pages as plain
HTML/JS/CSS files, which run in the browser and call `/api`.

```
docker compose (~/marketScraper)
├── postgres  (market_postgres)  the scraper's database
├── scraper   (market_scraper)   fills the database daily at 06:00
└── webapp    (market_webapp)    FastAPI on port 3002: /api/* from postgres:5432, pages from the image
```

- The webapp joins the scraper's `docker compose` project, so it reaches the database by
  its service name, `postgres`.
- Port 3002 because 3000 (portfolio) and 3001 (openhouse) are taken on the Pi.
- The database must have the categories and search function from the scraper's `db/init.sql`.

## 1. Build and push the image (PC)

The image is built for the Pi (`linux/arm64`) and for normal PCs (`linux/amd64`) with the
`multiarch` builder the scraper already uses (`docker buildx ls` shows it; to create it,
see the scraper's `deployment.md`, step 3). Logged in to Docker Hub as `metu1onurc1`
(`docker login`), in `C:\Users\okaca\Desktop\ceng599project\webapp`:

```powershell
docker buildx build --builder multiarch `
  --platform linux/amd64,linux/arm64 `
  -t metu1onurc1/market-webapp:latest `
  --push .
```

The frontend is built once, natively, and shared by both platforms; only the Python part
is built for ARM64 by emulation. Expect about 5 minutes the first time, less later thanks
to the builder's cache. `.dockerignore` keeps `.env`, `venv/` and `node_modules/` out of
the image, so it holds no passwords.

Check both platforms were pushed:

```powershell
docker buildx imagetools inspect metu1onurc1/market-webapp:latest
```

It should list `linux/amd64` and `linux/arm64`.

## 2. Add the service on the Pi

In `~/marketScraper/docker-compose.yml`, add this under `services:`, next to `postgres`
and `scraper`:

```yaml
  webapp:
    image: metu1onurc1/market-webapp:latest
    container_name: market_webapp
    restart: unless-stopped
    env_file: .env
    environment:
      # inside the compose network the database is reached by its service name
      POSTGRES_HOST: postgres
      POSTGRES_PORT: "5432"
    ports:
      - "3002:8000"
    depends_on:
      postgres:
        condition: service_healthy
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

It reads the same `.env` as the scraper (`POSTGRES_USER`, `POSTGRES_PASSWORD`,
`POSTGRES_DB`), so there is nothing new to configure.

## 3. Start

```bash
cd ~/marketScraper
docker compose pull webapp
docker compose up -d webapp
docker compose ps                   # market_webapp: Up
docker compose logs webapp          # should show: Successfully connected to PostgreSQL!
```

Open `http://<pi-address>:3002` from a computer on the same network. To check from the Pi:

```bash
curl -s http://localhost:3002/api/ ; echo        # {"message":"API is up and running!"}
curl -s "http://localhost:3002/api/products?q=starking&page_size=3" | head -c 300 ; echo
```

## 4. Update

After changing the code:

1. On the PC, build and push as in step 1.
2. On the Pi:

   ```bash
   cd ~/marketScraper
   docker compose pull webapp
   docker compose up -d webapp
   docker image prune -f             # remove the replaced image
   ```

The database and the scraper are not affected. If the scraper's `db/init.sql` changed
(categories, search), apply it to the running database as its header describes.

## Development (PC)

`npm run dev` runs `next dev` on port 3000 and the FastAPI server on port 8000;
`next dev` forwards `/api` to it (`next.config.js`). The API reads the database login from
`.env`. The exported frontend (`out/`) is only used by `next build` and the image.

## Troubleshooting

| Problem | Cause and fix |
|---|---|
| Page loads but every list is empty | The database has no prices yet (the first scrape is at 06:00), or the webapp cannot reach it: `docker compose logs webapp`. |
| `function search_fold(text) does not exist` in the logs | The database lacks the search block of the scraper's `db/init.sql`: apply the file to the running database. |
| `relation "categories" does not exist` | Same, for the category tables. |
| `exec format error` on the Pi | The pushed image has no arm64 version: check with `docker buildx imagetools inspect` (step 1). |
| Port 3002 already in use | Change `"3002:8000"` to another free host port; `sudo ss -tlnp` lists the used ones. |
