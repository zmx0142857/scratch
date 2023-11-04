export const between = (value, min, max) => {
  return Math.max(min, Math.min(max, value))
}

export const download = ({ url, str, type = 'application/json;charset=utf-8', blob, filename = '' } = {}) => {
  let objectUrl
  if (!url) {
    if (!blob)
      blob = new Blob([str], { type })
    url = objectUrl = window.URL.createObjectURL(blob)
  }

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  if (objectUrl)
    window.URL.revokeObjectURL(objectUrl)
}
