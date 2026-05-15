import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import db from '../config/database.js'
import { normalizeDates, normalizeDatesArray } from '../utils/date.js'

const router = express.Router()

router.get('/', (req, res) => {
  const tags = db.prepare(`
    SELECT t.*,
      (SELECT COUNT(*) FROM post_tags WHERE tag_id = t.id) as post_count
    FROM tags t
    ORDER BY t.name ASC
  `).all()

  res.json(normalizeDatesArray(tags))
})

router.get('/:id', (req, res) => {
  const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(req.params.id)

  if (!tag) {
    return res.status(404).json({ error: '标签不存在' })
  }

  res.json(normalizeDates(tag))
})

router.post('/', authMiddleware, (req, res) => {
  const { name, slug } = req.body

  if (!name) {
    return res.status(400).json({ error: '标签名称不能为空' })
  }

  const tagSlug = slug || name.toLowerCase().replace(/\s+/g, '-')

  const existingName = db.prepare('SELECT id FROM tags WHERE name = ?').get(name)
  if (existingName) {
    return res.status(400).json({ error: '该标签名称已存在' })
  }

  const existingSlug = db.prepare('SELECT id FROM tags WHERE slug = ?').get(tagSlug)
  if (existingSlug) {
    return res.status(400).json({ error: '该 slug 已存在' })
  }

  const result = db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)').run(name, tagSlug)

  res.status(201).json({ id: result.lastInsertRowid, message: '标签创建成功' })
})

router.put('/:id', authMiddleware, (req, res) => {
  const { name, slug } = req.body

  const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(req.params.id)
  if (!tag) {
    return res.status(404).json({ error: '标签不存在' })
  }

  if (name && name !== tag.name) {
    const existing = db.prepare('SELECT id FROM tags WHERE name = ?').get(name)
    if (existing) {
      return res.status(400).json({ error: '该标签名称已存在' })
    }
  }

  const tagSlug = slug || (name ? name.toLowerCase().replace(/\s+/g, '-') : tag.slug)

  if (tagSlug !== tag.slug) {
    const existing = db.prepare('SELECT id FROM tags WHERE slug = ?').get(tagSlug)
    if (existing) {
      return res.status(400).json({ error: '该 slug 已存在' })
    }
  }

  db.prepare(`
    UPDATE tags
    SET name = COALESCE(?, name),
        slug = COALESCE(?, slug)
    WHERE id = ?
  `).run(name, slug, req.params.id)

  res.json({ message: '标签更新成功' })
})

router.delete('/:id', authMiddleware, (req, res) => {
  const tag = db.prepare('SELECT * FROM tags WHERE id = ?').get(req.params.id)
  if (!tag) {
    return res.status(404).json({ error: '标签不存在' })
  }

  db.prepare('DELETE FROM post_tags WHERE tag_id = ?').run(req.params.id)
  db.prepare('DELETE FROM tags WHERE id = ?').run(req.params.id)

  res.json({ message: '标签删除成功' })
})

export default router
