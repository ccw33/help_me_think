import pytest
import asyncio
from python_backend.app.database import mongo_client

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
async def setup_database():
    """Setup database connection for tests."""
    try:
        # 确保数据库连接正常
        await mongo_client.admin.command('ping')
        yield
    except Exception as e:
        print(f"Database connection error: {e}")
        raise
    finally:
        # 测试完成后不要关闭连接，保持连接池活动
        pass

@pytest.fixture(scope="session")
def test_app():
    from main import app
    yield app
