import { useRef, useEffect, useState } from 'react'

interface TextViewerProps {
  text: string
}

export default function TextViewer({ text }: TextViewerProps) {
  const textRef = useRef<HTMLTextAreaElement>(null)
  const [fontSize, setFontSize] = useState(14)

  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.fontSize = `${fontSize}px`
    }
  }, [fontSize])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <button
          onClick={() => setFontSize(Math.max(10, fontSize - 2))}
          className="rounded px-2 py-1 hover:bg-gray-800 hover:text-gray-300 transition-colors"
        >
          A-
        </button>
        <span>{fontSize}px</span>
        <button
          onClick={() => setFontSize(Math.min(24, fontSize + 2))}
          className="rounded px-2 py-1 hover:bg-gray-800 hover:text-gray-300 transition-colors"
        >
          A+
        </button>
      </div>

      <textarea
        ref={textRef}
        readOnly
        value={text}
        className="w-full h-full min-h-[260px] bg-transparent text-gray-200 font-mono leading-relaxed resize-none focus:outline-none placeholder-gray-600"
        style={{ fontSize: `${fontSize}px` }}
        placeholder="Extracted text will appear here..."
      />
    </div>
  )
}


