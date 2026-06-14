import { useState } from 'react'
import {
  Copy,
  Download,
  FileText,
  FileType,
  Code,
  Check,
} from 'lucide-react'
import { useOcrStore } from '../../stores/ocr-store'
import { copyToClipboard } from '../../lib/text-utils'
import { exportAsTxt, exportAsDocx, exportAsHtml } from '../../lib/export'
import TextViewer from './TextViewer'

export default function OutputPanel() {
  const { extractedText, uploadedFile } = useOcrStore()
  const [copied, setCopied] = useState(false)
  const [showExport, setShowExport] = useState(false)

  const fileName = uploadedFile?.name || 'ocr-output'

  const handleCopy = async () => {
    const success = await copyToClipboard(extractedText)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const wordCount = extractedText
    ? extractedText.split(/\s+/).filter(Boolean).length
    : 0

  const charCount = extractedText ? extractedText.length : 0

  return (
    <div className="glass-panel overflow-hidden animate-slide-in-right">
      <div className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-gray-400">Extracted Text</h3>
          {extractedText && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>{wordCount} words</span>
              <span>&middot;</span>
              <span>{charCount} chars</span>
            </div>
          )}
        </div>

        {extractedText && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-300 transition-all hover:bg-gray-700 hover:text-white"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowExport(!showExport)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-300 transition-all hover:bg-gray-700 hover:text-white"
                title="Download"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>

              {showExport && (
                <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl bg-gray-800 border border-gray-700 shadow-2xl animate-fade-in">
                  <button
                    onClick={() => {
                      exportAsTxt(extractedText, fileName)
                      setShowExport(false)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    Plain Text (.txt)
                  </button>
                  <button
                    onClick={() => {
                      exportAsDocx(extractedText, fileName)
                      setShowExport(false)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <FileType className="h-4 w-4" />
                    Word (.doc)
                  </button>
                  <button
                    onClick={() => {
                      exportAsHtml(extractedText, fileName)
                      setShowExport(false)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <Code className="h-4 w-4" />
                    HTML (.html)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 min-h-[300px] max-h-[600px] overflow-auto">
        {extractedText ? (
          <TextViewer text={extractedText} />
        ) : (
          <div className="flex h-[260px] items-center justify-center text-gray-600 text-sm">
            Extracted text will appear here
          </div>
        )}
      </div>
    </div>
  )
}
