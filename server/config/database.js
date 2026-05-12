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
`)

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
})()

export default db
