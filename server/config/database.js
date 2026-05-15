import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbPath = join(__dirname, '..', 'data', 'blog.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    cover_image TEXT,
    category_id INTEGER,
    post_type TEXT DEFAULT 'local',
    external_url TEXT,
    status TEXT DEFAULT 'draft',
    view_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    cover_image TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS post_tags (
    post_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE NOT NULL,
    count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS visit_ips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    ip TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, ip)
  );

  CREATE TABLE IF NOT EXISTS tools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    url TEXT,
    icon TEXT,
    category TEXT,
    sort_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    cover_image TEXT,
    url TEXT,
    tag TEXT,
    status TEXT DEFAULT 'published',
    view_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    status TEXT DEFAULT 'published',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

// Migration: add post_type and external_url columns for existing databases
try {
  db.exec('ALTER TABLE posts ADD COLUMN post_type TEXT DEFAULT \'local\'')
} catch (e) { /* column already exists */ }
try {
  db.exec('ALTER TABLE posts ADD COLUMN external_url TEXT')
} catch (e) { /* column already exists */ }

// Migration: add title column for existing announcements table
try {
  db.exec('ALTER TABLE announcements ADD COLUMN title TEXT NOT NULL DEFAULT \'\'')
} catch (e) { /* column already exists */ }

// Migration: add icon column for categories table
try {
  db.exec('ALTER TABLE categories ADD COLUMN icon TEXT')
} catch (e) { /* column already exists */ }

// Initialize default data in async IIFE
;(async () => {
  // Initialize default user
  const initUser = db.prepare('SELECT COUNT(*) as count FROM users')
  if (initUser.get().count === 0) {
    const bcryptModule = await import('bcryptjs')
    const bcrypt = bcryptModule.default
    const hashedPassword = bcrypt.hashSync('admin123', 10)
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', hashedPassword)
  }

  // Initialize default settings
  const initSettings = db.prepare('SELECT COUNT(*) as count FROM settings')
  if (initSettings.get().count === 0) {
    const defaultSettings = [
      ['site_name', 'ALT的博客'],
      ['site_description', '记录技术、生活与思考'],
      ['author_name', 'ALT'],
      ['author_bio', '前端工程师 | 热爱开源与设计'],
      ['background_url', 'https://www.loliapi.com/acg/'],
      ['avatar_url', '']
    ]
    const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
    for (const [key, value] of defaultSettings) {
      insertSetting.run(key, value)
    }
  }

  // Initialize default categories
  const initCategories = db.prepare('SELECT COUNT(*) as count FROM categories')
  if (initCategories.get().count === 0) {
    const defaultCategories = [
      ['前端', 'frontend', '前端开发相关技术', 0],
      ['后端', 'backend', '后端开发相关技术', 1],
      ['设计', 'design', 'UI/UX 设计', 2],
      ['产品', 'product', '产品思考', 3],
      ['运营', 'operation', '运营相关', 4],
      ['其他', 'other', '其他内容', 5]
    ]
    const insertCategory = db.prepare('INSERT INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)')
    defaultCategories.forEach((cat) => {
      insertCategory.run(...cat)
    })
  }

  // Initialize default tags
  const initTags = db.prepare('SELECT COUNT(*) as count FROM tags')
  if (initTags.get().count === 0) {
    const defaultTags = ['Vue', 'TypeScript', 'CSS', 'Vite', '性能优化', 'React', 'Node.js', 'JavaScript']
    const insertTag = db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)')
    defaultTags.forEach(tag => {
      insertTag.run(tag, tag.toLowerCase().replace(/\s+/g, '-'))
    })
  }

  // Initialize default tools
  const initTools = db.prepare('SELECT COUNT(*) as count FROM tools')
  if (initTools.get().count === 0) {
    const defaultTools = [
      ['颜色提取器', '从图片中提取主色调和配色方案', '#', 'Palette', '设计工具', 0],
      ['JSON 格式化', '在线 JSON 格式化与校验工具', '#', 'FileJson', '开发工具', 1],
      ['二维码生成器', '快速生成自定义样式二维码', '#', 'QrCode', '生成工具', 2],
      ['图片压缩工具', '无损压缩图片，减小文件体积', '#', 'Image', '设计工具', 3],
      ['代码片段管理', '收藏和管理常用代码片段', '#', 'Code2', '开发工具', 4],
      ['字数统计器', '统计中英文文章字数与阅读时间', '#', 'Type', '文本工具', 5]
    ]
    const insertTool = db.prepare('INSERT INTO tools (name, description, url, icon, category, sort_order) VALUES (?, ?, ?, ?, ?, ?)')
    defaultTools.forEach(tool => {
      insertTool.run(...tool)
    })
  }

  // Initialize default announcements
  const initAnnouncements = db.prepare('SELECT COUNT(*) as count FROM announcements')
  if (initAnnouncements.get().count === 0) {
    const defaultAnnouncements = [
      ['博客全新改版上线', '欢迎来到我的博客！本站采用玻璃拟态设计，正在持续更新中，敬请期待更多内容。', 0],
      ['联系与反馈', '如有任何问题或建议，欢迎通过社交链接与我联系。', 1]
    ]
    const insertAnnouncement = db.prepare('INSERT INTO announcements (title, content, sort_order) VALUES (?, ?, ?)')
    defaultAnnouncements.forEach(announcement => {
      insertAnnouncement.run(...announcement)
    })
  }

  // Initialize default resources
  const initResources = db.prepare('SELECT COUNT(*) as count FROM resources')
  if (initResources.get().count === 0) {
    const defaultResources = [
      ['Iconify', 'iconify', '海量开源图标库，支持所有主流框架', '', 'https://icon-sets.iconify.design/', '图标'],
      ['Unsplash', 'unsplash', '高质量免费图片素材，适合博客配图', '', 'https://unsplash.com/', '图片'],
      ['Coolors', 'coolors', '在线配色方案生成器，快速搭配色彩', '', 'https://coolors.co/', '配色'],
      ['Figma', 'figma', '协作式 UI 设计工具，支持在线编辑', '', 'https://www.figma.com/', '设计'],
      ['MDN Web Docs', 'mdn-web-docs', '最权威的前端开发文档与教程', '', 'https://developer.mozilla.org/', '文档'],
      ['Can I Use', 'can-i-use', '查询浏览器兼容性，前端开发必备', '', 'https://caniuse.com/', '工具']
    ]
    const insertResource = db.prepare('INSERT INTO resources (title, slug, description, cover_image, url, tag) VALUES (?, ?, ?, ?, ?, ?)')
    defaultResources.forEach(resource => {
      insertResource.run(...resource)
    })
  }
})()

export default db
