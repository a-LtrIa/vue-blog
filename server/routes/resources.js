import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import db from '../config/database.js'
import { normalizeDates, normalizeDatesArray } from '../utils/date.js'

const router = express.Router()

router.get('/', (req, res) => {
  const { page = 1, limit = 10, status, tag } = req.query
  const offset = (page - 1) * limit

  let sql = 'SELECT * FROM resources'
  const conditions = []
  const params = []

  if (status) {
    conditions.push('status = ?')
    params.push(status)
  }

  if (tag) {
    conditions.push('tag = ?')
    params.push(tag)
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ')
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(parseInt(limit), offset)

  const resources = db.prepare(sql).all(...params)

  let countSql = 'SELECT COUNT(*) as total FROM resources'
  const countParams = []

  if (status) {
    countSql += ' WHERE status = ?'
    countParams.push(status)
  }

  if (tag) {
    if (status) {
      countSql += ' AND tag = ?'
    } else {
      countSql += ' WHERE tag = ?'
    }
    countParams.push(tag)
  }

  const { total } = db.prepare(countSql).get(...countParams)

  res.json({
    resources: normalizeDatesArray(resources),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }
  })
})

router.get('/slug/:slug', (req, res) => {
  const resource = db.prepare('SELECT * FROM resources WHERE slug = ?').get(req.params.slug)

  if (!resource) {
    return res.status(404).json({ error: '资源不存在' })
  }

  db.prepare('UPDATE resources SET view_count = view_count + 1 WHERE id = ?').run(resource.id)

  res.json(normalizeDates({ ...resource, view_count: resource.view_count + 1 }))
})

router.get('/:id', (req, res) => {
  const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id)

  if (!resource) {
    return res.status(404).json({ error: '资源不存在' })
  }

  res.json(normalizeDates(resource))
})

router.post('/', authMiddleware, (req, res) => {
  const { title, slug, description, cover_image, url, tag, status = 'published' } = req.body

  if (!title || !slug) {
    return res.status(400).json({ error: '标题和 slug 不能为空' })
  }

  const existing = db.prepare('SELECT id FROM resources WHERE slug = ?').get(slug)
  if (existing) {
    return res.status(400).json({ error: '该 slug 已存在' })
  }

  const result = db.prepare(`
    INSERT INTO resources (title, slug, description, cover_image, url, tag, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(title, slug, description, cover_image, url, tag, status)

  res.status(201).json({ id: result.lastInsertRowid, message: '资源创建成功' })
})

router.put('/:id', authMiddleware, (req, res) => {
  const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id)
  if (!resource) {
    return res.status(404).json({ error: '资源不存在' })
  }

  const { title, slug, description, cover_image, url, tag, status } = req.body

  if (slug && slug !== resource.slug) {
    const existing = db.prepare('SELECT id FROM resources WHERE slug = ?').get(slug)
    if (existing) {
      return res.status(400).json({ error: '该 slug 已存在' })
    }
  }

  db.prepare(`
    UPDATE resources
    SET title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        cover_image = COALESCE(?, cover_image),
        url = COALESCE(?, url),
        tag = COALESCE(?, tag),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, slug, description, cover_image, url, tag, status, req.params.id)

  res.json({ message: '资源更新成功' })
})

router.delete('/:id', authMiddleware, (req, res) => {
  const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id)
  if (!resource) {
    return res.status(404).json({ error: '资源不存在' })
  }

  db.prepare('DELETE FROM resources WHERE id = ?').run(req.params.id)
  res.json({ message: '资源删除成功' })
})

export default router