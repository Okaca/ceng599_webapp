import os

from dotenv import load_dotenv
from psycopg.conninfo import make_conninfo
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

# Same variables the marketScraper uses, read from the environment or a .env file
load_dotenv()

conninfo = make_conninfo(
    host=os.getenv("POSTGRES_HOST", "localhost"),
    port=os.getenv("POSTGRES_PORT", "5432"),
    dbname=os.getenv("POSTGRES_DB"),
    user=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD"),
)

# Rows come back as dicts keyed by column name, e.g. row["image_url"]
pool = ConnectionPool(
    conninfo,
    min_size=1,
    max_size=10,
    kwargs={"row_factory": dict_row, "autocommit": True},  # returns rows as dicts
    open=False,
)

# Open the pool and check the connection once at startup
try:
    pool.open(wait=True, timeout=10)
    with pool.connection() as conn:
        conn.execute("SELECT 1")
    print("Successfully connected to PostgreSQL!")
except Exception as e:
    print(e)
