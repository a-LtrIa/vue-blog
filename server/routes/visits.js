import express from 'express'
import db from '../config/database.js'
import { getChinaDate } from '../utils/date.js'

const router = express.Router()

const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.connection?.remoteAddress
    || req.socket?.remoteAddress
    || '127.0.0.1'
}

router.post('/', (req, res) => {
  const today = getChinaDate()
  const ip = getClientIP(req)

  const alreadyVisited = db.prepare(
    'SELECT id FROM visit_ips WHERE date = ? AND ip = ?'
  ).get(today, ip)

  if (alreadyVisited) {
    return res.json({ success: true, counted: false })
  }

  db.prepare('INSERT OR IGNORE INTO visit_ips (date, ip) VALUES (?, ?)').run(today, ip)

  const existing = db.prepare('SELECT id, count FROM visits WHERE date = ?').get(today)

  if (existing) {
    db.prepare('UPDATE visits SET count = count + 1 WHERE date = ?').run(today)
  } else {
    db.prepare('INSERT INTO visits (date, count) VALUES (?, 1)').run(today)
  }

  res.json({ success: true, counted: true })
})

router.get('/stats', (req, res) => {
  const dates = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const chinaTime = new Date(d.getTime() + 8 * 60 * 60 * 1000)
    dates.push(chinaTime.toISOString().split('T')[0])
  }

  const dailyData = dates.map(date => {
    const row = db.prepare('SELECT count FROM visits WHERE date = ?').get(date)
    return { date, count: row ? row.count : 0 }
  })

  const totalRow = db.prepare('SELECT SUM(count) as total FROM visits').get()
  const total = totalRow ? totalRow.total || 0 : 0

  res.json({ daily: dailyData, total })
})

export default router
