# ZIP 解压服务部署指南

## 架构

```
浏览器 → Nginx → Vue 前端 (dist)
              → /api/extract → Node.js (port 3200) → 解压到 /var/www/zip-static/
              → /static/*    → Nginx 直接 serve 解压文件
              → /api/*       → 原后端 (211.101.237.141:8881)
```

## 服务器部署

### 1. 上传项目到服务器

```bash
# 在本地打包
scp -r extract-server/ user@your-server:/var/www/extract-server/
scp -r vue/dist/ user@your-server:/var/www/yachiyo/
```

### 2. 部署解压服务

```bash
# 在服务器上
cd /var/www/extract-server
npm install --production

# 创建 systemd 服务
sudo cp extract-server.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable extract-server
sudo systemctl start extract-server

# 检查状态
sudo systemctl status extract-server
curl http://localhost:3200/api/extract/check?url=test
```

### 3. 部署 Nginx 配置

```bash
# 复制 nginx 配置
sudo cp nginx.conf /etc/nginx/sites-available/yachiyo
sudo ln -sf /etc/nginx/sites-available/yachiyo /etc/nginx/sites-enabled/
sudo nginx -t          # 测试配置
sudo nginx -s reload   # 重载
```

### 4. 更新前端

```bash
# 重新构建
cd vue && npm run build

# 上传 dist
scp -r dist/* user@your-server:/var/www/yachiyo/
```

## 本地开发

```bash
# 终端 1: 启动解压服务
cd extract-server && npm start

# 终端 2: 启动前端
cd vue && npm run dev
```

## 接口说明

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/extract` | POST | 解压 ZIP，返回 `{url, id, cached}` |
| `/api/extract/check?url=xxx` | GET | 检查是否已解压 |
| `/api/extract/:id` | DELETE | 删除解压资源 |
