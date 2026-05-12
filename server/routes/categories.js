import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import db from '../config/database.js'

const router = express.Router()

router.get('/', (req, res) => {
  const categories = db.prepare(`
    SELECT c.*, 
      (SELECT COUNT(*) FROM posts WHERE category_id = c.id AND status = 'published') as post_count
    FROM categories c
    ORDER BY c.sort_order ASC
  `).all()
  
  res.json(categories)
})

router.get('/:id', (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id)
  
  if (!category) {
    return res.status(404).json({ error: '分类不存在' })
  }
  
  res.json(category)
})

router.post('/', authMiddleware, (req, res) => {
  const { name, slug, description, cover_image, sort_order = 0 } = req.body
  
  if (!name || !slug) {
    return res.status(400).json({ error: '名称和 slug 不能为空' })
  }
  
  const existingName = db.prepare('SELECT id FROM categories WHERE name = ?').get(name)
  if (existingName) {
    return res.status(400).json({ error: '该分类名称已存在' })
  }
  
  const existingSlug = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug)
  if (existingSlug) {
    return res.status(400).json({ error: '该 slug 已存在' })
  }
  
  const result = db.prepare(`
    INSERT INTO categories (name, slug, description, cover_image, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, slug, description, cover_image, sort_order)
  
  res.status(201).json({ id: result.lastInsertRowid, message: '分类创建成功' })
})

router.put('/:id', authMiddleware, (req, res) => {
  const { name, slug, description, cover_image, sort_order } = req.body
  
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id)
  if (!category) {
    return res.status(404).json({ error: '分类不存在' })
  }
  
  if (name && name !== category.name) {
    const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name)
    if (existing) {
      return res.status(400).json({ error: '该分类名称已存在' })
    }
  }
  
  if (slug && slug !== category.slug) {
    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug)
    if (existing) {
      return res.status(400).json({ error: '该 slug 已存在' })
    }
  }
  
  db.prepare(`
    UPDATE categories 
    SET name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        cover_image = COALESCE(?, cover_image),
        sort_order = COALESCE(?, sort_order)
    WHERE id = ?
  `).run(name, slug, description, cover_image, sort_order, req.params.id)
  
  res.json({ message: '分类更新成功' })
})

router.delete('/:id', authMiddleware, (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id)
  if (!category) {
    return res.status(404).json({ error: '分类不存在' })
  }
  
  const postCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE category_id = ?').get(req.params.id)
  if (postCount.count > 0) {
    return res.status(400).json({ error: '该分类下还有文章，无法删除' })
  }
  
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id)
  
  res.json({ message: '分类删除成功' })
})

export default router
