import { useCallback } from 'react'
import { useOcrStore } from '../stores/ocr-store'

const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/gif',
  'application/pdf',
]

const MAX_SIZE = 20 * 1024 * 1024

export function useImageUpload() {
  const { setUploadedImage, setUploadedFile, reset } = useOcrStore()

  const processFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        alert('Unsupported file type. Please upload an image or PDF.')
        return
      }

      if (file.size > MAX_SIZE) {
        alert('File too large. Maximum size is 20MB.')
        return
      }

      if (file.type === 'application/pdf') {
        const reader = new FileReader()
        reader.onload = () => {
          setUploadedImage(reader.result as string)
          setUploadedFile(file)
        }
        reader.readAsDataURL(file)
      } else {
        const reader = new FileReader()
        reader.onload = () => {
          setUploadedImage(reader.result as string)
          setUploadedFile(file)
        }
        reader.readAsDataURL(file)
      }
    },
    [setUploadedImage, setUploadedFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) processFile(file)
          return
        }
      }
    },
    [processFile]
  )

  const clearUpload = useCallback(() => {
    reset()
  }, [reset])

  return {
    handleDrop,
    handleFileSelect,
    handlePaste,
    clearUpload,
    processFile,
  }
}
