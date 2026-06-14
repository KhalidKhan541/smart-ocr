import { create } from 'zustand'

export interface HistoryEntry {
  id: string
  fileName: string
  fileType: string
  extractedText: string
  language: string
  timestamp: number
  imageUrl?: string
}

interface OcrState {
  uploadedImage: string | null
  uploadedFile: File | null
  extractedText: string
  isProcessing: boolean
  progress: number
  status: string
  selectedLanguage: string
  history: HistoryEntry[]

  setUploadedImage: (image: string | null) => void
  setUploadedFile: (file: File | null) => void
  setExtractedText: (text: string) => void
  setIsProcessing: (processing: boolean) => void
  setProgress: (progress: number) => void
  setStatus: (status: string) => void
  setSelectedLanguage: (language: string) => void
  addHistory: (entry: HistoryEntry) => void
  removeHistory: (id: string) => void
  clearHistory: () => void
  loadHistory: () => void
  reset: () => void
}

const HISTORY_KEY = 'smartocr-history'

export const useOcrStore = create<OcrState>((set, get) => ({
  uploadedImage: null,
  uploadedFile: null,
  extractedText: '',
  isProcessing: false,
  progress: 0,
  status: '',
  selectedLanguage: 'eng',
  history: [],

  setUploadedImage: (image) => set({ uploadedImage: image }),
  setUploadedFile: (file) => set({ uploadedFile: file }),
  setExtractedText: (text) => set({ extractedText: text }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setProgress: (progress) => set({ progress }),
  setStatus: (status) => set({ status }),
  setSelectedLanguage: (language) => set({ selectedLanguage: language }),

  addHistory: (entry) => {
    const history = [entry, ...get().history].slice(0, 50)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    set({ history })
  },

  removeHistory: (id) => {
    const history = get().history.filter((e) => e.id !== id)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    set({ history })
  },

  clearHistory: () => {
    localStorage.removeItem(HISTORY_KEY)
    set({ history: [] })
  },

  loadHistory: () => {
    try {
      const data = localStorage.getItem(HISTORY_KEY)
      if (data) {
        set({ history: JSON.parse(data) })
      }
    } catch {
      set({ history: [] })
    }
  },

  reset: () =>
    set({
      uploadedImage: null,
      uploadedFile: null,
      extractedText: '',
      isProcessing: false,
      progress: 0,
      status: '',
    }),
}))
