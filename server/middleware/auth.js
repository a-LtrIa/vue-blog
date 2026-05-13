import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-at-least-32-characters-long-for-development-only'

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' })
  }
  
  const token = authHeader.substring(7)
  const decoded = verifyToken(token)
  
  if (!decoded) {
    return res.status(401).json({ error: '令牌无效或已过期' })
  }
  
  req.user = decoded
  next()
}
