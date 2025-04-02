from app.database import mongo_db
from typing import Optional, Dict, Any

class MindMapService:
    def __init__(self):
        self.collection = mongo_db["mindmaps"]

    async def create_mindmap(self, data: Dict[str, Any]) -> str:
        result = self.collection.insert_one(data)
        return str(result.inserted_id)

    async def get_mindmap(self, mindmap_id: str) -> Optional[Dict[str, Any]]:
        return self.collection.find_one({"_id": mindmap_id})

    async def update_mindmap(self, mindmap_id: str, data: Dict[str, Any]) -> bool:
        result = self.collection.update_one(
            {"_id": mindmap_id},
            {"$set": data}
        )
        return result.modified_count > 0
