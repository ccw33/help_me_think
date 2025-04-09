from fastapi import APIRouter, HTTPException
from python_backend.services.mindmap_service import MindMapService
from python_backend.models.mindmap import MindMap
from typing import Dict, Any

router = APIRouter(prefix="/api/mindmaps", tags=["mindmaps"])
service = MindMapService()

@router.post("", status_code=200)
def create_mindmap(data: Dict[str, Any]):
    try:
        result = service.create_mindmap(data)
        print(f"Service result: {result}")  # 添加调试日志
        if not result or "id" not in result:
            raise HTTPException(status_code=500, detail="Failed to create mindmap")
        return {"id": result["id"]}
    except Exception as e:
        print(f"Error creating mindmap: {str(e)}")  # 添加错误日志
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{mindmap_id}")
def get_mindmap(mindmap_id: str):
    mindmap = service.get_mindmap(mindmap_id)
    if not mindmap:
        raise HTTPException(status_code=404, detail="Mindmap not found")
    return mindmap
