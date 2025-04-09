import pytest
from unittest.mock import AsyncMock, patch, ANY
from datetime import datetime
from python_backend.services.chat_service import ChatService

@pytest.mark.asyncio
async def test_handle_message():
    """测试处理带节点引用的消息
    
    验证点：
    1. 正确调用LLM服务
    2. 数据库调用次数和参数正确
    3. 返回结果格式正确
    """
    mock_conn = AsyncMock()
    mock_conn.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_conn.execute = AsyncMock()
    
    # 模拟LLM返回
    mock_llm = AsyncMock()
    mock_llm.generate_response = AsyncMock(return_value="这是LLM生成的回复")

    service = ChatService(llm_service=mock_llm)
    with patch('python_backend.services.chat_service.get_postgres_conn', return_value=mock_conn):
        result = await service.handle_message("user1", "测试消息", "node1")
        
        # 验证数据库调用
        assert mock_conn.execute.call_count == 2
        # 验证用户消息被正确保存
        mock_conn.execute.assert_any_call(
            """INSERT INTO chats(user_id, message, node_reference, created_at, is_ai)
                VALUES($1, $2, $3, $4, $5)""",
            "user1", "测试消息", "node1", ANY, False
        )
        mock_conn.execute.assert_any_call(
            """INSERT INTO chats(user_id, message, node_reference, created_at, is_ai)
                VALUES($1, $2, $3, $4, $5)""",
            "user1", "这是LLM生成的回复\n(关联节点: node1)", "node1", ANY, True
        )
    
    # 验证返回结果
    assert result["type"] == "message"
    assert "这是LLM生成的回复" in result["content"]
    assert "node1" in result["content"]

@pytest.mark.asyncio
async def test_handle_message_without_reference():
    """测试处理不带节点引用的消息
    
    验证点：
    1. 正确调用LLM服务
    2. 数据库调用次数和参数正确
    3. 返回结果格式正确
    """
    mock_conn = AsyncMock()
    mock_conn.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_conn.execute = AsyncMock()
    
    # 模拟LLM返回
    mock_llm = AsyncMock()
    mock_llm.generate_response = AsyncMock(return_value="这是LLM生成的回复")

    service = ChatService(llm_service=mock_llm)
    with patch('python_backend.services.chat_service.get_postgres_conn', return_value=mock_conn):
        result = await service.handle_message("user1", "测试消息")
        
        # 验证数据库调用
        assert mock_conn.execute.call_count == 2
        # 验证用户消息被正确保存
        mock_conn.execute.assert_any_call(
            """INSERT INTO chats(user_id, message, node_reference, created_at, is_ai)
                VALUES($1, $2, $3, $4, $5)""",
            "user1", "测试消息", None, ANY, False
        )
        mock_conn.execute.assert_any_call(
            """INSERT INTO chats(user_id, message, node_reference, created_at, is_ai)
                VALUES($1, $2, $3, $4, $5)""",
            "user1", "这是LLM生成的回复", None, ANY, True
        )
    
    # 验证返回结果
    assert result["type"] == "message"
    assert "这是LLM生成的回复" in result["content"]

@pytest.mark.asyncio
async def test_get_chat_history():
    """测试获取聊天历史记录
    
    验证点：
    1. 正确查询数据库
    2. 返回结果格式正确
    """
    mock_conn = AsyncMock()
    mock_conn.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_records = [
        {"user_id": "user1", "message": "消息1", "created_at": datetime.now()},
        {"user_id": "user1", "message": "消息2", "created_at": datetime.now()}
    ]
    mock_conn.fetch = AsyncMock(return_value=mock_records)
    
    service = ChatService(llm_service=AsyncMock())
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
    """测试处理断开连接
    
    验证点：
    1. 正确从活动连接中移除
    """
    service = ChatService(llm_service=AsyncMock())
    mock_websocket = object()
    service.active_connections[mock_websocket] = "user1"
    
    await service.handle_disconnect(mock_websocket)
    assert mock_websocket not in service.active_connections

@pytest.mark.asyncio
async def test_handle_message_with_llm_error():
    """测试LLM服务出错时的处理
    
    验证点：
    1. 错误被正确处理
    2. 返回错误信息
    """
    mock_conn = AsyncMock()
    mock_conn.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_conn.execute = AsyncMock()
    
    # 模拟LLM抛出异常
    mock_llm = AsyncMock()
    mock_llm.generate_response = AsyncMock(side_effect=Exception("LLM服务错误"))

    service = ChatService(llm_service=mock_llm)
    with patch('python_backend.services.chat_service.get_postgres_conn', return_value=mock_conn):
        result = await service.handle_message("user1", "测试消息")
        
        # 验证数据库调用
        assert mock_conn.execute.call_count == 2
    
    # 验证返回结果包含错误信息
    assert result["type"] == "message"
    assert "生成回复时出错" in result["content"]
