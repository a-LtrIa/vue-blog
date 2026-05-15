import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import db from '../config/database.js'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { fileURLToPath } from 'url'
import { dirname, join, extname } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { parseFile } from 'music-metadata'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const uploadsDir = join(__dirname, '..', 'uploads')
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const ext = extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只支持 JPEG、PNG、GIF、WebP 格式的图片'))
    }
  }
})

const audioUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/flac',
      'audio/aac',
      'audio/x-m4a',
      'audio/m4a',
      'audio/x-wav',
      'audio/opus',
      'audio/webm'
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('只支持 MP3、WAV、OGG、FLAC、AAC、M4A 格式的音频'))
    }
  }
})

const router = express.Router()

router.post('/image', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择要上传的图片' })
  }

  const imageUrl = `/uploads/${req.file.filename}`

  res.json({
    url: imageUrl,
    filename: req.file.filename
  })
})

router.post('/audio', authMiddleware, audioUpload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择要上传的音频' })
  }

  const audioUrl = `/uploads/${req.file.filename}`

  res.json({
    url: audioUrl,
    filename: req.file.filename
  })
})

router.post('/audio/metadata', authMiddleware, audioUpload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择要上传的音频' })
  }

  try {
    const filePath = join(uploadsDir, req.file.filename)
    const metadata = await parseFile(filePath)

    const common = metadata.common
    const format = metadata.format

    let coverUrl = ''
    if (common.picture && common.picture.length > 0) {
      const picture = common.picture[0]
      const ext = picture.format.includes('png') ? '.png' : '.jpg'
      const coverFilename = `${uuidv4()}${ext}`
      const coverPath = join(uploadsDir, coverFilename)
      const fs = await import('fs')
      fs.writeFileSync(coverPath, picture.data)
      coverUrl = `/uploads/${coverFilename}`
    }

    res.json({
      title: common.title || '',
      artist: common.artist || '',
      album: common.album || '',
      duration: Math.round(format.duration || 0),
      coverUrl: coverUrl,
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`
    })
  } catch (err) {
    console.error('Metadata extraction error:', err)
    res.json({
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      duration: 0
    })
  }
})

router.use((err, req, res, next) => {
  console.error('Upload error:', err.message)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const isAudioUpload = req.originalUrl.includes('/audio')
      const limit = isAudioUpload ? '50MB' : '5MB'
      return res.status(400).json({ error: `文件大小不能超过 ${limit}` })
    }
    return res.status(400).json({ error: err.message })
  }
  return res.status(400).json({ error: err.message })
})

export default router
