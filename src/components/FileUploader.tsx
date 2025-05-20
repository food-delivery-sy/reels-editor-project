import React from 'react'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Upload, FileJson, FileCode, AlertCircle } from 'lucide-react'

// نوع بيانات حالة التحميل
type UploadState = 'idle' | 'loading' | 'success' | 'error'

const FileUploader: React.FC = () => {
  // حالة التحميل
  const [uploadState, setUploadState] = React.useState<UploadState>('idle')
  // اسم الملف المحمل
  const [fileName, setFileName] = React.useState<string>('')
  // رسالة الخطأ
  const [errorMessage, setErrorMessage] = React.useState<string>('')
  
  // مرجع لعنصر إدخال الملف
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  // معالج تحميل الملف
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setUploadState('loading')
    setFileName(file.name)
    
    // قراءة محتوى الملف
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        
        // تحليل الملف حسب نوعه
        if (file.name.endsWith('.json')) {
          // تحليل ملف JSON
          const jsonData = JSON.parse(content)
          
          // التحقق من صحة البنية
          if (isValidReelsConfig(jsonData)) {
            console.log('تم تحميل ملف JSON بنجاح:', jsonData)
            setUploadState('success')
          } else {
            throw new Error('بنية ملف JSON غير صالحة')
          }
        } else if (file.name.endsWith('.html')) {
          // استخراج كائن reelsConfig من ملف HTML
          const reelsConfig = extractReelsConfigFromHTML(content)
          
          if (reelsConfig) {
            console.log('تم استخراج reelsConfig من HTML بنجاح:', reelsConfig)
            setUploadState('success')
          } else {
            throw new Error('لم يتم العثور على كائن reelsConfig في ملف HTML')
          }
        } else {
          throw new Error('نوع الملف غير مدعوم. يرجى تحميل ملف JSON أو HTML')
        }
      } catch (error) {
        console.error('خطأ في تحليل الملف:', error)
        setUploadState('error')
        setErrorMessage(error instanceof Error ? error.message : 'حدث خطأ غير معروف')
      }
    }
    
    reader.onerror = () => {
      setUploadState('error')
      setErrorMessage('حدث خطأ أثناء قراءة الملف')
    }
    
    // قراءة الملف كنص
    reader.readAsText(file)
  }
  
  // التحقق من صحة بنية reelsConfig
  const isValidReelsConfig = (data: any): boolean => {
    // التحقق من وجود الحقول الأساسية
    return (
      data &&
      typeof data === 'object' &&
      'general' in data &&
      'slides' in data &&
      Array.isArray(data.slides)
    )
  }
  
  // استخراج كائن reelsConfig من ملف HTML
  const extractReelsConfigFromHTML = (htmlContent: string): any | null => {
    // البحث عن تعريف reelsConfig في النص
    const reelsConfigRegex = /const\s+reelsConfig\s*=\s*({[\s\S]*?});/
    const match = htmlContent.match(reelsConfigRegex)
    
    if (match && match[1]) {
      try {
        // تنظيف النص وتحويله إلى كائن JavaScript
        const jsonStr = match[1]
          .replace(/\/\*[\s\S]*?\*\//g, '') // إزالة التعليقات متعددة الأسطر
          .replace(/\/\/.*/g, '') // إزالة التعليقات أحادية السطر
        
        // استخدام Function لتقييم النص كـ JavaScript
        // ملاحظة: هذا آمن لأننا نتحكم في المدخلات ونقوم بتنظيفها
        const reelsConfig = Function(`"use strict"; return (${jsonStr})`)()
        
        // التحقق من صحة البنية
        if (isValidReelsConfig(reelsConfig)) {
          return reelsConfig
        }
      } catch (error) {
        console.error('خطأ في تحليل كائن reelsConfig من HTML:', error)
      }
    }
    
    return null
  }
  
  // تفعيل نافذة اختيار الملف
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }
  
  // إعادة تعيين حالة التحميل
  const resetUpload = () => {
    setUploadState('idle')
    setFileName('')
    setErrorMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  return (
    <div className="p-4 border border-border rounded-md bg-card">
      <div className="text-center mb-4">
        <h3 className="font-semibold text-lg mb-1">تحميل قالب</h3>
        <p className="text-sm text-muted-foreground">
          قم بتحميل ملف HTML أو JSON يحتوي على كائن reelsConfig
        </p>
      </div>
      
      {/* حالة التحميل */}
      {uploadState === 'idle' && (
        <div className="flex flex-col items-center gap-4">
          <div 
            className="border-2 border-dashed border-border rounded-md p-8 w-full text-center cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={triggerFileInput}
          >
            <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium">انقر لاختيار ملف أو اسحبه وأفلته هنا</p>
            <p className="text-sm text-muted-foreground mt-1">
              يدعم ملفات HTML و JSON
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={triggerFileInput}
            >
              <FileJson className="h-4 w-4" />
              <span>تحميل JSON</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={triggerFileInput}
            >
              <FileCode className="h-4 w-4" />
              <span>تحميل HTML</span>
            </Button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".html,.json"
            onChange={handleFileUpload}
          />
        </div>
      )}
      
      {/* حالة جاري التحميل */}
      {uploadState === 'loading' && (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-2"></div>
          <p>جاري تحليل الملف...</p>
          <p className="text-sm text-muted-foreground mt-1">{fileName}</p>
        </div>
      )}
      
      {/* حالة النجاح */}
      {uploadState === 'success' && (
        <div className="text-center py-4">
          <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-medium text-green-600">تم تحميل الملف بنجاح!</p>
          <p className="text-sm text-muted-foreground mt-1">{fileName}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={resetUpload}
          >
            تحميل ملف آخر
          </Button>
        </div>
      )}
      
      {/* حالة الخطأ */}
      {uploadState === 'error' && (
        <div className="text-center py-4">
          <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="font-medium text-red-600">حدث خطأ أثناء تحميل الملف</p>
          <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={resetUpload}
          >
            حاول مرة أخرى
          </Button>
        </div>
      )}
    </div>
  )
}

export default FileUploader
