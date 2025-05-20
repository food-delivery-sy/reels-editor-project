import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Plus, Trash, Copy, ChevronUp, ChevronDown, Edit } from 'lucide-react';
import { useEditor } from '../lib/editor-context';
import { Slide, SlideType, createNewSlide } from '../lib/models';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const SlidesPanel: React.FC = () => {
  const { 
    project, 
    currentSlideId, 
    setCurrentSlideId, 
    addSlide, 
    removeSlide, 
    reorderSlides 
  } = useEditor();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSlideType, setNewSlideType] = useState<SlideType>('title');
  
  // معالج إضافة مشهد جديد
  const handleAddSlide = () => {
    // إنشاء معرف فريد للمشهد الجديد
    const newId = `slide_${Date.now()}`;
    
    // إنشاء مشهد جديد
    const newSlide = createNewSlide(newSlideType, newId);
    
    // إضافة المشهد إلى المشروع
    addSlide(newSlide);
    
    // إغلاق مربع الحوار
    setIsAddDialogOpen(false);
  };
  
  // معالج حذف مشهد
  const handleRemoveSlide = (slideId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // التأكد من وجود أكثر من مشهد واحد
    if (project.reelsConfig.slides.length <= 1) {
      alert('لا يمكن حذف المشهد الوحيد في المشروع');
      return;
    }
    
    // حذف المشهد
    removeSlide(slideId);
  };
  
  // معالج نسخ مشهد
  const handleDuplicateSlide = (slide: Slide, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // إنشاء معرف فريد للمشهد الجديد
    const newId = `slide_${Date.now()}`;
    
    // نسخ المشهد
    const newSlide: Slide = {
      ...JSON.parse(JSON.stringify(slide)),
      id: newId
    };
    
    // إضافة المشهد إلى المشروع
    addSlide(newSlide);
  };
  
  // معالج تحريك مشهد للأعلى
  const handleMoveUp = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // التأكد من أن المشهد ليس في الأعلى
    if (index <= 0) return;
    
    // نسخ مصفوفة المشاهد
    const slides = [...project.reelsConfig.slides];
    
    // تبديل المشهد مع المشهد السابق
    [slides[index], slides[index - 1]] = [slides[index - 1], slides[index]];
    
    // تحديث ترتيب المشاهد
    reorderSlides(slides.map(slide => slide.id));
  };
  
  // معالج تحريك مشهد للأسفل
  const handleMoveDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // التأكد من أن المشهد ليس في الأسفل
    if (index >= project.reelsConfig.slides.length - 1) return;
    
    // نسخ مصفوفة المشاهد
    const slides = [...project.reelsConfig.slides];
    
    // تبديل المشهد مع المشهد التالي
    [slides[index], slides[index + 1]] = [slides[index + 1], slides[index]];
    
    // تحديث ترتيب المشاهد
    reorderSlides(slides.map(slide => slide.id));
  };
  
  // الحصول على اسم نوع المشهد بالعربية
  const getSlideTypeName = (type: SlideType): string => {
    switch (type) {
      case 'title':
        return 'عنوان';
      case 'list':
        return 'قائمة';
      case 'features':
        return 'مزايا';
      case 'cta':
        return 'دعوة عمل';
      default:
        return type;
    }
  };
  
  // الحصول على معاينة مصغرة للمشهد
  const getSlidePreview = (slide: Slide): string => {
    switch (slide.type) {
      case 'title':
        return slide.content.mainTitle || 'عنوان رئيسي';
      case 'list':
        return slide.content.title || 'قائمة';
      case 'features':
        return slide.content.title || 'مزايا';
      case 'cta':
        return slide.content.title || 'دعوة عمل';
      default:
        return 'مشهد';
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* عنوان اللوحة */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">المشاهد</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>إضافة</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مشهد جديد</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>نوع المشهد</Label>
                  <RadioGroup 
                    value={newSlideType} 
                    onValueChange={(value) => setNewSlideType(value as SlideType)}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse border rounded-md p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="title" id="title" />
                      <Label htmlFor="title" className="cursor-pointer">عنوان</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse border rounded-md p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="list" id="list" />
                      <Label htmlFor="list" className="cursor-pointer">قائمة</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse border rounded-md p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="features" id="features" />
                      <Label htmlFor="features" className="cursor-pointer">مزايا</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse border rounded-md p-3 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="cta" id="cta" />
                      <Label htmlFor="cta" className="cursor-pointer">دعوة عمل</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button onClick={handleAddSlide} className="w-full">إضافة مشهد</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* قائمة المشاهد */}
      <div className="flex-1 overflow-y-auto p-2">
        {project.reelsConfig.slides.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            لا توجد مشاهد. أضف مشهداً جديداً للبدء.
          </div>
        ) : (
          project.reelsConfig.slides.map((slide, index) => (
            <div 
              key={slide.id}
              className={`mb-2 p-2 border rounded-md hover:bg-accent cursor-pointer ${
                currentSlideId === slide.id ? 'border-primary bg-primary/10' : 'border-border bg-card'
              }`}
              onClick={() => setCurrentSlideId(slide.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{getSlidePreview(slide)}</div>
                  <div className="text-xs text-muted-foreground">{getSlideTypeName(slide.type)}</div>
                </div>
                <div className="flex space-x-1 space-x-reverse">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={(e) => handleMoveUp(index, e)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={(e) => handleMoveDown(index, e)}
                    disabled={index === project.reelsConfig.slides.length - 1}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={(e) => handleDuplicateSlide(slide, e)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive"
                    onClick={(e) => handleRemoveSlide(slide.id, e)}
                    disabled={project.reelsConfig.slides.length <= 1}
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SlidesPanel;
