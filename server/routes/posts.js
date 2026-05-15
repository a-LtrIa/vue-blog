import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import db from '../config/database.js'
import { normalizeDates, normalizeDatesArray } from '../utils/date.js'

const router = express.Router()

router.get('/', (req, res) => {
  const { page = 1, limit = 10, status, category_id } = req.query
  const offset = (page - 1) * limit

  let sql = `
    SELECT p.*, c.name as category_name
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
  `
  const conditions = []
  const params = []

  if (status) {
    conditions.push('p.status = ?')
    params.push(status)
  }

  if (category_id) {
    conditions.push('p.category_id = ?')
    params.push(category_id)
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ')
  }

  sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
  params.push(parseInt(limit), offset)

  const posts = db.prepare(sql).all(...params)

  let countSql = 'SELECT COUNT(*) as total FROM posts'
  const countParams = []

  if (status) {
    countSql += ' WHERE status = ?'
    countParams.push(status)
  }

  if (category_id) {
    if (status) {
      countSql += ' AND category_id = ?'
    } else {
      countSql += ' WHERE category_id = ?'
    }
    countParams.push(category_id)
  }

  const { total } = db.prepare(countSql).get(...countParams)

  const postsWithTags = posts.map(post => {
    const tags = db.prepare(`
      SELECT t.id, t.name, t.slug
      FROM tags t
      JOIN post_tags pt ON t.id = pt.tag_id
      WHERE pt.post_id = ?
    `).all(post.id)
    return { ...post, tags }
  })

  res.json({
    posts: normalizeDatesArray(postsWithTags),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }
  })
})

router.get('/:id', (req, res) => {
  const post = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(req.params.id)

  if (!post) {
    return res.status(404).json({ error: '文章不存在' })
  }

  const tags = db.prepare(`
    SELECT t.id, t.name, t.slug
    FROM tags t
    JOIN post_tags pt ON t.id = pt.tag_id
    WHERE pt.post_id = ?
  `).all(post.id)

  res.json(normalizeDates({ ...post, tags }))
})

router.get('/slug/:slug', (req, res) => {
  const post = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = ?
  `).get(req.params.slug)

  if (!post) {
    return res.status(404).json({ error: '文章不存在' })
  }

  db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?').run(post.id)

  const tags = db.prepare(`
    SELECT t.id, t.name, t.slug
    FROM tags t
    JOIN post_tags pt ON t.id = pt.tag_id
    WHERE pt.post_id = ?
  `).all(post.id)

  res.json(normalizeDates({ ...post, tags, view_count: post.view_count + 1 }))
})

router.post('/', authMiddleware, (req, res) => {
  const { title, slug, content, excerpt, cover_image, category_id, post_type = 'local', external_url, status = 'draft', tags = [] } = req.body

  if (!title || !slug) {
    return res.status(400).json({ error: '标题和 slug 不能为空' })
  }

  if (post_type === 'external' && !external_url) {
    return res.status(400).json({ error: '外部链接文章必须提供 external_url' })
  }

  const existing = db.prepare('SELECT id FROM posts WHERE slug = ?').get(slug)
  if (existing) {
    return res.status(400).json({ error: '该 slug 已存在' })
  }

  const result = db.prepare(`
    INSERT INTO posts (title, slug, content, excerpt, cover_image, category_id, post_type, external_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, slug, content, excerpt, cover_image, category_id, post_type, external_url, status)

  const postId = result.lastInsertRowid

  if (tags.length > 0) {
    const insertTag = db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)')
    tags.forEach(tagId => {
      insertTag.run(postId, tagId)
    })
  }

  res.status(201).json({ id: postId, message: '文章创建成功' })
})

router.put('/:id', authMiddleware, (req, res) => {
  const { title, slug, content, excerpt, cover_image, category_id, post_type, external_url, status, tags } = req.body

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!post) {
    return res.status(404).json({ error: '文章不存在' })
  }

  if (slug && slug !== post.slug) {
    const existing = db.prepare('SELECT id FROM posts WHERE slug = ?').get(slug)
    if (existing) {
      return res.status(400).json({ error: '该 slug 已存在' })
    }
  }

  db.prepare(`
    UPDATE posts
    SET title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        content = COALESCE(?, content),
        excerpt = COALESCE(?, excerpt),
        cover_image = COALESCE(?, cover_image),
        category_id = COALESCE(?, category_id),
        post_type = COALESCE(?, post_type),
        external_url = COALESCE(?, external_url),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, slug, content, excerpt, cover_image, category_id, post_type, external_url, status, req.params.id)

  if (tags !== undefined) {
    db.prepare('DELETE FROM post_tags WHERE post_id = ?').run(req.params.id)

    if (tags.length > 0) {
      const insertTag = db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)')
      tags.forEach(tagId => {
        insertTag.run(req.params.id, tagId)
      })
    }
  }

  res.json({ message: '文章更新成功' })
})

router.delete('/:id', authMiddleware, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id)
  if (!post) {
    return res.status(404).json({ error: '文章不存在' })
  }

  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id)

  res.json({ message: '文章删除成功' })
})

export default router
