import { useState } from 'react'
import './App.css'

// مكونات الواجهة الرئيسية
import Toolbar from './components/Toolbar'
import SlidesPanel from './components/SlidesPanel'
import PreviewArea from './components/PreviewArea'
import PropertiesPanel from './components/PropertiesPanel'

function App() {
  // حالة المشروع الحالي
  const [projectName, setProjectName] = useState<string>("مشروع جديد")
  
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* شريط الأدوات العلوي */}
      <Toolbar projectName={projectName} />
      
      {/* المنطقة الرئيسية */}
      <div className="flex flex-1 overflow-hidden">
        {/* لوحة المشاهد */}
        <div className="w-64 border-l border-border bg-muted">
          <SlidesPanel />
        </div>
        
        {/* منطقة المعاينة */}
        <div className="flex-1 overflow-auto">
          <PreviewArea />
        </div>
        
        {/* لوحة الخصائص */}
        <div className="w-80 border-r border-border bg-muted">
          <PropertiesPanel />
        </div>
      </div>
      
      {/* شريط الحالة */}
      <div className="h-6 border-t border-border bg-muted text-xs px-2 flex items-center justify-between">
        <span>جاهز</span>
        <span>محرر قوالب الفيديو المتحركة v0.1</span>
      </div>
    </div>
  )
}

export default App
