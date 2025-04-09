from python_backend.app.database import get_postgres_conn
from typing import Dict, Any, Optional
from datetime import datetime
import json
from python_backend.services.llm_service import LLMService

class ChatService:
    def __init__(self, llm_service: LLMService):
        self.active_connections = {}
        self.llm_service = llm_service

    async def handle_message(self, user_id: str, message: str, node_reference: Optional[str] = None) -> Dict[str, Any]:
        async with get_postgres_conn() as conn:
            # 保存用户消息到数据库
            await conn.execute(
                """INSERT INTO chats(user_id, message, node_reference, created_at, is_ai)
                VALUES($1, $2, $3, $4, $5)""",
                user_id, message, node_reference, datetime.now(), False
            )
            
            # 生成LLM回复
            messages = [{
                "role": "user",
                "content": message
            }]
            
            try:
                ai_response = await self.llm_service.generate_response(messages)
                if node_reference:
                    ai_response += f"\n(关联节点: {node_reference})"
            except Exception as e:
                ai_response = f"生成回复时出错: {str(e)}"
            
            # 保存AI回复到数据库
            await conn.execute(
                """INSERT INTO chats(user_id, message, node_reference, created_at, is_ai)
                VALUES($1, $2, $3, $4, $5)""",
                user_id, ai_response, node_reference, datetime.now(), True
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
