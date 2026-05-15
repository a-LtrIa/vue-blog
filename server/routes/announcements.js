import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import db from '../config/database.js'
import { normalizeDates, normalizeDatesArray } from '../utils/date.js'

const router = express.Router()

router.get('/', (req, res) => {
  const { status } = req.query

  let sql = 'SELECT * FROM announcements'
  const conditions = []
  const params = []

  if (status) {
    conditions.push('status = ?')
    params.push(status)
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ')
  }

  sql += ' ORDER BY created_at DESC'

  const announcements = db.prepare(sql).all(...params)
  res.json(normalizeDatesArray(announcements))
})

router.get('/:id', (req, res) => {
  const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id)

  if (!announcement) {
    return res.status(404).json({ error: '公告不存在' })
  }

  res.json(normalizeDates(announcement))
})

router.post('/', authMiddleware, (req, res) => {
  const { title = '', content, sort_order = 0, status = 'published' } = req.body

  if (!content) {
    return res.status(400).json({ error: '公告内容不能为空' })
  }

  const result = db.prepare(`
    INSERT INTO announcements (title, content, sort_order, status)
    VALUES (?, ?, ?, ?)
  `).run(title, content, sort_order, status)

  res.status(201).json({ id: result.lastInsertRowid, message: '公告创建成功' })
})

router.put('/:id', authMiddleware, (req, res) => {
  const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id)
  if (!announcement) {
    return res.status(404).json({ error: '公告不存在' })
  }

  const { title, content, sort_order, status } = req.body

  db.prepare(`
    UPDATE announcements
    SET title = COALESCE(?, title),
        content = COALESCE(?, content),
        sort_order = COALESCE(?, sort_order),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, content, sort_order, status, req.params.id)

  res.json({ message: '公告更新成功' })
})

router.delete('/:id', authMiddleware, (req, res) => {
  const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id)
  if (!announcement) {
    return res.status(404).json({ error: '公告不存在' })
  }

  db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id)
  res.json({ message: '公告删除成功' })
})

export default router
