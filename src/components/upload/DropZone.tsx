import { useEffect, useRef, useState } from 'react'
import {
  Upload,
  FileImage,
  FileText,
  Clipboard,
  AlertCircle,
} from 'lucide-react'
import { useImageUpload } from '../../hooks/useImageUpload'
import { cn } from '../../lib/cn'

export default function DropZone() {
  const { handleDrop, handleFileSelect, handlePaste, processFile } =
    useImageUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            setError(null)
            processFile(file)
          }
          return
        }
      }
    }
    window.addEventListener('paste', handler)
    return () => window.removeEventListener('paste', handler)
  }, [processFile])

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)
    handleDrop(e)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    handleFileSelect(e)
  }

  const loadDemoImage = async () => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 600
      canvas.height = 400
      const ctx = canvas.getContext('2d')!

      ctx.fillStyle = '#1f2937'
      ctx.fillRect(0, 0, 600, 400)

      ctx.fillStyle = '#f9fafb'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('SmartOCR.ai Demo', 300, 120)

      ctx.font = '18px Arial'
      ctx.fillStyle = '#9ca3af'
      ctx.fillText('This is a sample image', 300, 180)
      ctx.fillText('to test OCR extraction', 300, 210)

      ctx.font = '16px monospace'
      ctx.fillStyle = '#60a5fa'
      ctx.fillText('Numbers: 1234567890', 300, 270)
      ctx.fillText('Symbols: @#$%&*!', 300, 295)

      ctx.font = 'italic 14px serif'
      ctx.fillStyle = '#a78bfa'
      ctx.fillText('Languages: English, Spanish, French', 300, 340)

      const dataUrl = canvas.toDataURL('image/png')
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'demo.png', { type: 'image/png' })
      processFile(file)
    } catch {
      setError('Failed to generate demo image')
    }
  }

  return (
    <div className="animate-fade-in">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'glass-panel relative cursor-pointer border-2 border-dashed p-12 text-center transition-all duration-300 hover:border-brand-500/50 hover:bg-brand-500/5',
          isDragging && 'drop-zone-active'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={onFileChange}
          className="hidden"
        />

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-800/50">
          <Upload className="h-10 w-10 text-brand-400" />
        </div>

        <h2 className="mb-2 text-xl font-semibold text-white">
          Drop your file here
        </h2>
        <p className="mb-6 text-gray-400">
          or click to browse your files
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1.5 rounded-lg bg-gray-800/50 px-3 py-1.5">
            <FileImage className="h-3.5 w-3.5" />
            PNG, JPG, WebP
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-gray-800/50 px-3 py-1.5">
            <FileText className="h-3.5 w-3.5" />
            PDF
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-gray-800/50 px-3 py-1.5">
            <Clipboard className="h-3.5 w-3.5" />
            Paste (Ctrl+V)
          </span>
        </div>

        <p className="mt-4 text-xs text-gray-600">Maximum file size: 20MB</p>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={(e) => {
            e.stopPropagation()
            loadDemoImage()
          }}
          className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          Try with a demo image
        </button>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
