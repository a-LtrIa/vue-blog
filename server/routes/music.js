import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import db from '../config/database.js'
import { normalizeDates, normalizeDatesArray } from '../utils/date.js'

const router = express.Router()

router.get('/', (req, res) => {
  const { status, random } = req.query

  let sql = 'SELECT * FROM music'
  const conditions = []
  const params = []

  if (status) {
    conditions.push('status = ?')
    params.push(status)
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ')
  }

  if (random === 'true') {
    sql += ' ORDER BY RANDOM() LIMIT 1'
  } else {
    sql += ' ORDER BY sort_order ASC, created_at DESC'
  }

  const music = db.prepare(sql).all(...params)
  res.json(normalizeDatesArray(music))
})

router.get('/:id', (req, res) => {
  const music = db.prepare('SELECT * FROM music WHERE id = ?').get(req.params.id)

  if (!music) {
    return res.status(404).json({ error: '音乐不存在' })
  }

  res.json(normalizeDates(music))
})

router.post('/', authMiddleware, (req, res) => {
  const { title, artist, album, cover_url, audio_url, duration, sort_order = 0, status = 'published' } = req.body

  if (!title) {
    return res.status(400).json({ error: '音乐标题不能为空' })
  }

  if (!audio_url) {
    return res.status(400).json({ error: '音频地址不能为空' })
  }

  const result = db.prepare(`
    INSERT INTO music (title, artist, album, cover_url, audio_url, duration, sort_order, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, artist || '', album || '', cover_url || '', audio_url, duration || 0, sort_order, status)

  res.status(201).json({ id: result.lastInsertRowid, message: '音乐添加成功' })
})

router.put('/:id', authMiddleware, (req, res) => {
  const music = db.prepare('SELECT * FROM music WHERE id = ?').get(req.params.id)
  if (!music) {
    return res.status(404).json({ error: '音乐不存在' })
  }

  const { title, artist, album, cover_url, audio_url, duration, sort_order, status } = req.body

  db.prepare(`
    UPDATE music
    SET title = COALESCE(?, title),
        artist = COALESCE(?, artist),
        album = COALESCE(?, album),
        cover_url = COALESCE(?, cover_url),
        audio_url = COALESCE(?, audio_url),
        duration = COALESCE(?, duration),
        sort_order = COALESCE(?, sort_order),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, artist, album, cover_url, audio_url, duration, sort_order, status, req.params.id)

  res.json({ message: '音乐更新成功' })
})

router.delete('/:id', authMiddleware, (req, res) => {
  const music = db.prepare('SELECT * FROM music WHERE id = ?').get(req.params.id)
  if (!music) {
    return res.status(404).json({ error: '音乐不存在' })
  }

  db.prepare('DELETE FROM music WHERE id = ?').run(req.params.id)
  res.json({ message: '音乐删除成功' })
})

router.post('/:id/play', (req, res) => {
  const music = db.prepare('SELECT * FROM music WHERE id = ?').get(req.params.id)
  if (!music) {
    return res.status(404).json({ error: '音乐不存在' })
  }

  db.prepare('UPDATE music SET play_count = play_count + 1 WHERE id = ?').run(req.params.id)
  res.json({ message: '播放次数已更新' })
})

export default router