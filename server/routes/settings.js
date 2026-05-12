import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import db from '../config/database.js'

const router = express.Router()

router.get('/', (req, res) => {
  const settings = db.prepare('SELECT key, value FROM settings').all()
  
  const settingsObj = {}
  settings.forEach(s => {
    settingsObj[s.key] = s.value
  })
  
  res.json(settingsObj)
})

router.put('/', authMiddleware, (req, res) => {
  const updates = req.body
  
  const updateSetting = db.prepare(`
    INSERT INTO settings (key, value, updated_at) 
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `)
  
  for (const [key, value] of Object.entries(updates)) {
    updateSetting.run(key, value)
  }
  
  res.json({ message: '设置更新成功' })
})

router.get('/social-links', (req, res) => {
  const links = db.prepare('SELECT * FROM social_links ORDER BY sort_order ASC').all()
  res.json(links)
})

router.post('/social-links', authMiddleware, (req, res) => {
  const { platform, url, icon, sort_order = 0 } = req.body
  
  if (!platform || !url) {
    return res.status(400).json({ error: '平台和链接不能为空' })
  }
  
  const result = db.prepare(`
    INSERT INTO social_links (platform, url, icon, sort_order)
    VALUES (?, ?, ?, ?)
  `).run(platform, url, icon, sort_order)
  
  res.status(201).json({ id: result.lastInsertRowid, message: '社交链接创建成功' })
})

router.put('/social-links/:id', authMiddleware, (req, res) => {
  const { platform, url, icon, sort_order } = req.body
  
  const link = db.prepare('SELECT * FROM social_links WHERE id = ?').get(req.params.id)
  if (!link) {
    return res.status(404).json({ error: '社交链接不存在' })
  }
  
  db.prepare(`
    UPDATE social_links 
    SET platform = COALESCE(?, platform),
        url = COALESCE(?, url),
        icon = COALESCE(?, icon),
        sort_order = COALESCE(?, sort_order)
    WHERE id = ?
  `).run(platform, url, icon, sort_order, req.params.id)
  
  res.json({ message: '社交链接更新成功' })
})

router.delete('/social-links/:id', authMiddleware, (req, res) => {
  const link = db.prepare('SELECT * FROM social_links WHERE id = ?').get(req.params.id)
  if (!link) {
    return res.status(404).json({ error: '社交链接不存在' })
  }
  
  db.prepare('DELETE FROM social_links WHERE id = ?').run(req.params.id)
  
  res.json({ message: '社交链接删除成功' })
})

export default router
