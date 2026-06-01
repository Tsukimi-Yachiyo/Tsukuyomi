#!/bin/bash
# 整体部署脚本（前端 + 解压服务）
# 用法: bash deploy.sh user@your-server

set -e

SERVER=${1:-"root@your-server"}
FRONTEND_DIR="/var/www/yachiyo"
EXTRACT_DIR="/var/www/extract-server"
STATIC_DIR="/var/www/zip-static"

echo "=== 1. 构建前端 ==="
cd vue
npm run build
cd ..

echo "=== 2. 上传前端 ==="
ssh $SERVER "mkdir -p $FRONTEND_DIR"
scp -r vue/dist/* $SERVER:$FRONTEND_DIR/

echo "=== 3. 上传解压服务 ==="
ssh $SERVER "mkdir -p $EXTRACT_DIR $STATIC_DIR"
scp extract-server/index.js extract-server/package.json $SERVER:$EXTRACT_DIR/

echo "=== 4. 安装依赖并重启服务 ==="
ssh $SERVER "cd $EXTRACT_DIR && npm install --production"
ssh $SERVER "cp $EXTRACT_DIR/extract-server.service /etc/systemd/system/ 2>/dev/null || true"
ssh $SERVER "systemctl daemon-reload && systemctl restart extract-server"

echo "=== 5. 重载 Nginx ==="
ssh $SERVER "nginx -t && nginx -s reload"

echo ""
echo "部署完成！"
echo "  前端: $FRONTEND_DIR"
echo "  解压: $EXTRACT_DIR"
echo "  静态: $STATIC_DIR"
