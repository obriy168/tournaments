from sqlalchemy.ext.asyncio.engine import create_async_engine
from sqlalchemy.ext.asyncio.session import AsyncSession
import os
from dotenv import load_dotenv


async def get_db() -> AsyncSession:
    load_dotenv()
    engine = create_async_engine(os.getenv("DATABASE_URL"))
    async with AsyncSession(engine) as session:
        yield session