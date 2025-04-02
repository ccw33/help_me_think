from python_backend.app.database import get_postgres_conn
from typing import Dict, Any, Optional
from datetime import datetime
import json

class ChatService:
    def __init__(self):
        self.active_connections = {}

    async def handle_message(self, user_id: str, message: str, referenced_node: Optional[str] = None) -> Dict[str, Any]:
        async with get_postgres_conn() as conn:
            # 保存消息到数据库
            await conn.execute(
                """INSERT INTO chats(user_id, message, node_reference, created_at)
                VALUES($1, $2, $3, $4)""",
                user_id, message, referenced_node, datetime.now()
            )
            
            # 生成LLM回复 (TODO: 实际集成LLM)
            ai_response = f"已收到您的消息: {message}"
            if referenced_node:
                ai_response += f"\n(关联节点: {referenced_node})"
            
            # 保存AI回复
            await conn.execute(
                """INSERT INTO chats(user_id, message, is_ai, created_at)
                VALUES($1, $2, $3, $4)""",
                user_id, ai_response, True, datetime.now()
            )
            
            return {
                "type": "message",
                "content": ai_response,
                "timestamp": datetime.now().isoformat()
            }

    async def handle_disconnect(self, websocket):
        if websocket in self.active_connections:
            user_id = self.active_connections.pop(websocket)
            print(f"用户 {user_id} 断开连接")

    async def get_chat_history(self, user_id: str) -> Optional[Dict[str, Any]]:
        async with get_postgres_conn() as conn:
            return await conn.fetch(
                "SELECT * FROM chats WHERE user_id = $1 ORDER BY created_at DESC",
                user_id
            )
