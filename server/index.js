import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'

import authRoutes from './routes/auth.js'
import postsRoutes from './routes/posts.js'
import categoriesRoutes from './routes/categories.js'
import tagsRoutes from './routes/tags.js'
import settingsRoutes from './routes/settings.js'
import uploadRoutes from './routes/upload.js'
import backgroundRoutes, { ensureCache, startScheduler } from './routes/background.js'
import visitsRoutes from './routes/visits.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dataDir = join(__dirname, 'data')
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(join(__dirname, 'uploads')))
app.use('/cache/backgrounds', express.static(join(__dirname, 'cache', 'backgrounds')))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/tags', tagsRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/background', backgroundRoutes)
app.use('/api/visits', visitsRoutes)

app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: '服务器内部错误' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
  console.log(`📚 API available at http://localhost:${PORT}/api`)
  ensureCache().then(() => {
    console.log(`🖼️ Background images cached`)
    startScheduler()
  }).catch(err => {
    console.error('Failed to cache background images:', err.message)
    startScheduler()
  })
})
