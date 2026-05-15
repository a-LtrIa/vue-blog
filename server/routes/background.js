import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync, mkdirSync, readdirSync, unlinkSync, createWriteStream, readFileSync, writeFileSync, statSync } from 'fs'
import https from 'https'
import http from 'http'
import crypto from 'crypto'
import { getChinaDateString } from '../utils/date.js'
import db from '../config/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const router = express.Router()

const CACHE_DIR = join(__dirname, '..', 'cache', 'backgrounds')
const META_FILE = join(CACHE_DIR, 'meta.json')
const IMAGE_COUNT = 10
const LOLIAPI_URL = 'https://www.loliapi.com/acg/'

const TRAFFIC_CONFIG = [
  { level: 'high', minAvgVisits: 50, intervalMinutes: 120 },
  { level: 'medium', minAvgVisits: 10, intervalMinutes: 360 },
  { level: 'low', minAvgVisits: 1, intervalMinutes: 720 },
  { level: 'none', minAvgVisits: 0, intervalMinutes: 0 }
]

const CHECK_INTERVAL_MS = 10 * 60 * 1000

const ensureCacheDir = () => {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true })
  }
}

const getToday = () => {
  return getChinaDateString()
}

const getTrafficLevel = () => {
  try {
    const rows = db.prepare(`
      SELECT date, count FROM visits
      WHERE date >= date('now', '-7 days')
      ORDER BY date DESC
    `).all()

    if (rows.length === 0) return 'none'

    const totalVisits = rows.reduce((sum, r) => sum + r.count, 0)
    const avgVisits = totalVisits / 7

    for (const config of TRAFFIC_CONFIG) {
      if (avgVisits >= config.minAvgVisits) {
        return config.level
      }
    }
    return 'none'
  } catch {
    return 'none'
  }
}

const getRefreshInterval = () => {
  const level = getTrafficLevel()
  const config = TRAFFIC_CONFIG.find(c => c.level === level)
  return config ? config.intervalMinutes * 60 * 1000 : 0
}

const isCacheStale = () => {
  if (!existsSync(META_FILE)) return true
  try {
    const meta = JSON.parse(readFileSync(META_FILE, 'utf-8'))
    if (meta.count < IMAGE_COUNT) return true

    const interval = getRefreshInterval()
    if (interval === 0) return false

    const lastRefresh = meta.lastRefresh || meta.date
    const elapsed = Date.now() - new Date(lastRefresh).getTime()
    return elapsed > interval
  } catch {
    return true
  }
}

const clearCache = () => {
  ensureCacheDir()
  const files = readdirSync(CACHE_DIR)
  for (const file of files) {
    if (file !== 'meta.json') {
      unlinkSync(join(CACHE_DIR, file))
    }
  }
  if (existsSync(META_FILE)) {
    unlinkSync(META_FILE)
  }
}

const downloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const followRedirect = (currentUrl, redirectCount = 0) => {
      if (redirectCount > 10) {
        reject(new Error('Too many redirects'))
        return
      }

      const protocol = currentUrl.startsWith('https') ? https : http
      protocol.get(currentUrl, { headers: { 'Referer': 'https://www.loliapi.com/' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          followRedirect(res.headers.location, redirectCount + 1)
          return
        }

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`))
          return
        }

        const ext = '.jpg'
        const filename = `${crypto.randomUUID()}${ext}`
        const filepath = join(CACHE_DIR, filename)
        const stream = createWriteStream(filepath)

        res.pipe(stream)
        stream.on('finish', () => {
          stream.close()
          resolve(filename)
        })
        stream.on('error', reject)
      }).on('error', reject)
    }

    followRedirect(url)
  })
}

const saveMeta = (meta) => {
  writeFileSync(META_FILE, JSON.stringify(meta, null, 2))
}

const fetchAndCacheImages = async () => {
  ensureCacheDir()
  clearCache()

  const filenames = []
  const errors = []

  for (let i = 0; i < IMAGE_COUNT; i++) {
    try {
      const filename = await downloadImage(LOLIAPI_URL)
      filenames.push(filename)
    } catch (err) {
      console.error(`Failed to download image ${i + 1}:`, err.message)
      errors.push(err.message)
    }
  }

  if (filenames.length === 0) {
    throw new Error('Failed to download any images')
  }

  const meta = {
    date: getToday(),
    lastRefresh: new Date().toISOString(),
    count: filenames.length,
    files: filenames
  }
  saveMeta(meta)

  return meta
}

const getCachedMeta = () => {
  if (!existsSync(META_FILE)) return null
  try {
    return JSON.parse(readFileSync(META_FILE, 'utf-8'))
  } catch {
    return null
  }
}

let refreshPromise = null

const ensureCache = async () => {
  if (!isCacheStale()) return getCachedMeta()

  if (refreshPromise) return refreshPromise

  refreshPromise = fetchAndCacheImages().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

router.get('/random', async (req, res) => {
  try {
    const meta = await ensureCache()
    if (!meta || !meta.files || meta.files.length === 0) {
      return res.redirect(LOLIAPI_URL)
    }

    const randomFile = meta.files[Math.floor(Math.random() * meta.files.length)]
    res.json({
      url: `/cache/backgrounds/${randomFile}`,
      cached: true
    })
  } catch (error) {
    console.error('Background cache error:', error)
    res.json({
      url: LOLIAPI_URL,
      cached: false
    })
  }
})

router.get('/list', async (req, res) => {
  try {
    const meta = await ensureCache()
    if (!meta || !meta.files) {
      return res.json({ images: [], date: null, count: 0 })
    }

    const images = meta.files.map(filename => {
      const filepath = join(CACHE_DIR, filename)
      let size = 0
      let mtime = null
      try {
        const stats = statSync(filepath)
        size = stats.size
        mtime = stats.mtime
      } catch {}

      return {
        filename,
        url: `/cache/backgrounds/${filename}`,
        size,
        updatedAt: mtime
      }
    })

    res.json({
      images,
      date: meta.date,
      count: meta.count
    })
  } catch (error) {
    console.error('Background list error:', error)
    res.status(500).json({ error: '获取背景图片列表失败' })
  }
})

router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params

    if (filename.includes('/') || filename.includes('..') || filename === 'meta.json') {
      return res.status(400).json({ error: '无效的文件名' })
    }

    const meta = getCachedMeta()
    if (!meta || !meta.files.includes(filename)) {
      return res.status(404).json({ error: '图片不存在' })
    }

    const filepath = join(CACHE_DIR, filename)
    if (existsSync(filepath)) {
      unlinkSync(filepath)
    }

    meta.files = meta.files.filter(f => f !== filename)
    meta.count = meta.files.length
    saveMeta(meta)

    res.json({ message: '图片已删除', count: meta.count })
  } catch (error) {
    console.error('Background delete error:', error)
    res.status(500).json({ error: '删除图片失败' })
  }
})

router.post('/fetch', async (req, res) => {
  try {
    ensureCacheDir()

    const filename = await downloadImage(LOLIAPI_URL)

    let meta = getCachedMeta()
    if (!meta) {
      meta = { date: getToday(), lastRefresh: new Date().toISOString(), count: 0, files: [] }
    }
    meta.files.push(filename)
    meta.count = meta.files.length
    meta.lastRefresh = new Date().toISOString()
    if (meta.date !== getToday()) {
      meta.date = getToday()
    }
    saveMeta(meta)

    res.json({
      message: '已获取新图片',
      filename,
      url: `/cache/backgrounds/${filename}`,
      count: meta.count
    })
  } catch (error) {
    console.error('Background fetch error:', error)
    res.status(500).json({ error: '获取新图片失败' })
  }
})

router.post('/refresh', async (req, res) => {
  try {
    if (refreshPromise) {
      await refreshPromise
    }

    const meta = await fetchAndCacheImages()
    res.json({
      message: '背景图片缓存已刷新',
      count: meta.count,
      date: meta.date
    })
  } catch (error) {
    console.error('Background refresh error:', error)
    res.status(500).json({ error: '刷新背景图片缓存失败' })
  }
})

let schedulerTimer = null

const startScheduler = () => {
  if (schedulerTimer) clearInterval(schedulerTimer)

  const runCheck = async () => {
    const level = getTrafficLevel()
    if (level === 'none') {
      console.log(`[bg-scheduler] 无访问流量，跳过自动刷新`)
      return
    }

    if (isCacheStale()) {
      console.log(`[bg-scheduler] 流量等级: ${level}，缓存已过期，开始刷新...`)
      try {
        await fetchAndCacheImages()
        console.log(`[bg-scheduler] 刷新完成`)
      } catch (err) {
        console.error(`[bg-scheduler] 刷新失败:`, err.message)
      }
    } else {
      console.log(`[bg-scheduler] 流量等级: ${level}，缓存未过期，跳过`)
    }
  }

  schedulerTimer = setInterval(runCheck, CHECK_INTERVAL_MS)
  console.log(`[bg-scheduler] 调度器已启动，每 ${CHECK_INTERVAL_MS / 60000} 分钟检查一次`)
}

const stopScheduler = () => {
  if (schedulerTimer) {
    clearInterval(schedulerTimer)
    schedulerTimer = null
  }
}

export { ensureCache, startScheduler, stopScheduler }
export default router
