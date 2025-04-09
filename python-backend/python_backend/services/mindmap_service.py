from python_backend.app.database import mongo_db
from python_backend.models.mindmap import MindMap, MindMapNode, MindMapLink
from typing import Optional, Dict, Any
from bson import ObjectId

class MindMapService:
    def __init__(self):
        self.collection = mongo_db["mindmaps"]

    def create_mindmap(self, data: Dict[str, Any]) -> Dict[str, str]:
        try:
            # 生成新的ID
            from datetime import datetime
            import time
            mindmap_id = f"mindmap_{int(time.time() * 1000)}"  # 更精确的时间戳
            
            # 确保数据包含必要字段
            if not all(key in data for key in ["nodes", "links"]):
                raise ValueError("Missing required fields: nodes and links")
                
            data_with_id = {"_id": mindmap_id, **data}
            
            # 插入数据
            result = self.collection.insert_one(data_with_id)
            self.collection.find_one({"_id": mindmap_id})  # 确保数据已写入
            
            if not result.acknowledged:
                raise Exception("Database operation not acknowledged")
                
            return {"id": mindmap_id}
        except Exception as e:
            print(f"Error in create_mindmap: {str(e)}")
            raise

    def get_mindmap(self, mindmap_id: str) -> Optional[Dict[str, Any]]:
        # 直接使用字符串ID查询
        query = {"_id": mindmap_id}
            
        doc = self.collection.find_one(query)
        if not doc:
            return None
        
        # 返回完整文档结构
        return {
            "id": str(doc["_id"]),
            "nodes": doc.get("nodes", []),
            "links": doc.get("links", [])
        }

    def update_mindmap(self, mindmap_id: str, data: Dict[str, Any]) -> bool:
        result = self.collection.update_one(
            {"_id": mindmap_id},
            {"$set": data}
        )
        return result.modified_count > 0
