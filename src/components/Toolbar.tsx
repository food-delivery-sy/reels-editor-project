import React from 'react'
import { Button } from './ui/button'
import { Save, FileUp, FileDown, Play, Settings, HelpCircle } from 'lucide-react'

interface ToolbarProps {
  projectName: string
}

const Toolbar: React.FC<ToolbarProps> = ({ projectName }) => {
  return (
    <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
      {/* القسم الأيسر - اسم المشروع */}
      <div className="font-semibold text-lg">{projectName}</div>
      
      {/* القسم الأوسط - أزرار الأدوات الرئيسية */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <FileUp className="h-4 w-4" />
          <span>فتح</span>
        </Button>
        
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Save className="h-4 w-4" />
          <span>حفظ</span>
        </Button>
        
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <FileDown className="h-4 w-4" />
          <span>تصدير</span>
        </Button>
        
        <Button variant="primary" size="sm" className="flex items-center gap-1">
          <Play className="h-4 w-4" />
          <span>معاينة</span>
        </Button>
      </div>
      
      {/* القسم الأيمن - إعدادات ومساعدة */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

export default Toolbar
