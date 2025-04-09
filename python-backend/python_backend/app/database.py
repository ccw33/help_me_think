from pymongo import MongoClient
import asyncpg
import os
from typing import AsyncGenerator
from contextlib import asynccontextmanager

# MongoDB配置
MONGO_URI = os.getenv("MONGODB_URL", "mongodb://root:example@localhost:27017")
mongo_client = MongoClient(MONGO_URI)
mongo_db = mongo_client["think_assistant"]

# PostgreSQL配置
POSTGRES_CONFIG = {
    "user": "thinkuser",
    "password": "thinkpass",
    "database": "thinkdb",
    "host": "localhost"
}

@asynccontextmanager
async def get_postgres_conn() -> AsyncGenerator[asyncpg.Connection, None]:
    conn = await asyncpg.connect(**POSTGRES_CONFIG)
    try:
        yield conn
    finally:
        await conn.close()
