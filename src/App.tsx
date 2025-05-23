import React from 'react'
import { Button } from './components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Separator } from './components/ui/separator'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 rtl">
      <header className="container mx-auto mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">محرر قوالب الفيديو المتحركة</h1>
        <p className="text-muted-foreground">أداة متقدمة لإنشاء وتحرير قوالب الفيديو المتحركة بواجهة سهلة الاستخدام</p>
      </header>

      <main className="container mx-auto">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="editor">المحرر</TabsTrigger>
            <TabsTrigger value="preview">المعاينة</TabsTrigger>
            <TabsTrigger value="export">التصدير</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">الشرائح</h2>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <Button className="w-full">إضافة شريحة جديدة</Button>
                </div>
              </div>
              
              <div className="bg-card p-4 rounded-lg border md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">منطقة التحرير</h2>
                <Separator className="my-4" />
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">منطقة معاينة الشريحة</p>
                </div>
                
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">العنوان</Label>
                      <Input id="title" placeholder="أدخل عنوان الشريحة" />
                    </div>
                    <div>
                      <Label htmlFor="duration">المدة (بالثواني)</Label>
                      <Input id="duration" type="number" defaultValue={5} min={1} />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="content">المحتوى</Label>
                    <textarea 
                      id="content" 
                      className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                      placeholder="أدخل محتوى الشريحة"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="bg-card p-4 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">معاينة المشروع</h2>
              <Separator className="my-4" />
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">معاينة المشروع الكامل</p>
              </div>
              <div className="mt-4 flex justify-center space-x-4 space-x-reverse">
                <Button variant="outline">إيقاف</Button>
                <Button>تشغيل</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="export">
            <div className="bg-card p-4 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">تصدير المشروع</h2>
              <Separator className="my-4" />
              
              <Alert className="mb-4">
                <AlertTitle>تنبيه</AlertTitle>
                <AlertDescription>
                  تأكد من حفظ مشروعك قبل التصدير لتجنب فقدان أي تغييرات.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="format">صيغة التصدير</Label>
                  <select 
                    id="format" 
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="mp4">MP4</option>
                    <option value="gif">GIF</option>
                    <option value="webm">WebM</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="quality">الجودة</Label>
                  <select 
                    id="quality" 
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="high">عالية</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </div>
              </div>
              
              <Button className="w-full">تصدير المشروع</Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="fixed bottom-4 right-4" variant="outline">
            مساعدة
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>مرحباً بك في محرر قوالب الفيديو المتحركة</DialogTitle>
            <DialogDescription>
              هذا التطبيق يتيح لك إنشاء وتحرير قوالب فيديو متحركة بسهولة. استخدم علامات التبويب للتنقل بين المحرر والمعاينة والتصدير.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p>للبدء، قم بإضافة شريحة جديدة من القائمة الجانبية.</p>
            <p>يمكنك تخصيص كل شريحة بإضافة نص وتعديل المدة والألوان.</p>
            <p>عند الانتهاء، يمكنك معاينة المشروع كاملاً ثم تصديره بالصيغة المناسبة.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}

export default App
