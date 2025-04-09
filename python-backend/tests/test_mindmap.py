import pytest
import asyncio
from fastapi import FastAPI
from fastapi.testclient import TestClient
from main import app
from python_backend.models import MindMap

@pytest.fixture
def test_mindmap_data():
    return {
        "nodes": [
            {"key": 1, "text": "Main Idea", "color": "#00a1ff"},
            {"key": 2, "text": "Sub Idea 1", "color": "#ff6b00"}
        ],
        "links": [{"from": 1, "to": 2}]
    }

@pytest.fixture
def test_client():
    return TestClient(app)

def test_save_mindmap(test_mindmap_data, test_client):
    response = test_client.post(
        "/api/mindmaps",
        json=test_mindmap_data
    )
    assert response.status_code == 200
    assert "id" in response.json()

def test_get_mindmap(test_mindmap_data, test_client):
    # 先保存一个思维导图
    save_response = test_client.post("/api/mindmaps", json=test_mindmap_data)
    print(f"Save response: {save_response.json()}")  # 添加调试日志
    
    # 检查响应是否包含id
    assert "id" in save_response.json(), f"Response missing 'id': {save_response.json()}"
    mindmap_id = save_response.json()["id"]
    
    # 确保异步操作完成
    import time
    time.sleep(0.1)
    
    # 测试获取思维导图
    response = test_client.get(f"/api/mindmaps/{mindmap_id}")
    assert response.status_code == 200
    assert response.json()["nodes"][0]["text"] == "Main Idea"
