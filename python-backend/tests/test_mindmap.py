import pytest
from fastapi.testclient import TestClient
from main import app
from python_backend.models import MindMap

client = TestClient(app)

@pytest.fixture
def test_mindmap_data():
    return {
        "nodes": [
            {"key": 1, "text": "Main Idea", "color": "#00a1ff"},
            {"key": 2, "text": "Sub Idea 1", "color": "#ff6b00"}
        ],
        "links": [{"from": 1, "to": 2}]
    }

def test_save_mindmap(test_mindmap_data):
    # 测试保存思维导图
    response = client.post(
        "/api/mindmaps",
        json=test_mindmap_data
    )
    assert response.status_code == 200
    assert response.json()["message"] == "MindMap saved successfully"

def test_get_mindmap(test_mindmap_data):
    # 先保存一个思维导图
    save_response = client.post("/api/mindmaps", json=test_mindmap_data)
    mindmap_id = save_response.json()["id"]
    
    # 测试获取思维导图
    response = client.get(f"/api/mindmaps/{mindmap_id}")
    assert response.status_code == 200
    assert response.json()["nodes"][0]["text"] == "Main Idea"
