const DATE_FIELDS = ['created_at', 'updated_at']

export function normalizeDates(obj) {
  if (!obj) return obj
  for (const field of DATE_FIELDS) {
    if (obj[field] && typeof obj[field] === 'string') {
      obj[field] = toISOString(obj[field])
    }
  }
  return obj
}

export function normalizeDatesArray(arr) {
  if (!arr) return arr
  return arr.map(item => normalizeDates(item))
}

export function getChinaDate() {
  const now = new Date()
  const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  return chinaTime.toISOString().split('T')[0]
}

export function getChinaDateString() {
  const now = new Date()
  const chinaTime = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  return `${chinaTime.getUTCFullYear()}-${String(chinaTime.getUTCMonth() + 1).padStart(2, '0')}-${String(chinaTime.getUTCDate()).padStart(2, '0')}`
}

function toISOString(dateStr) {
  if (dateStr.includes('T')) return dateStr
  return dateStr.replace(' ', 'T') + '.000Z'
}
