import express from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { generateToken, authMiddleware } from '../middleware/auth.js'
import db from '../config/database.js'
import { sendEmail } from '../services/email.js'

const router = express.Router()

// 生成随机令牌
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

// 发送密码重置邮件
const sendPasswordResetEmail = async (email, resetUrl) => {
  const subject = '【博客后台】密码重置请求'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">密码重置</h2>
      <p style="color: #555; line-height: 1.6;">您好，</p>
      <p style="color: #555; line-height: 1.6;">我们收到了您的密码重置请求。请点击下方按钮重置密码：</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #0066cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">重置密码</a>
      </div>
      <p style="color: #666; font-size: 14px;">或者复制以下链接到浏览器：</p>
      <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 13px; color: #333;">${resetUrl}</p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">此链接将在 1 小时后失效。如果您没有请求重置密码，请忽略此邮件。</p>
    </div>
  `
  return sendEmail({ to: email, subject, html })
}

router.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' })
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)

  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  const isValid = bcrypt.compareSync(password, user.password)

  if (!isValid) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  const token = generateToken({ id: user.id, username: user.username })

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username
    }
  })
})

router.post('/change-password', authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: '旧密码和新密码不能为空' })
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)

  if (!user) {
    return res.status(404).json({ error: '用户不存在' })
  }

  const isValid = bcrypt.compareSync(oldPassword, user.password)

  if (!isValid) {
    return res.status(401).json({ error: '旧密码错误' })
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10)
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, req.user.id)

  res.json({ message: '密码修改成功' })
})

router.get('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user })
})

// 请求密码重置
router.post('/forgot-password', async (req, res) => {
  const { username, email } = req.body

  if (!username || !email) {
    return res.status(400).json({ error: '用户名和邮箱不能为空' })
  }

  // 查找用户
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND email = ?').get(username, email)

  if (!user) {
    return res.status(404).json({ error: '用户名或邮箱不正确' })
  }

  // 检查该用户最近是否有未使用的重置令牌（防止频繁请求）
  const existingToken = db.prepare(`
    SELECT * FROM password_reset_tokens
    WHERE user_id = ? AND used = 0 AND expires_at > datetime('now')
    ORDER BY created_at DESC LIMIT 1
  `).get(user.id)

  if (existingToken) {
    const createdTime = new Date(existingToken.created_at)
    const now = new Date()
    const diffMinutes = (now - createdTime) / (1000 * 60)

    if (diffMinutes < 5) {
      return res.status(429).json({ error: '请等待 5 分钟后再试' })
    }
  }

  // 生成重置令牌
  const token = generateToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1小时后过期

  // 保存令牌到数据库
  db.prepare(`
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `).run(user.id, token, expiresAt.toISOString())

  // 构建重置链接
  const resetUrl = `${req.headers.origin || 'http://localhost:5173'}/reset-password?token=${token}`

  // 发送邮件
  const emailResult = await sendPasswordResetEmail(email, resetUrl)

  if (!emailResult.success) {
    console.error('发送密码重置邮件失败:', emailResult.message)
    return res.status(500).json({ error: '邮件发送失败，请检查邮箱配置' })
  }

  res.json({ message: '密码重置邮件已发送，请查收' })
})

// 验证重置令牌
router.get('/verify-reset-token', (req, res) => {
  const { token } = req.query

  if (!token) {
    return res.status(400).json({ error: '令牌不能为空' })
  }

  const resetToken = db.prepare(`
    SELECT t.*, u.username, u.email
    FROM password_reset_tokens t
    JOIN users u ON t.user_id = u.id
    WHERE t.token = ? AND t.used = 0 AND t.expires_at > datetime('now')
  `).get(token)

  if (!resetToken) {
    return res.status(400).json({ error: '令牌无效或已过期' })
  }

  res.json({
    valid: true,
    username: resetToken.username,
    email: resetToken.email
  })
})

// 重置密码
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body

  if (!token || !newPassword) {
    return res.status(400).json({ error: '令牌和新密码不能为空' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: '密码长度至少为 6 位' })
  }

  // 查找有效的重置令牌
  const resetToken = db.prepare(`
    SELECT t.*, u.id as user_id
    FROM password_reset_tokens t
    JOIN users u ON t.user_id = u.id
    WHERE t.token = ? AND t.used = 0 AND t.expires_at > datetime('now')
  `).get(token)

  if (!resetToken) {
    return res.status(400).json({ error: '令牌无效或已过期' })
  }

  // 更新密码
  const hashedPassword = bcrypt.hashSync(newPassword, 10)
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, resetToken.user_id)

  // 标记令牌为已使用
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(resetToken.id)

  res.json({ message: '密码重置成功，请使用新密码登录' })
})

export default router
