const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const app = express()
const PORT = 3210
const DATA_FILE = path.join(__dirname, 'data.json')

app.use(cors())
app.use(express.json())

function readCount() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')).count || 0
  } catch {
    return 0
  }
}

function writeCount(count) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ count }))
}

// GET /api/support — read current count
app.get('/api/support', (_req, res) => {
  res.json({ count: readCount() })
})

// POST /api/support — increment count
app.post('/api/support', (_req, res) => {
  const count = readCount() + 1
  writeCount(count)
  res.json({ count })
})

app.listen(PORT, () => {
  console.log(`Counter server running on http://localhost:${PORT}`)
})
