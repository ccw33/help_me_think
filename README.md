# help_me_think
一个互动式帮助思考的llm思维导图聊天工具

## 开发环境准备

1. 确保已安装:
   - Docker
   - Node.js (前端)
   - Python 3.8+ (后端)

## 启动项目

```bash
# 启动后端服务
cd python-backend
docker-compose up -d
python main.py

# 启动前端服务
cd vue-frontend
npm install
npm run dev
```

## 数据库操作

```bash
# 进入PostgreSQL容器
docker exec -it $(docker ps -qf "name=postgres") psql -U thinkuser -d thinkdb

# 常用命令
\dt - 查看所有表
SELECT * FROM chats LIMIT 10; - 查看最近10条聊天记录
```

## 项目结构
- python-backend: 后端服务
- vue-frontend: 前端界面
- output: 生成的文件
