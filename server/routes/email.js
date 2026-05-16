import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { saveEmailSettings, getSettings, sendEmail } from '../services/email.js'

const router = express.Router()

router.get('/', authMiddleware, (req, res) => {
  try {
    const settings = getSettings()
    res.json({
      success: true,
      data: settings
    })
  } catch (err) {
    console.error('获取邮箱设置失败:', err)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

router.post('/', authMiddleware, (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, from_email, admin_email, notify_admin, notify_user } = req.body

    if (!smtp_host || !smtp_port || !smtp_user) {
      return res.status(400).json({ success: false, message: '请填写必要的SMTP配置' })
    }

    const settings = {
      smtp_host,
      smtp_port: parseInt(smtp_port),
      smtp_secure: smtp_secure === true || smtp_secure === 1,
      smtp_user,
      smtp_password: smtp_password === '********' ? null : smtp_password,
      from_email,
      admin_email,
      notify_admin: notify_admin === true || notify_admin === 1,
      notify_user: notify_user === true || notify_user === 1
    }

    saveEmailSettings(settings)

    res.json({
      success: true,
      message: '邮箱设置保存成功'
    })
  } catch (err) {
    console.error('保存邮箱设置失败:', err)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

router.post('/test', authMiddleware, async (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, from_email } = req.body

    if (!smtp_host || !smtp_port || !smtp_user || !smtp_password || !from_email) {
      return res.status(400).json({ success: false, message: '请填写完整的测试邮件信息' })
    }

    const result = await sendEmail({
      to: from_email,
      subject: '博客邮箱服务测试',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>测试邮件</h2>
          <p>这是一封来自博客系统的测试邮件。</p>
          <p>如果您收到这封邮件，说明邮箱配置正确！</p>
          <p>时间：${new Date().toLocaleString('zh-CN')}</p>
        </div>
      `
    })

    if (result.success) {
      res.json({ success: true, message: '测试邮件发送成功' })
    } else {
      res.status(400).json({ success: false, message: '测试邮件发送失败: ' + result.message })
    }
  } catch (err) {
    console.error('发送测试邮件失败:', err)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

export default router
