import os

from dotenv import load_dotenv
from sqlalchemy import URL, create_engine, text
from sqlalchemy.orm import Session, sessionmaker

# Same variables the marketScraper uses, read from the environment or a .env file
load_dotenv()

url = URL.create(
    "postgresql+psycopg",
    host=os.getenv("POSTGRES_HOST", "localhost"),
    port=int(os.getenv("POSTGRES_PORT", "5432")),
    database=os.getenv("POSTGRES_DB"),
    username=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD"),
)

# The API only reads, so queries run without wrapping each request in a transaction
engine = create_engine(
    url,
    pool_size=5,
    max_overflow=5,
    pool_pre_ping=True,
    isolation_level="AUTOCOMMIT",
    connect_args={"connect_timeout": 5},  # seconds; fail fast if Postgres is down
)
SessionLocal = sessionmaker(engine)


def get_session():
    """FastAPI dependency: one session per request, closed when the request ends"""
    with SessionLocal() as session:
        yield session


# Check the connection once at startup
try:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("Successfully connected to PostgreSQL!")
except Exception as e:
    print(e)
