# help_me_think
一个互动式帮助思考的LLM思维导图聊天工具

## 开发环境准备

1. 确保已安装:
   - Docker
   - Node.js 18+ (前端)
   - Python 3.10+ (后端)
   - Redis (用于消息队列)

2. 环境变量配置
   复制 .env.example 为 .env 并配置以下内容：
   - OPENAI_API_KEY: OpenAI API密钥
   - MONGO_URI: MongoDB连接字符串
   - REDIS_URL: Redis连接URL

## 启动项目

```bash
# 启动后端服务
cd python-backend
pip install -r requirements.txt
pytest tests/  # 运行测试
uvicorn python_backend.app.main:app --reload

# 启动前端服务
cd vue-frontend
npm install
npm run dev
```

## 测试说明

1. 后端测试
```bash
cd python-backend
pytest tests/
```

2. 前端测试
```bash
cd vue-frontend
npm test
```

## 项目结构
- python-backend: 后端服务
  - app: 核心业务逻辑
  - models: 数据模型
  - routers: API路由
  - services: 业务服务
  - tests: 单元测试
- vue-frontend: 前端界面
  - src/components: Vue组件
  - src/stores: 状态管理
  - tests/unit: 单元测试
- data: 数据文件
- output: 生成的文件
