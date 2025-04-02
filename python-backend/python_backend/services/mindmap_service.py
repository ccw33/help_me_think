from python_backend.app.database import mongo_db
from python_backend.models.mindmap import MindMap, MindMapNode, MindMapLink
from typing import Optional, Dict, Any
from bson import ObjectId

class MindMapService:
    def __init__(self):
        self.collection = mongo_db["mindmaps"]

    async def create_mindmap(self, data: Dict[str, Any]) -> Dict[str, str]:
        # 强制使用字符串ID
        if "_id" not in data:
            from datetime import datetime
            data["_id"] = f"mindmap_{datetime.now().timestamp()}"
        result = self.collection.insert_one(data)
        return {"id": data["_id"]}

    async def get_mindmap(self, mindmap_id: str) -> Optional[Dict[str, Any]]:
        # 直接使用字符串ID查询
        query = {"_id": mindmap_id}
            
        doc = self.collection.find_one(query)
        if not doc:
            return None
        
        # Convert MongoDB document to dict directly
        doc["id"] = str(doc["_id"])
        return doc

    async def update_mindmap(self, mindmap_id: str, data: Dict[str, Any]) -> bool:
        result = self.collection.update_one(
            {"_id": mindmap_id},
            {"$set": data}
        )
        return result.modified_count > 0
