import express from 'express'

const router = express.Router()
import db from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'
import { sendAdminNotification, sendUserNotification } from '../services/email.js'

const ipRequestCounts = new Map()
const ipHourlyCounts = new Map()

const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_MAX = 1
const HOURLY_LIMIT_MAX = 100

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket.remoteAddress || '127.0.0.1'
}

const cleanupOldEntries = (map, maxAge) => {
  const now = Date.now()
  for (const [key, data] of map.entries()) {
    if (now - data.timestamp > maxAge) {
      map.delete(key)
    }
  }
}

setInterval(() => {
  cleanupOldEntries(ipRequestCounts, RATE_LIMIT_WINDOW)
  cleanupOldEntries(ipHourlyCounts, 60 * 60 * 1000)
}, 60000)

router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const clientIp = getClientIp(req)
    const feedbacks = db
      .prepare(`
        SELECT * FROM feedback
        WHERE is_public = 1 OR ip = ?
        ORDER BY created_at DESC
        LIMIT ?
      `)
      .all(clientIp, limit)

    res.json({
      success: true,
      data: feedbacks
    })
  } catch (err) {
    console.error('获取留言列表失败:', err)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

router.post('/', (req, res) => {
  try {
    const { username, email, content, is_public } = req.body
    const ip = getClientIp(req)

    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: '用户名不能为空' })
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: '留言内容不能为空' })
    }

    const now = Date.now()

    cleanupOldEntries(ipRequestCounts, RATE_LIMIT_WINDOW)
    cleanupOldEntries(ipHourlyCounts, 60 * 60 * 1000)

    const minuteData = ipRequestCounts.get(ip)
    if (minuteData && now - minuteData.timestamp < RATE_LIMIT_WINDOW) {
      const waitSeconds = Math.ceil((RATE_LIMIT_WINDOW - (now - minuteData.timestamp)) / 1000)
      return res.status(429).json({
        success: false,
        message: `留言太频繁，请 ${waitSeconds} 秒后再试`
      })
    }

    const hourData = ipHourlyCounts.get(ip)
    if (hourData) {
      const hourCount = hourData.count
      if (hourCount >= HOURLY_LIMIT_MAX) {
        return res.status(429).json({
          success: false,
          message: '您今天的留言次数已达上限，请明天再来'
        })
      }
      hourData.count++
    } else {
      ipHourlyCounts.set(ip, { count: 1, timestamp: now })
    }

    ipRequestCounts.set(ip, { timestamp: now })

    const result = db
      .prepare('INSERT INTO feedback (username, email, content, is_public, ip) VALUES (?, ?, ?, ?, ?)')
      .run(username.trim(), email || '', content.trim(), is_public ? 1 : 0, ip)

    const newFeedback = db
      .prepare('SELECT * FROM feedback WHERE id = ?')
      .get(result.lastInsertRowid)

    sendAdminNotification(newFeedback).catch(err => {
      console.error('发送管理员通知邮件失败:', err)
    })

    res.json({
      success: true,
      data: newFeedback
    })
  } catch (err) {
    console.error('提交留言失败:', err)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

router.put('/:id/reply', authMiddleware, (req, res) => {
  try {
    const { id } = req.params
    const { reply } = req.body

    if (!reply || !reply.trim()) {
      return res.status(400).json({ success: false, message: '回复内容不能为空' })
    }

    db.prepare('UPDATE feedback SET reply = ?, reply_created_at = CURRENT_TIMESTAMP WHERE id = ?').run(reply.trim(), id)

    const updated = db.prepare('SELECT * FROM feedback WHERE id = ?').get(id)

    if (updated.email) {
      sendUserNotification(updated, reply.trim()).catch(err => {
        console.error('发送用户通知邮件失败:', err)
      })
    }

    res.json({
      success: true,
      data: updated
    })
  } catch (err) {
    console.error('回复留言失败:', err)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

router.get('/all', authMiddleware, (req, res) => {
  try {
    const feedbacks = db
      .prepare('SELECT * FROM feedback ORDER BY created_at DESC')
      .all()

    res.json({
      success: true,
      data: feedbacks
    })
  } catch (err) {
    console.error('获取所有留言失败:', err)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params
    db.prepare('DELETE FROM feedback WHERE id = ?').run(id)
    res.json({ success: true })
  } catch (err) {
    console.error('删除留言失败:', err)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

export default router
