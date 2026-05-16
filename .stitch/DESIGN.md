# 博客设计系统 - 玻璃拟态电影感

## 设计概述

一个融合玻璃拟态（Glassmorphism）、电影感（Cinematic）和 Bento-grid 布局的现代博客设计系统。强调透明层次、动态光影和精致的微交互。

## 设计原则

1. **玻璃拟态** - 半透明背景、背景模糊、微妙边框
2. **电影感** - 戏剧性光影、渐变叠加、景深效果
3. **Bento-grid** - 模块化卡片布局、大小不一的网格项
4. **流畅动画** - 优雅的过渡、悬停效果、滚动动画

## 色彩系统

### 主色调


### 玻璃拟态色彩
- **Glass Light**: `rgba(255, 255, 255, 0.1)` - 浅色玻璃
- **Glass Medium**: `rgba(255, 255, 255, 0.05)` - 中等玻璃
- **Glass Border**: `rgba(255, 255, 255, 0.15)` - 玻璃边框
- **Glass Border Hover**: `rgba(255, 255, 255, 0.25)` - 悬停边框

### 背景色
- **Canvas Dark**: `#1a1a2e` - 深色画布
- **Canvas Deep**: `#16213e` - 深蓝背景
- **Gradient Start**: `rgba(120, 119, 198, 0.3)` - 渐变起点
- **Gradient End**: `rgba(255, 119, 198, 0.2)` - 渐变终点

### 文字色
- **Text Primary**: `#ffffff` - 主文字
- **Text Secondary**: `rgba(255, 255, 255, 0.85)` - 次要文字
- **Text Muted**: `rgba(255, 255, 255, 0.6)` - 弱化文字
- **Text Subtle**: `rgba(255, 255, 255, 0.4)` - 微妙文字

## 字体系统

### 字体族
- **Display**: `"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Text**: `"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Mono**: `"SF Mono", "Fira Code", monospace`

### 字体规格
| 名称 | 大小 | 字重 | 行高 | 字间距 |
|------|------|------|------|--------|
| Hero | 48px | 700 | 1.1 | -0.02em |
| H1 | 40px | 600 | 1.2 | -0.02em |
| H2 | 32px | 600 | 1.3 | -0.01em |
| H3 | 24px | 600 | 1.4 | 0 |
| Body Large | 18px | 400 | 1.6 | 0 |
| Body | 16px | 400 | 1.6 | 0 |
| Caption | 14px | 500 | 1.4 | 0.02em |
| Small | 12px | 400 | 1.4 | 0.05em |

## 玻璃拟态组件

### 基础玻璃卡片
```css
.glass-morphism {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.08) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
```

### 高级玻璃卡片（Hero）
```css
.glass-hero {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.06) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 40px;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}
```

### 玻璃按钮
```css
.glass-button {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.1) 100%
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 100px;
  color: #ffffff;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-button:hover {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.15) 100%
  );
  transform: translateY(-2px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}
```

### 浮动操作按钮（FAB）
```css
.fab-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.75);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fab-btn:hover {
  transform: translateY(-3px) scale(1.08);
  border-color: rgba(255, 255, 255, 0.35);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.25) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.18) 100%
  );
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset,
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.95);
}

.fab-btn:active {
  transform: translateY(-1px) scale(0.95);
  transition-duration: 0.1s;
}
```

### FAB 光泽效果
```css
.fab-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    135deg,
    transparent 30%,
    rgba(255, 255, 255, 0.08) 45%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.08) 55%,
    transparent 70%
  );
  z-index: 1;
  transform: translateX(-100%) translateY(-100%);
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.fab-btn:hover .fab-shine {
  transform: translateX(30%) translateY(30%);
}
```

### FAB 光环效果
```css
.fab-ring {
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fab-btn:hover .fab-ring {
  border-color: rgba(255, 255, 255, 0.2);
  inset: -4px;
}
```

### FAB 工具提示
```css
.fab-tooltip {
  position: absolute;
  right: calc(100% + 14px);
  top: 50%;
  transform: translateY(-50%) translateX(8px);
  padding: 6px 14px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fab-wrapper:hover .fab-tooltip {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
}
```

### 音乐播放器卡片
```css
.fab-music-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  opacity: 0;
  visibility: hidden;
  transform: translateX(10px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fab-music-wrapper:hover .fab-music-card {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.music-cover-wrap {
  width: 52px;
  height: 52px;
}

.music-cover {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
}
```

### 音乐封面旋转
```css
.music-cover-thumb {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  animation: music-rotate 8s linear infinite;
  animation-play-state: paused;
}

.music-cover-thumb.is-playing {
  animation-play-state: running;
}

@keyframes music-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### 播放进度条
```css
.music-progress {
  margin-top: 6px;
}

.progress-bar {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 2px;
}
```

### 音乐控制按钮
```css
.music-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.music-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.music-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.music-toggle {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
}
```

## Bento Grid 布局

### 网格定义
```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(180px, auto);
  gap: 20px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .bento-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .bento-grid { grid-template-columns: 1fr; }
}
```

### 卡片尺寸
- **span-2**: 跨越2列
- **row-2**: 跨越2行
- **标准**: 1列 x 自动高度

## 动画系统

### 缓动函数
- **ease-smooth**: `cubic-bezier(0.16, 1, 0.3, 1)` - 平滑出场
- **ease-bounce**: `cubic-bezier(0.34, 1.56, 0.64, 1)` - 弹性效果
- **ease-in-out**: `cubic-bezier(0.4, 0, 0.2, 1)` - 标准缓动

### 持续时间
- **fast**: 150ms - 微交互
- **normal**: 300ms - 标准过渡
- **slow**: 500ms - 显著变化
- **dramatic**: 1000ms - 戏剧性入场

### 关键动画

#### 渐变流动
```css
@keyframes gradientShift {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}
/* duration: 20s, timing: ease-in-out, iteration: infinite */
```

#### 发光脉冲
```css
@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 0.8; }
}
/* duration: 4s, timing: ease-in-out, iteration: infinite */
```

#### 字符显现
```css
@keyframes charReveal {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
/* duration: 0.6s, timing: cubic-bezier(0.16, 1, 0.3, 1) */
```

#### 卡片入场
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
/* duration: 0.6s, timing: ease-out */
```

#### 玻璃闪光
```css
@keyframes shimmer {
  0%, 100% { transform: translateX(-10%) translateY(-10%); }
  50% { transform: translateX(10%) translateY(10%); }
}
/* duration: 8s, timing: ease-in-out, iteration: infinite */
```

## 电影感效果

### 背景层次
1. **基础图片** - loliapi ACG 背景
2. **渐变叠加** - 紫粉渐变光晕
3. **暗角效果** - 边缘暗化
4. **噪点纹理** - 胶片质感

### 景深效果
```css
.cinematic-bg {
  transform: scale(1.1);
  transition: transform 2s cubic-bezier(0.16, 1, 0.3, 1);
}

.cinematic-bg.loaded {
  transform: scale(1);
}
```

### 粒子效果
- 数量: 20个
- 大小: 4px
- 颜色: rgba(255, 255, 255, 0.5)
- 动画: 向上漂浮

## 交互模式

### 悬停状态
- 卡片: translateY(-4px) + 增强阴影
- 按钮: translateY(-2px) scale(1.02) + 光泽滑动
- 链接: 颜色过渡 + 下划线

### 焦点状态
- 轮廓: 2px solid rgba(120, 119, 198, 0.8)
- 偏移: 2px
- 过渡: 0.2s ease

### 激活状态
- 缩放: scale(0.98)
- 过渡: 0.1s ease

## 响应式断点

- **Desktop**: > 1024px - 4列 Bento Grid
- **Tablet**: 641px - 1024px - 2列 Bento Grid
- **Mobile**: <= 640px - 1列 Bento Grid

## 阴影系统

### 玻璃阴影
- **sm**: `0 4px 20px rgba(0, 0, 0, 0.2)`
- **md**: `0 8px 32px rgba(0, 0, 0, 0.1)`
- **lg**: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`
- **hover**: `0 20px 40px rgba(0, 0, 0, 0.15)`

## 圆角系统

- **sm**: 12px - 小卡片、按钮
- **md**: 16px - 中等卡片
- **lg**: 24px - 大卡片
- **xl**: 40px - Hero 卡片
- **full**: 9999px - 圆形元素

## 邮箱通知系统

### 功能概述
留言反馈系统支持邮件通知功能，包括：
- **管理员通知**：游客提交留言时，管理员收到邮件通知
- **用户通知**：管理员回复留言时，游客收到邮件通知

### 配置项
| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| smtp_host | SMTP 服务器地址 | - |
| smtp_port | SMTP 端口号 | 465 |
| smtp_secure | 是否使用 SSL/TLS 加密 | true |
| smtp_user | SMTP 用户名 | - |
| smtp_password | SMTP 密码 | - |
| from_email | 发件人邮箱 | - |
| admin_email | 管理员邮箱（接收通知） | - |
| notify_admin | 游客留言时发送通知 | true |
| notify_user | 回复时发送通知给用户 | true |

### 数据库表结构
```sql
CREATE TABLE IF NOT EXISTS email_settings (
  id INTEGER PRIMARY KEY,
  smtp_host TEXT DEFAULT '',
  smtp_port INTEGER DEFAULT 465,
  smtp_secure INTEGER DEFAULT 1,
  smtp_user TEXT DEFAULT '',
  smtp_password TEXT DEFAULT '',
  from_email TEXT DEFAULT '',
  admin_email TEXT DEFAULT '',
  notify_admin INTEGER DEFAULT 1,
  notify_user INTEGER DEFAULT 1
);
```

### API 端点
- `GET /api/email` - 获取邮箱设置
- `POST /api/email` - 保存邮箱设置
- `POST /api/email/test` - 发送测试邮件

### 邮件模板
邮件使用 HTML 格式，包含完整的样式设计，与博客整体风格保持一致。
