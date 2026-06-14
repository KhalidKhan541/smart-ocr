import { useEffect } from 'react'
import {
  X,
  FileText,
  Clock,
  Trash2,
  Trash,
  Image,
  FileImage,
} from 'lucide-react'
import { useHistory } from '../../hooks/useHistory'
import { useOcrStore } from '../../stores/ocr-store'
import { cn } from '../../lib/cn'

interface HistorySidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function HistorySidebar({ isOpen, onClose }: HistorySidebarProps) {
  const { history, removeHistory, clearHistory } = useHistory()
  const { setUploadedImage, setExtractedText, reset } = useOcrStore()

  const loadEntry = (entry: (typeof history)[0]) => {
    if (entry.imageUrl) {
      setUploadedImage(entry.imageUrl)
      setExtractedText(entry.extractedText)
    }
    onClose()
  }

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-4 w-4 text-red-400" />
    return <FileImage className="h-4 w-4 text-blue-400" />
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-80 bg-gray-900 border-l border-gray-800 shadow-2xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-400" />
              <h2 className="font-semibold text-white">History</h2>
              <span className="text-xs text-gray-500">({history.length})</span>
            </div>
            <div className="flex items-center gap-1">
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-800 hover:text-red-400"
                  title="Clear all"
                >
                  <Trash className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {history.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-600 text-sm">
                No extractions yet
              </div>
            ) : (
              history.map((entry) => (
                <div
                  key={entry.id}
                  className="group rounded-xl bg-gray-800/50 p-3 transition-all hover:bg-gray-800 border border-gray-800 hover:border-gray-700"
                >
                  <div className="flex items-start gap-3">
                    {entry.imageUrl ? (
                      <img
                        src={entry.imageUrl}
                        alt={entry.fileName}
                        className="h-10 w-10 rounded-lg object-cover bg-gray-700"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800">
                        {getFileIcon(entry.fileType)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {entry.fileName}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {entry.extractedText.substring(0, 60)}...
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-600">
                          {formatTime(entry.timestamp)}
                        </span>
                        <span className="text-xs text-gray-700">&middot;</span>
                        <span className="text-xs text-gray-600 uppercase">
                          {entry.language}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {entry.imageUrl && (
                        <button
                          onClick={() => loadEntry(entry)}
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-700 hover:text-brand-400 transition-colors"
                          title="View"
                        >
                          <Image className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => removeHistory(entry.id)}
                        className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-700 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
