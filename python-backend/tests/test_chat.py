import pytest
from unittest.mock import AsyncMock, patch, ANY
from datetime import datetime
from python_backend.services.chat_service import ChatService

@pytest.mark.asyncio
async def test_handle_message():
    mock_conn = AsyncMock()
    mock_conn.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_conn.execute = AsyncMock()
    
    service = ChatService()
    with patch('python_backend.services.chat_service.get_postgres_conn', return_value=mock_conn):
        result = await service.handle_message("user1", "测试消息", "node1")
        
        # 验证数据库调用
        assert mock_conn.execute.call_count == 2
        mock_conn.execute.assert_any_call(
                """INSERT INTO chats(user_id, message, node_reference, created_at)
                VALUES($1, $2, $3, $4)""",
                    "user1", "测试消息", "node1", ANY
            )
    # 验证返回结果
    assert result["type"] == "message"
    assert "测试消息" in result["content"]
    assert "node1" in result["content"]

@pytest.mark.asyncio
async def test_handle_message_without_reference():
    mock_conn = AsyncMock()
    mock_conn.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_conn.execute = AsyncMock()
    
    service = ChatService()
    with patch('python_backend.services.chat_service.get_postgres_conn', return_value=mock_conn):
        result = await service.handle_message("user1", "测试消息")
        
        # 验证数据库调用
        assert mock_conn.execute.call_count == 2
        mock_conn.execute.assert_any_call(
                """INSERT INTO chats(user_id, message, node_reference, created_at)
                VALUES($1, $2, $3, $4)""",
                    "user1", "测试消息", None, ANY
            )
    # 验证返回结果
    assert result["type"] == "message"
    assert "测试消息" in result["content"]

@pytest.mark.asyncio
async def test_get_chat_history():
    mock_conn = AsyncMock()
    mock_conn.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_records = [
        {"user_id": "user1", "message": "消息1", "created_at": datetime.now()},
        {"user_id": "user1", "message": "消息2", "created_at": datetime.now()}
    ]
    mock_conn.fetch = AsyncMock(return_value=mock_records)
    
    service = ChatService()
    with patch('python_backend.services.chat_service.get_postgres_conn', return_value=mock_conn):
        result = await service.get_chat_history("user1")
        
        # 验证数据库调用
        mock_conn.fetch.assert_called_once_with(
            "SELECT * FROM chats WHERE user_id = $1 ORDER BY created_at DESC",
            "user1"
        )
    # 验证返回结果
    assert len(result) == 2
    assert result[0]["message"] == "消息1"

@pytest.mark.asyncio
async def test_handle_disconnect():
    service = ChatService()
    mock_websocket = object()
    service.active_connections[mock_websocket] = "user1"
    
    await service.handle_disconnect(mock_websocket)
    assert mock_websocket not in service.active_connections
