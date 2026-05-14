import express from 'express'
import db from '../config/database.js'

const router = express.Router()

router.post('/', (req, res) => {
  const today = new Date().toISOString().split('T')[0]

  const existing = db.prepare('SELECT id, count FROM visits WHERE date = ?').get(today)

  if (existing) {
    db.prepare('UPDATE visits SET count = count + 1 WHERE date = ?').run(today)
  } else {
    db.prepare('INSERT INTO visits (date, count) VALUES (?, 1)').run(today)
  }

  res.json({ success: true })
})

router.get('/stats', (req, res) => {
  const dates = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
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
