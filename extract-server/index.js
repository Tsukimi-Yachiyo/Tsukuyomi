const express = require('express');
const cors = require('cors');
const axios = require('axios');
const AdmZip = require('adm-zip');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3200;

// 静态资源目录：可通过环境变量配置
// 生产环境建议设为 Nginx 能直接 serve 的路径，如 /var/www/zip-static
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, 'static');
if (!fs.existsSync(STATIC_DIR)) fs.mkdirSync(STATIC_DIR, { recursive: true });

app.use(cors());
app.use(express.json());

// 本地开发时 serve 静态文件（生产环境由 Nginx 直接 serve）
if (process.env.NODE_ENV !== 'production') {
  app.use('/static', express.static(STATIC_DIR, {
    setHeaders: (res, filePath) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
      if (filePath.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm');
      if (filePath.endsWith('.json')) res.setHeader('Content-Type', 'application/json');
    }
  }));
}

/**
 * POST /api/extract
 * Body: { "url": "https://example.com/file.zip" }
 * Response: { "url": "/static/abc123/index.html", "id": "abc123" }
 */
app.post('/api/extract', async (req, res) => {
  try {
    let { url } = req.body;
    if (!url) return res.status(400).json({ error: '缺少 url 参数' });

    // 相对路径拼接完整 URL
    if (url.startsWith('/')) {
      // 优先用环境变量指定的后端地址，否则用请求的 Host
      const base = process.env.BACKEND_URL;
      if (base) {
        url = `${base}${url}`;
      } else {
        const proto = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers.host || 'localhost';
        url = `${proto}://${host}${url}`;
      }
    }

    // 用 URL 的 hash 作为目录名（相同 URL 不重复解压）
    const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 12);
    const extractDir = path.join(STATIC_DIR, hash);

    // 已解压过，直接返回
    if (fs.existsSync(extractDir)) {
      const entryFile = findEntryFile(extractDir);
      return res.json({ url: `/static/${hash}/${entryFile}`, id: hash, cached: true });
    }

    // 下载 ZIP
    console.log(`[extract] downloading: ${url}`);
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
    const zipBuffer = Buffer.from(response.data);

    // 解压
    console.log(`[extract] extracting to: ${extractDir}`);
    const zip = new AdmZip(zipBuffer);
    zip.extractAllTo(extractDir, true);

    const entryFile = findEntryFile(extractDir);
    console.log(`[extract] done: /static/${hash}/${entryFile}`);

    res.json({ url: `/static/${hash}/${entryFile}`, id: hash, cached: false });
  } catch (err) {
    console.error('[extract] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/extract/check?url=xxx
 * 检查某个 URL 是否已解压
 */
app.get('/api/extract/check', (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: '缺少 url 参数' });

  const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 12);
  const extractDir = path.join(STATIC_DIR, hash);

  if (fs.existsSync(extractDir)) {
    const entryFile = findEntryFile(extractDir);
    return res.json({ url: `/static/${hash}/${entryFile}`, id: hash, cached: true });
  }
  res.json({ cached: false });
});

/**
 * DELETE /api/extract/:id
 * 删除已解压的资源
 */
app.delete('/api/extract/:id', (req, res) => {
  const dir = path.join(STATIC_DIR, req.params.id);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    return res.json({ deleted: true });
  }
  res.status(404).json({ error: 'not found' });
});

/** 查找解压目录中的入口 HTML 文件 */
function findEntryFile(dir) {
  const files = getAllFiles(dir);
  const relativeFiles = files.map(f => path.relative(dir, f).replace(/\\/g, '/'));
  const indexFile = relativeFiles.find(f => f.endsWith('index.html'));
  if (indexFile) return indexFile;
  const htmlFile = relativeFiles.find(f => f.endsWith('.html') || f.endsWith('.htm'));
  if (htmlFile) return htmlFile;
  throw new Error('ZIP 中未找到 HTML 文件');
}

function getAllFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) getAllFiles(fullPath, files);
    else files.push(fullPath);
  }
  return files;
}

app.listen(PORT, () => {
  console.log(`[zip-extract-server] http://localhost:${PORT}`);
  console.log(`[zip-extract-server] static: ${STATIC_DIR}`);
});
