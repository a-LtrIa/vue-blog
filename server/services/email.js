import nodemailer from 'nodemailer'
import db from '../config/database.js'

let transporter = null

const getEmailSettings = () => {
  try {
    const settings = db.prepare('SELECT * FROM email_settings WHERE id = 1').get()
    return settings || null
  } catch (err) {
    console.error('获取邮箱设置失败:', err)
    return null
  }
}

const createTransporter = (settings) => {
  if (!settings || !settings.smtp_host || !settings.smtp_port) {
    return null
  }

  const config = {
    host: settings.smtp_host,
    port: parseInt(settings.smtp_port),
    secure: settings.smtp_secure === 1,
    auth: {
      user: settings.smtp_user,
      pass: settings.smtp_password
    }
  }

  return nodemailer.createTransport(config)
}

const initTransporter = () => {
  const settings = getEmailSettings()
  if (settings) {
    transporter = createTransporter(settings)
  }
  return transporter
}

const sendEmail = async ({ to, subject, html }) => {
  const settings = getEmailSettings()

  if (!settings || !settings.smtp_host) {
    console.log('邮箱服务未配置，跳过发送邮件')
    return { success: false, message: '邮箱服务未配置' }
  }

  const transport = createTransporter(settings)

  if (!transport) {
    return { success: false, message: '无法创建邮件传输器' }
  }

  try {
    const info = await transport.sendMail({
      from: settings.from_email || settings.smtp_user,
      to,
      subject,
      html
    })
    console.log('邮件发送成功:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (err) {
    console.error('邮件发送失败:', err)
    return { success: false, message: err.message }
  }
}

const sendAdminNotification = async (feedback) => {
  const settings = getEmailSettings()

  if (!settings || !settings.notify_admin || !settings.admin_email) {
    return { success: false, message: '管理员通知未启用' }
  }

  const subject = `【博客留言】${feedback.username} 留言了`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">您收到一条新的留言</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>用户名：</strong>${feedback.username}</p>
        <p><strong>邮箱：</strong>${feedback.email || '未填写'}</p>
        <p><strong>IP：</strong>${feedback.ip}</p>
        <p><strong>时间：</strong>${new Date(feedback.created_at).toLocaleString('zh-CN')}</p>
        <p><strong>内容：</strong></p>
        <div style="background: #fff; padding: 15px; border-radius: 4px; margin-top: 10px;">
          ${feedback.content}
        </div>
      </div>
      <p style="color: #666; font-size: 14px;">
        请登录博客后台进行回复。
      </p>
    </div>
  `

  return sendEmail({
    to: settings.admin_email,
    subject,
    html
  })
}

const sendUserNotification = async (feedback, replyContent) => {
  const settings = getEmailSettings()

  if (!settings || !settings.notify_user || !feedback.email) {
    return { success: false, message: '用户通知未启用或用户未提供邮箱' }
  }

  const subject = `【博客留言回复】博主回复了您的留言`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">您的留言收到了回复</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>您的留言：</strong></p>
        <div style="background: #fff; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
          ${feedback.content}
        </div>
        <p><strong>博主回复：</strong></p>
        <div style="background: #e8f4fd; padding: 15px; border-radius: 4px; border-left: 4px solid #2196F3;">
          ${replyContent}
        </div>
      </div>
      <p style="color: #666; font-size: 14px;">
        感谢您的留言！
      </p>
    </div>
  `

  return sendEmail({
    to: feedback.email,
    subject,
    html
  })
}

const saveEmailSettings = (settings) => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO email_settings
    (id, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, from_email, admin_email, notify_admin, notify_user)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    settings.smtp_host || '',
    settings.smtp_port || 465,
    settings.smtp_secure ? 1 : 0,
    settings.smtp_user || '',
    settings.smtp_password || '',
    settings.from_email || '',
    settings.admin_email || '',
    settings.notify_admin ? 1 : 0,
    settings.notify_user ? 1 : 0
  )

  transporter = createTransporter(settings)
}

const getSettings = () => {
  const settings = getEmailSettings()
  if (!settings) {
    return {
      smtp_host: '',
      smtp_port: 465,
      smtp_secure: true,
      smtp_user: '',
      smtp_password: '',
      from_email: '',
      admin_email: '',
      notify_admin: true,
      notify_user: true
    }
  }
  return {
    ...settings,
    smtp_password: settings.smtp_password ? '********' : ''
  }
}

export {
  sendEmail,
  sendAdminNotification,
  sendUserNotification,
  saveEmailSettings,
  getSettings,
  initTransporter
}
