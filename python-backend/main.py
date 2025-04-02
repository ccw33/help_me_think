from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import mindmap_router, chat_router
import uvicorn

app = FastAPI()

# 添加跨域支持
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含路由
app.include_router(mindmap_router.router)
app.include_router(chat_router.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
