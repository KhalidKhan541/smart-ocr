import { ChevronDown, Globe } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useOcrStore } from '../../stores/ocr-store'
import { cn } from '../../lib/cn'

const LANGUAGES = [
  { code: 'eng', name: 'English', flag: '🇺🇸' },
  { code: 'spa', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fra', name: 'French', flag: '🇫🇷' },
  { code: 'deu', name: 'German', flag: '🇩🇪' },
  { code: 'ita', name: 'Italian', flag: '🇮🇹' },
  { code: 'por', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'rus', name: 'Russian', flag: '🇷🇺' },
  { code: 'jpn', name: 'Japanese', flag: '🇯🇵' },
  { code: 'kor', name: 'Korean', flag: '🇰🇷' },
  { code: 'chi_sim', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'chi_tra', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'ara', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hin', name: 'Hindi', flag: '🇮🇳' },
  { code: 'nld', name: 'Dutch', flag: '🇳🇱' },
  { code: 'swe', name: 'Swedish', flag: '🇸🇪' },
  { code: 'pol', name: 'Polish', flag: '🇵🇱' },
  { code: 'tur', name: 'Turkish', flag: '🇹🇷' },
  { code: 'vie', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'tha', name: 'Thai', flag: '🇹🇭' },
]

export default function LanguageSelector() {
  const { selectedLanguage, setSelectedLanguage } = useOcrStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-200 transition-all hover:bg-gray-700 border border-gray-700"
      >
        <Globe className="h-4 w-4 text-brand-400" />
        <span>{current.flag}</span>
        <span>{current.name}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-64 max-h-80 overflow-y-auto rounded-xl bg-gray-800 border border-gray-700 shadow-2xl animate-fade-in">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setSelectedLanguage(lang.code)
                setIsOpen(false)
              }}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
                selectedLanguage === lang.code
                  ? 'bg-brand-500/20 text-brand-400'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              )}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
