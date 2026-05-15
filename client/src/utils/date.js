export function parseDate(dateStr) {
  if (!dateStr) return new Date()
  if (dateStr.includes('T')) return new Date(dateStr)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date(dateStr)
  return new Date(dateStr.replace(' ', 'T') + 'Z')
}

export function formatDate(dateStr, options = {}) {
  const date = parseDate(dateStr)
  const defaults = { year: 'numeric', month: 'short', day: 'numeric' }
  return date.toLocaleDateString('zh-CN', { ...defaults, ...options })
}

export function formatFullDate(dateStr) {
  return formatDate(dateStr, { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatShortDate(dateStr) {
  return formatDate(dateStr, { month: 'short', day: 'numeric' })
}
