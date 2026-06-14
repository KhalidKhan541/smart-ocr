import { useState } from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import DropZone from './components/upload/DropZone'
import OCRProcessor from './components/ocr/OCRProcessor'
import HistorySidebar from './components/history/HistorySidebar'
import { useOcrStore } from './stores/ocr-store'

export default function App() {
  const [historyOpen, setHistoryOpen] = useState(false)
  const { uploadedImage, extractedText } = useOcrStore()

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-gray-100">
      <Header onHistoryToggle={() => setHistoryOpen(!historyOpen)} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            SmartOCR.ai
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Extract text from images and PDFs instantly with AI-powered OCR. 
            Fast, accurate, and completely free.
          </p>
        </div>

        {!uploadedImage ? (
          <DropZone />
        ) : (
          <OCRProcessor />
        )}
      </main>

      <Footer />

      <HistorySidebar
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  )
}
