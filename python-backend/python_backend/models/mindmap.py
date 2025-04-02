from pydantic import BaseModel
from typing import List, Dict, Optional

class MindMapNode(BaseModel):
    key: int
    text: str
    color: str

class MindMapLink(BaseModel):
    from_: int
    to: int

class MindMap(BaseModel):
    nodes: List[MindMapNode]
    links: List[MindMapLink]
    id: Optional[str] = None
