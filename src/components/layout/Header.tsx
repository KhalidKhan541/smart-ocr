import { ScanText, History, RotateCcw } from 'lucide-react'
import { useOcrStore } from '../../stores/ocr-store'

interface HeaderProps {
  onHistoryToggle: () => void
}

export default function Header({ onHistoryToggle }: HeaderProps) {
  const { uploadedImage, reset } = useOcrStore()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-lg shadow-brand-500/25">
            <ScanText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">SmartOCR.ai</span>
        </div>

        <nav className="flex items-center gap-2">
          {uploadedImage && (
            <button
              onClick={reset}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">New Scan</span>
            </button>
          )}
          <button
            onClick={onHistoryToggle}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:bg-gray-800 hover:text-white"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
