import React from 'react'
import { Button } from './ui/button'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

const PreviewArea: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* شريط أدوات المعاينة */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">المعاينة</h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button variant="outline" size="sm">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Play className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* منطقة المعاينة */}
      <div className="flex-1 flex items-center justify-center bg-background p-4">
        <div 
          className="relative bg-[#1a1a2e] rounded-md shadow-lg"
          style={{ 
            width: '270px', 
            height: '480px', 
            aspectRatio: '9/16'
          }}
        >
          {/* محتوى المعاينة - مثال لمشهد العنوان */}
          <div className="h-full w-full flex flex-col items-center justify-center p-4 text-white">
            <p className="text-[#ff8c00] text-lg mb-2">حدثك العلمي الأهم لعام 2025!</p>
            <h1 className="text-2xl font-bold mb-1">المحفل العلمي الدولي السادس عشر</h1>
            <h2 className="text-xl mb-4">أنقرة 🇹🇷 يوليو 2025</h2>
            
            {/* مثال للشعارات */}
            <div className="flex gap-3 mt-4">
              <div className="w-12 h-12 bg-white/20 rounded-full"></div>
              <div className="w-12 h-12 bg-white/20 rounded-full"></div>
              <div className="w-12 h-12 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* شريط الزمن المبسط */}
      <div className="h-8 border-t border-border bg-muted flex items-center px-4">
        <div className="w-full bg-border rounded-full h-2 overflow-hidden">
          <div className="bg-primary h-full w-1/4"></div>
        </div>
      </div>
    </div>
  )
}

export default PreviewArea
