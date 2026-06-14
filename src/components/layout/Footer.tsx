import { ScanText, Github, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950/80 backdrop-blur-xl">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-gray-400">
            <ScanText className="h-4 w-4" />
            <span className="text-sm">
              &copy; {new Date().getFullYear()} SmartOCR.ai. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 fill-pink-500 text-pink-500" />
            <span>using Tesseract.js</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
