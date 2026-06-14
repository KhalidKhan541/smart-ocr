import { useCallback, useRef } from 'react'
import Tesseract from 'tesseract.js'
import { useOcrStore } from '../stores/ocr-store'
import { postProcessText } from '../lib/text-utils'
import { useHistory } from './useHistory'

const LANG_MAP: Record<string, string> = {
  eng: 'eng',
  spa: 'spa',
  fra: 'fra',
  deu: 'deu',
  ita: 'ita',
  por: 'por',
  rus: 'rus',
  jpn: 'jpn',
  kor: 'kor',
  chi_sim: 'chi_sim',
  chi_tra: 'chi_tra',
  ara: 'ara',
  hin: 'hin',
  nld: 'nld',
  swe: 'swe',
  pol: 'pol',
  tur: 'tur',
  vie: 'vie',
  tha: 'tha',
}

export function useOCR() {
  const {
    setIsProcessing,
    setProgress,
    setStatus,
    setExtractedText,
    selectedLanguage,
    uploadedImage,
    uploadedFile,
  } = useOcrStore()

  const { addToHistory } = useHistory()
  const workerRef = useRef<Tesseract.Worker | null>(null)

  const processImage = useCallback(async () => {
    if (!uploadedImage) return

    setIsProcessing(true)
    setProgress(0)
    setStatus('Initializing OCR engine...')
    setExtractedText('')

    try {
      if (workerRef.current) {
        await workerRef.current.terminate()
      }

      const lang = LANG_MAP[selectedLanguage] || 'eng'

      const worker = await Tesseract.createWorker(lang, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round((m.progress || 0) * 100))
            setStatus('Recognizing text...')
          } else if (m.status === 'loading language traineddata') {
            setProgress(Math.round((m.progress || 0) * 30))
            setStatus(`Loading ${lang} language data...`)
          } else if (m.status === 'initializing api') {
            setProgress(35)
            setStatus('Initializing OCR engine...')
          } else if (m.status === 'loading tesseract core') {
            setProgress(10)
            setStatus('Loading OCR core...')
          }
        },
      })

      workerRef.current = worker

      setProgress(40)
      setStatus('Processing image...')

      const result = await worker.recognize(uploadedImage)
      const rawText = result.data.text
      const cleanedText = postProcessText(rawText)

      setExtractedText(cleanedText)
      setProgress(100)
      setStatus('Complete!')

      if (uploadedFile) {
        addToHistory(
          uploadedFile.name,
          uploadedFile.type,
          cleanedText,
          selectedLanguage,
          uploadedImage
        )
      }

      await worker.terminate()
      workerRef.current = null
    } catch (error) {
      console.error('OCR error:', error)
      setStatus('Error processing image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [
    uploadedImage,
    uploadedFile,
    selectedLanguage,
    setIsProcessing,
    setProgress,
    setStatus,
    setExtractedText,
    addToHistory,
  ])

  return { processImage }
}
