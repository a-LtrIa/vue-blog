import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import db from '../config/database.js'
import { normalizeDates, normalizeDatesArray } from '../utils/date.js'

const router = express.Router()

router.get('/', (req, res) => {
  const { status, category } = req.query

  let sql = 'SELECT * FROM tools'
  const conditions = []
  const params = []

  if (status) {
    conditions.push('status = ?')
    params.push(status)
  }

  if (category) {
    conditions.push('category = ?')
    params.push(category)
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ')
  }

  sql += ' ORDER BY sort_order ASC, created_at DESC'

  const tools = db.prepare(sql).all(...params)
  res.json(normalizeDatesArray(tools))
})

router.get('/stats', (req, res) => {
  const totalRow = db.prepare('SELECT COUNT(*) as total FROM tools').get()
  const publishedRow = db.prepare("SELECT COUNT(*) as total FROM tools WHERE status = 'published'").get()

  const categoryStats = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM tools
    GROUP BY category
    ORDER BY count DESC
  `).all()

  res.json({
    totalTools: totalRow.total,
    publishedTools: publishedRow.total,
    categoryStats
  })
})

router.get('/:id', (req, res) => {
  const tool = db.prepare('SELECT * FROM tools WHERE id = ?').get(req.params.id)

  if (!tool) {
    return res.status(404).json({ error: '工具不存在' })
  }

  res.json(normalizeDates(tool))
})

router.post('/', authMiddleware, (req, res) => {
  const { name, description, url, icon, category, sort_order = 0, status = 'published' } = req.body

  if (!name) {
    return res.status(400).json({ error: '工具名称不能为空' })
  }

  const result = db.prepare(`
    INSERT INTO tools (name, description, url, icon, category, sort_order, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, description, url, icon, category, sort_order, status)

  res.status(201).json({ id: result.lastInsertRowid, message: '工具创建成功' })
})

router.put('/:id', authMiddleware, (req, res) => {
  const tool = db.prepare('SELECT * FROM tools WHERE id = ?').get(req.params.id)
  if (!tool) {
    return res.status(404).json({ error: '工具不存在' })
  }

  const { name, description, url, icon, category, sort_order, status } = req.body

  db.prepare(`
    UPDATE tools
    SET name = COALESCE(?, name),
        description = COALESCE(?, description),
        url = COALESCE(?, url),
        icon = COALESCE(?, icon),
        category = COALESCE(?, category),
        sort_order = COALESCE(?, sort_order),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, description, url, icon, category, sort_order, status, req.params.id)

  res.json({ message: '工具更新成功' })
})

router.delete('/:id', authMiddleware, (req, res) => {
  const tool = db.prepare('SELECT * FROM tools WHERE id = ?').get(req.params.id)
  if (!tool) {
    return res.status(404).json({ error: '工具不存在' })
  }

  db.prepare('DELETE FROM tools WHERE id = ?').run(req.params.id)
  res.json({ message: '工具删除成功' })
})

export default router