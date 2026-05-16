import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import db from '../config/database.js'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { fileURLToPath } from 'url'
import { dirname, join, extname } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { parseFile } from 'music-metadata'
import sharp from 'sharp'

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

const compressImage = async (inputPath, outputPath, options = {}) => {
  const { width = 800, height = 800, quality = 80, fit = 'inside' } = options

  await sharp(inputPath)
    .resize(width, height, { fit, withoutEnlargement: true })
    .jpeg({ quality, progressive: true })
    .toFile(outputPath)
}

router.post('/image', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择要上传的图片' })
  }

  try {
    const inputPath = join(uploadsDir, req.file.filename)
    const outputFilename = `${uuidv4()}.jpg`
    const outputPath = join(uploadsDir, outputFilename)

    const type = req.query.type || 'default'
    const compressOptions = {
      avatar: { width: 400, height: 400, quality: 85 },
      cover: { width: 1200, height: 800, quality: 85 },
      music: { width: 600, height: 600, quality: 80 },
      default: { width: 1200, height: 1200, quality: 85 }
    }

    const options = compressOptions[type] || compressOptions.default

    await compressImage(inputPath, outputPath, options)

    const fs = await import('fs')
    fs.unlinkSync(inputPath)

    res.json({
      url: `/uploads/${outputFilename}`,
      filename: outputFilename
    })
  } catch (err) {
    console.error('Image compression error:', err)
    res.json({
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename
    })
  }
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
      const coverFilename = `${uuidv4()}.jpg`
      const coverPath = join(uploadsDir, coverFilename)
      const tempPath = join(uploadsDir, `temp-${uuidv4()}.raw`)

      try {
        const fs = await import('fs')
        fs.writeFileSync(tempPath, picture.data)

        await sharp(tempPath)
          .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80, progressive: true })
          .toFile(coverPath)

        fs.unlinkSync(tempPath)
        coverUrl = `/uploads/${coverFilename}`
      } catch (err) {
        console.error('Cover compression error:', err)
        const fs = await import('fs')
        fs.writeFileSync(coverPath, picture.data)
        coverUrl = `/uploads/${coverFilename}`
      }
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
