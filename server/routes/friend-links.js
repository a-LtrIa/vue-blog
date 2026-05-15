import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import db from '../config/database.js'
import { normalizeDates, normalizeDatesArray } from '../utils/date.js'

const router = express.Router()

router.get('/', (req, res) => {
  const { status } = req.query

  let sql = 'SELECT * FROM friend_links'
  const conditions = []
  const params = []

  if (status) {
    conditions.push('status = ?')
    params.push(status)
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ')
  }

  sql += ' ORDER BY sort_order ASC, created_at DESC'

  const links = db.prepare(sql).all(...params)
  res.json(normalizeDatesArray(links))
})

router.get('/:id', (req, res) => {
  const link = db.prepare('SELECT * FROM friend_links WHERE id = ?').get(req.params.id)

  if (!link) {
    return res.status(404).json({ error: '友情链接不存在' })
  }

  res.json(normalizeDates(link))
})

router.post('/', authMiddleware, (req, res) => {
  const { name, url, icon = '', description = '', sort_order = 0, status = 'published' } = req.body

  if (!name || !url) {
    return res.status(400).json({ error: '名称和链接不能为空' })
  }

  const result = db.prepare(`
    INSERT INTO friend_links (name, url, icon, description, sort_order, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, url, icon, description, sort_order, status)

  res.status(201).json({ id: result.lastInsertRowid, message: '友情链接创建成功' })
})

router.put('/:id', authMiddleware, (req, res) => {
  const link = db.prepare('SELECT * FROM friend_links WHERE id = ?').get(req.params.id)
  if (!link) {
    return res.status(404).json({ error: '友情链接不存在' })
  }

  const { name, url, icon, description, sort_order, status } = req.body

  db.prepare(`
    UPDATE friend_links
    SET name = COALESCE(?, name),
        url = COALESCE(?, url),
        icon = COALESCE(?, icon),
        description = COALESCE(?, description),
        sort_order = COALESCE(?, sort_order),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, url, icon, description, sort_order, status, req.params.id)

  res.json({ message: '友情链接更新成功' })
})

router.delete('/:id', authMiddleware, (req, res) => {
  const link = db.prepare('SELECT * FROM friend_links WHERE id = ?').get(req.params.id)
  if (!link) {
    return res.status(404).json({ error: '友情链接不存在' })
  }

  db.prepare('DELETE FROM friend_links WHERE id = ?').run(req.params.id)
  res.json({ message: '友情链接删除成功' })
})

export default router