export function postProcessText(text: string): string {
  let cleaned = text

  cleaned = cleaned
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

  cleaned = cleaned.replace(/[^\S\n]+/g, ' ')

  cleaned = cleaned.replace(/(\n ){2,}/g, '\n')

  cleaned = cleaned.replace(/ {2,}/g, ' ')

  cleaned = cleaned.replace(/^[ ]+/gm, '')

  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')

  cleaned = cleaned.replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/–/g, '-')
    .replace(/—/g, '--')
    .replace(/…/g, '...')

  cleaned = cleaned.trim()

  return cleaned
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      return true
    } catch {
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}

export function downloadText(text: string, filename: string, mimeType = 'text/plain') {
  const blob = new Blob([text], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function downloadAsDocx(text: string, filename: string) {
  const lines = text.split('\n')

  const htmlContent = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>SmartOCR Export</title>
<style>
body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.5; }
p { margin: 0 0 6pt 0; }
</style>
</head>
<body>
${lines.map((line) => `<p>${escapeHtml(line) || '&nbsp;'}</p>`).join('')}
</body>
</html>`

  const blob = new Blob([htmlContent], {
    type: 'application/msword',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
