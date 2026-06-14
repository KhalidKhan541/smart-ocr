import { downloadText, downloadAsDocx } from './text-utils'

export function exportAsTxt(text: string, fileName: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, '') || 'ocr-output'
  downloadText(text, `${baseName}.txt`, 'text/plain')
}

export function exportAsDocx(text: string, fileName: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, '') || 'ocr-output'
  downloadAsDocx(text, `${baseName}.doc`)
}

export function exportAsHtml(text: string, fileName: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, '') || 'ocr-output'
  const lines = text.split('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${baseName} - SmartOCR Export</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #333; }
    .header { border-bottom: 2px solid #6366f1; padding-bottom: 1rem; margin-bottom: 2rem; }
    .text { white-space: pre-wrap; font-family: 'Consolas', monospace; }
    .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; font-size: 0.85rem; color: #888; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${baseName}</h1>
    <p>Extracted with SmartOCR.ai</p>
  </div>
  <div class="text">${lines.map((line) => line || '&nbsp;').join('\n')}</div>
  <div class="footer">
    <p>Exported on ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>`

  downloadText(html, `${baseName}.html`, 'text/html')
}
