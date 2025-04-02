from fastapi import APIRouter, HTTPException
from python_backend.services.mindmap_service import MindMapService
from python_backend.models.mindmap import MindMap
from typing import Dict, Any

router = APIRouter(prefix="/api/mindmaps", tags=["mindmaps"])
service = MindMapService()

@router.post("/")
async def create_mindmap(data: Dict[str, Any]):
    try:
        result = await service.create_mindmap(data)
        return {"message": "MindMap saved successfully", "id": result["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{mindmap_id}")
async def get_mindmap(mindmap_id: str):
    mindmap = await service.get_mindmap(mindmap_id)
    if not mindmap:
        raise HTTPException(status_code=404, detail="Mindmap not found")
    return mindmap
