import { useEffect } from 'react'
import { useOcrStore, HistoryEntry } from '../stores/ocr-store'

export function useHistory() {
  const { history, loadHistory, addHistory, removeHistory, clearHistory } =
    useOcrStore()

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const addToHistory = (
    fileName: string,
    fileType: string,
    extractedText: string,
    language: string,
    imageUrl?: string
  ) => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      fileName,
      fileType,
      extractedText,
      language,
      timestamp: Date.now(),
      imageUrl,
    }
    addHistory(entry)
  }

  return {
    history,
    addToHistory,
    removeHistory,
    clearHistory,
  }
}
