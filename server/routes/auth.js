import express from 'express'
import bcrypt from 'bcryptjs'
import { generateToken, authMiddleware } from '../middleware/auth.js'
import db from '../config/database.js'

const router = express.Router()

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

export default router
