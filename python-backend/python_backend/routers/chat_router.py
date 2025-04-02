from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from services.chat_service import ChatService
from typing import Dict, Any

router = APIRouter(prefix="/api/chats", tags=["chats"])
service = ChatService()

@router.websocket("/ws")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            if data["type"] == "message":
                response = await service.handle_message(
                    user_id=data["user_id"],
                    message=data["content"],
                    referenced_node=data.get("node_id")
                )
                await websocket.send_json(response)
    except WebSocketDisconnect:
        await service.handle_disconnect(websocket)
