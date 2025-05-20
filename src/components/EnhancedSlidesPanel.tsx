import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from './ui/button';
import { Plus, Trash, Copy, ChevronUp, ChevronDown, Edit } from 'lucide-react';
import { useEditor } from '../lib/editor-context';
import { Slide, SlideType, createNewSlide } from '../lib/models';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Tooltip } from './ui/tooltip';

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
  
  // معالج إعادة الترتيب بالسحب والإفلات
  const handleDragEnd = (result: any) => {
    // إذا لم يتم إسقاط العنصر في منطقة قابلة للإسقاط
    if (!result.destination) return;
    
    // إذا لم يتغير الموقع
    if (result.destination.index === result.source.index) return;
    
    // نسخ مصفوفة المشاهد
    const slides = [...project.reelsConfig.slides];
    
    // إزالة العنصر من الموقع القديم
    const [removed] = slides.splice(result.source.index, 1);
    
    // إضافة العنصر إلى الموقع الجديد
    slides.splice(result.destination.index, 0, removed);
    
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
  
  // الحصول على لون خلفية المشهد للمعاينة المصغرة
  const getSlideBackgroundColor = (slide: Slide): string => {
    if (slide.background?.type === 'color') {
      return slide.background.value || '#1a1a2e';
    }
    return '#1a1a2e';
  };
  
  // إضافة اختصارات لوحة المفاتيح
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // التأكد من عدم وجود عناصر إدخال نشطة
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      // اختصارات المشاهد
      if (e.key === 'ArrowUp' && e.ctrlKey) {
        // تحريك المشهد الحالي للأعلى
        const currentIndex = project.reelsConfig.slides.findIndex(slide => slide.id === currentSlideId);
        if (currentIndex > 0) {
          handleMoveUp(currentIndex, {} as React.MouseEvent);
        }
      } else if (e.key === 'ArrowDown' && e.ctrlKey) {
        // تحريك المشهد الحالي للأسفل
        const currentIndex = project.reelsConfig.slides.findIndex(slide => slide.id === currentSlideId);
        if (currentIndex < project.reelsConfig.slides.length - 1) {
          handleMoveDown(currentIndex, {} as React.MouseEvent);
        }
      } else if (e.key === 'Delete' && e.ctrlKey) {
        // حذف المشهد الحالي
        if (currentSlideId && project.reelsConfig.slides.length > 1) {
          removeSlide(currentSlideId);
        }
      } else if (e.key === 'd' && e.ctrlKey) {
        // نسخ المشهد الحالي
        e.preventDefault();
        const currentSlide = project.reelsConfig.slides.find(slide => slide.id === currentSlideId);
        if (currentSlide) {
          handleDuplicateSlide(currentSlide, {} as React.MouseEvent);
        }
      } else if (e.key === 'n' && e.ctrlKey) {
        // إضافة مشهد جديد
        e.preventDefault();
        setIsAddDialogOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlideId, project.reelsConfig.slides]);
  
  return (
    <div className="h-full flex flex-col">
      {/* عنوان اللوحة */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">المشاهد</h2>
        <Tooltip content="إضافة مشهد جديد (Ctrl+N)">
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
        </Tooltip>
      </div>

      {/* قائمة المشاهد */}
      <div className="flex-1 overflow-y-auto p-2">
        {project.reelsConfig.slides.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            لا توجد مشاهد. أضف مشهداً جديداً للبدء.
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="slides">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {project.reelsConfig.slides.map((slide, index) => (
                    <Draggable key={slide.id} draggableId={slide.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`slide-thumbnail p-2 border rounded-md hover:bg-accent cursor-pointer transition-all ${
                            currentSlideId === slide.id ? 'border-primary bg-primary/10' : 'border-border bg-card'
                          } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                          onClick={() => setCurrentSlideId(slide.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-6 h-6 rounded-md flex-shrink-0" 
                                style={{ backgroundColor: getSlideBackgroundColor(slide) }}
                              />
                              <div>
                                <div className="font-medium">{getSlidePreview(slide)}</div>
                                <div className="text-xs text-muted-foreground">{getSlideTypeName(slide.type)}</div>
                              </div>
                            </div>
                            <div className="flex space-x-1 space-x-reverse">
                              <Tooltip content="تحريك للأعلى (Ctrl+↑)">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7"
                                  onClick={(e) => handleMoveUp(index, e)}
                                  disabled={index === 0}
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </Button>
                              </Tooltip>
                              <Tooltip content="تحريك للأسفل (Ctrl+↓)">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7"
                                  onClick={(e) => handleMoveDown(index, e)}
                                  disabled={index === project.reelsConfig.slides.length - 1}
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                              </Tooltip>
                              <Tooltip content="نسخ المشهد (Ctrl+D)">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7"
                                  onClick={(e) => handleDuplicateSlide(slide, e)}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </Tooltip>
                              <Tooltip content="حذف المشهد (Ctrl+Delete)">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-destructive"
                                  onClick={(e) => handleRemoveSlide(slide.id, e)}
                                  disabled={project.reelsConfig.slides.length <= 1}
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </Button>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
      
      {/* شريط المعلومات */}
      <div className="p-2 border-t border-border text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>إجمالي المشاهد: {project.reelsConfig.slides.length}</span>
          <span>اسحب وأفلت لإعادة الترتيب</span>
        </div>
      </div>
    </div>
  );
};

export default SlidesPanel;
