export function parseDate(dateStr) {
  if (!dateStr) return new Date()
  if (dateStr.includes('T')) return new Date(dateStr)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date(dateStr)
  return new Date(dateStr.replace(' ', 'T') + 'Z')
}
