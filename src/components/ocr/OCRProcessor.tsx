import { useEffect, useState } from 'react'
import {
  Play,
  X,
  AlertCircle,
} from 'lucide-react'
import { useOcrStore } from '../../stores/ocr-store'
import { useImageUpload } from '../../hooks/useImageUpload'
import { useOCR } from '../../hooks/useOCR'
import Progress from '../ui/Progress'
import Spinner from '../ui/Spinner'
import LanguageSelector from './LanguageSelector'
import OutputPanel from './OutputPanel'

export default function OCRProcessor() {
  const {
    uploadedImage,
    isProcessing,
    progress,
    status,
    extractedText,
  } = useOcrStore()
  const { clearUpload } = useImageUpload()
  const { processImage } = useOCR()
  const [showImage, setShowImage] = useState(true)

  useEffect(() => {
    if (uploadedImage && !isProcessing && !extractedText) {
      processImage()
    }
  }, [uploadedImage])

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <LanguageSelector />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImage(!showImage)}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 transition-all hover:bg-gray-700 hover:text-white"
          >
            {showImage ? 'Hide Image' : 'Show Image'}
          </button>
          <button
            onClick={clearUpload}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 transition-all hover:bg-gray-700 hover:text-white"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      {isProcessing && (
        <div className="glass-panel p-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <Spinner size="md" />
            <span className="text-sm font-medium text-gray-300">{status}</span>
          </div>
          <Progress value={progress} size="md" />
          <p className="text-xs text-gray-500">
            {progress < 30
              ? 'Downloading language data...'
              : progress < 70
              ? 'Analyzing image...'
              : progress < 100
              ? 'Extracting text...'
              : 'Finalizing...'}
          </p>
        </div>
      )}

      {!isProcessing && status && progress === 100 && (
        <div className="glass-panel p-4 flex items-center gap-3 border-green-500/30 bg-green-500/5 animate-slide-up">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-green-400 font-medium">{status}</span>
        </div>
      )}

      {!isProcessing && status.includes('Error') && (
        <div className="glass-panel p-4 flex items-center gap-3 border-red-500/30 bg-red-500/5 animate-slide-up">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-sm text-red-400">{status}</span>
          <button
            onClick={processImage}
            className="ml-auto text-sm text-brand-400 hover:text-brand-300"
          >
            Retry
          </button>
        </div>
      )}

      <div className={`grid gap-4 ${showImage ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {showImage && uploadedImage && (
          <div className="glass-panel overflow-hidden animate-slide-up">
            <div className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-400">Source Image</h3>
              <span className="text-xs text-gray-600">
                {useOcrStore.getState().uploadedFile?.name || 'Pasted image'}
              </span>
            </div>
            <div className="p-4 max-h-[600px] overflow-auto flex items-center justify-center bg-gray-900/50">
              <img
                src={uploadedImage}
                alt="Source"
                className="max-w-full max-h-[560px] rounded-lg object-contain"
              />
            </div>
          </div>
        )}

        <OutputPanel />
      </div>
    </div>
  )
}
