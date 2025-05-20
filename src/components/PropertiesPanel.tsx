import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useEditor } from '../lib/editor-context';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { ColorPicker } from './ColorPicker';
import { Slide, SlideType } from '../lib/models';

const PropertiesPanel: React.FC = () => {
  const { project, currentSlideId, updateSlide, updateGeneralSettings } = useEditor();
  const [currentTab, setCurrentTab] = useState<'slide' | 'general'>('slide');
  
  // التبديل التلقائي إلى علامة تبويب المشهد عند تحديد مشهد
  useEffect(() => {
    if (currentSlideId) {
      setCurrentTab('slide');
    }
  }, [currentSlideId]);
  
  // الحصول على المشهد الحالي
  const getCurrentSlide = (): Slide | undefined => {
    if (!currentSlideId) return undefined;
    return project.reelsConfig.slides.find(slide => slide.id === currentSlideId);
  };
  
  const currentSlide = getCurrentSlide();
  
  // تحديث خصائص المشهد
  const handleSlidePropertyChange = (path: string, value: any) => {
    if (!currentSlide) return;
    
    // نسخة من المشهد الحالي
    const updatedSlide = JSON.parse(JSON.stringify(currentSlide));
    
    // تحديث القيمة في المسار المحدد
    const pathParts = path.split('.');
    let current: any = updatedSlide;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
    
    // تحديث المشهد
    updateSlide(updatedSlide);
  };
  
  // تحديث الإعدادات العامة
  const handleGeneralPropertyChange = (path: string, value: any) => {
    // نسخة من الإعدادات العامة
    const updatedGeneral = JSON.parse(JSON.stringify(project.reelsConfig.general));
    
    // تحديث القيمة في المسار المحدد
    const pathParts = path.split('.');
    let current: any = updatedGeneral;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
    
    // تحديث الإعدادات العامة
    updateGeneralSettings(updatedGeneral);
  };
  
  // عرض خصائص المشهد حسب النوع
  const renderSlideProperties = () => {
    if (!currentSlide) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          يرجى تحديد مشهد لعرض خصائصه
        </div>
      );
    }
    
    switch (currentSlide.type) {
      case 'title':
        return renderTitleSlideProperties();
      case 'list':
        return renderListSlideProperties();
      case 'features':
        return renderFeaturesSlideProperties();
      case 'cta':
        return renderCtaSlideProperties();
      default:
        return (
          <div className="p-4 text-center text-muted-foreground">
            نوع مشهد غير معروف
          </div>
        );
    }
  };
  
  // عرض خصائص مشهد العنوان
  const renderTitleSlideProperties = () => {
    if (!currentSlide) return null;
    
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="mainTitle">العنوان الرئيسي</Label>
          <Input 
            id="mainTitle" 
            value={currentSlide.content.mainTitle || ''} 
            onChange={(e) => handleSlidePropertyChange('content.mainTitle', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subTitle">العنوان الفرعي</Label>
          <Input 
            id="subTitle" 
            value={currentSlide.content.subTitle || ''} 
            onChange={(e) => handleSlidePropertyChange('content.subTitle', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="motivationalText">العبارة التحفيزية</Label>
          <Input 
            id="motivationalText" 
            value={currentSlide.content.motivationalText || ''} 
            onChange={(e) => handleSlidePropertyChange('content.motivationalText', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>خلفية المشهد</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select 
              value={currentSlide.background?.type || 'color'} 
              onValueChange={(value) => handleSlidePropertyChange('background.type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="نوع الخلفية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="color">لون</SelectItem>
                <SelectItem value="gradient">تدرج</SelectItem>
                <SelectItem value="image">صورة</SelectItem>
              </SelectContent>
            </Select>
            
            {currentSlide.background?.type === 'color' && (
              <ColorPicker 
                color={currentSlide.background.value || '#1a1a2e'} 
                onChange={(color) => handleSlidePropertyChange('background.value', color)}
              />
            )}
            
            {currentSlide.background?.type === 'gradient' && (
              <Input 
                value={currentSlide.background.value || 'linear-gradient(45deg, #1a1a2e, #0f3460)'} 
                onChange={(e) => handleSlidePropertyChange('background.value', e.target.value)}
              />
            )}
            
            {currentSlide.background?.type === 'image' && (
              <Input 
                value={currentSlide.background.value || ''} 
                onChange={(e) => handleSlidePropertyChange('background.value', e.target.value)}
                placeholder="رابط الصورة"
              />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>توقيت المشهد (بالثواني)</Label>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Slider 
              value={[currentSlide.timing?.duration ? currentSlide.timing.duration / 1000 : 5]} 
              min={1} 
              max={10} 
              step={0.5} 
              onValueChange={(value) => handleSlidePropertyChange('timing.duration', value[0] * 1000)}
              className="flex-1"
            />
            <span className="w-8 text-center">
              {currentSlide.timing?.duration ? (currentSlide.timing.duration / 1000).toFixed(1) : '5.0'}
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  // عرض خصائص مشهد القائمة
  const renderListSlideProperties = () => {
    if (!currentSlide) return null;
    
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="listTitle">عنوان القائمة</Label>
          <Input 
            id="listTitle" 
            value={currentSlide.content.title || ''} 
            onChange={(e) => handleSlidePropertyChange('content.title', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="motivationalText">العبارة التحفيزية</Label>
          <Input 
            id="motivationalText" 
            value={currentSlide.content.motivationalText || ''} 
            onChange={(e) => handleSlidePropertyChange('content.motivationalText', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>عناصر القائمة</Label>
          {currentSlide.content.items?.map((item, index) => (
            <div key={index} className="space-y-2 border p-2 rounded-md">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Input 
                  value={item.text || ''} 
                  onChange={(e) => {
                    const updatedItems = [...(currentSlide.content.items || [])];
                    updatedItems[index] = { ...updatedItems[index], text: e.target.value };
                    handleSlidePropertyChange('content.items', updatedItems);
                  }}
                  placeholder="نص العنصر"
                />
                <Select 
                  value={item.icon || 'humanities'} 
                  onValueChange={(value) => {
                    const updatedItems = [...(currentSlide.content.items || [])];
                    updatedItems[index] = { ...updatedItems[index], icon: value };
                    handleSlidePropertyChange('content.items', updatedItems);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="الأيقونة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="humanities">إنسانيات</SelectItem>
                    <SelectItem value="ai">ذكاء اصطناعي</SelectItem>
                    <SelectItem value="sustainability">استدامة</SelectItem>
                    <SelectItem value="islamic">إسلامي</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    const updatedItems = [...(currentSlide.content.items || [])];
                    updatedItems.splice(index, 1);
                    handleSlidePropertyChange('content.items', updatedItems);
                  }}
                >
                  حذف
                </Button>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            onClick={() => {
              const updatedItems = [...(currentSlide.content.items || [])];
              updatedItems.push({ text: 'عنصر جديد', icon: 'humanities' });
              handleSlidePropertyChange('content.items', updatedItems);
            }}
          >
            إضافة عنصر
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label>خلفية المشهد</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select 
              value={currentSlide.background?.type || 'color'} 
              onValueChange={(value) => handleSlidePropertyChange('background.type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="نوع الخلفية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="color">لون</SelectItem>
                <SelectItem value="gradient">تدرج</SelectItem>
                <SelectItem value="image">صورة</SelectItem>
              </SelectContent>
            </Select>
            
            {currentSlide.background?.type === 'color' && (
              <ColorPicker 
                color={currentSlide.background.value || '#1a1a2e'} 
                onChange={(color) => handleSlidePropertyChange('background.value', color)}
              />
            )}
            
            {currentSlide.background?.type === 'gradient' && (
              <Input 
                value={currentSlide.background.value || 'linear-gradient(45deg, #1a1a2e, #0f3460)'} 
                onChange={(e) => handleSlidePropertyChange('background.value', e.target.value)}
              />
            )}
            
            {currentSlide.background?.type === 'image' && (
              <Input 
                value={currentSlide.background.value || ''} 
                onChange={(e) => handleSlidePropertyChange('background.value', e.target.value)}
                placeholder="رابط الصورة"
              />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>توقيت المشهد (بالثواني)</Label>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Slider 
              value={[currentSlide.timing?.duration ? currentSlide.timing.duration / 1000 : 5]} 
              min={1} 
              max={10} 
              step={0.5} 
              onValueChange={(value) => handleSlidePropertyChange('timing.duration', value[0] * 1000)}
              className="flex-1"
            />
            <span className="w-8 text-center">
              {currentSlide.timing?.duration ? (currentSlide.timing.duration / 1000).toFixed(1) : '5.0'}
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  // عرض خصائص مشهد المزايا
  const renderFeaturesSlideProperties = () => {
    if (!currentSlide) return null;
    
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="featuresTitle">عنوان المزايا</Label>
          <Input 
            id="featuresTitle" 
            value={currentSlide.content.title || ''} 
            onChange={(e) => handleSlidePropertyChange('content.title', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>المزايا</Label>
          {currentSlide.content.features?.map((feature, index) => (
            <div key={index} className="space-y-2 border p-2 rounded-md">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Input 
                  value={feature.text || ''} 
                  onChange={(e) => {
                    const updatedFeatures = [...(currentSlide.content.features || [])];
                    updatedFeatures[index] = { ...updatedFeatures[index], text: e.target.value };
                    handleSlidePropertyChange('content.features', updatedFeatures);
                  }}
                  placeholder="نص الميزة"
                />
                <Select 
                  value={feature.icon || 'workshop'} 
                  onValueChange={(value) => {
                    const updatedFeatures = [...(currentSlide.content.features || [])];
                    updatedFeatures[index] = { ...updatedFeatures[index], icon: value };
                    handleSlidePropertyChange('content.features', updatedFeatures);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="الأيقونة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">ورشة عمل</SelectItem>
                    <SelectItem value="publication">نشر</SelectItem>
                    <SelectItem value="certificate">شهادة</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    const updatedFeatures = [...(currentSlide.content.features || [])];
                    updatedFeatures.splice(index, 1);
                    handleSlidePropertyChange('content.features', updatedFeatures);
                  }}
                >
                  حذف
                </Button>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            onClick={() => {
              const updatedFeatures = [...(currentSlide.content.features || [])];
              updatedFeatures.push({ text: 'ميزة جديدة', icon: 'workshop' });
              handleSlidePropertyChange('content.features', updatedFeatures);
            }}
          >
            إضافة ميزة
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label>طرق المشاركة</Label>
          {currentSlide.content.participationModes?.map((mode, index) => (
            <div key={index} className="space-y-2 border p-2 rounded-md">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Input 
                  value={mode.text || ''} 
                  onChange={(e) => {
                    const updatedModes = [...(currentSlide.content.participationModes || [])];
                    updatedModes[index] = { ...updatedModes[index], text: e.target.value };
                    handleSlidePropertyChange('content.participationModes', updatedModes);
                  }}
                  placeholder="نص طريقة المشاركة"
                />
                <Select 
                  value={mode.icon || 'physical'} 
                  onValueChange={(value) => {
                    const updatedModes = [...(currentSlide.content.participationModes || [])];
                    updatedModes[index] = { ...updatedModes[index], icon: value };
                    handleSlidePropertyChange('content.participationModes', updatedModes);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="الأيقونة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">حضوري</SelectItem>
                    <SelectItem value="online">عن بعد</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    const updatedModes = [...(currentSlide.content.participationModes || [])];
                    updatedModes.splice(index, 1);
                    handleSlidePropertyChange('content.participationModes', updatedModes);
                  }}
                >
                  حذف
                </Button>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            onClick={() => {
              const updatedModes = [...(currentSlide.content.participationModes || [])];
              updatedModes.push({ text: 'طريقة مشاركة جديدة', icon: 'physical' });
              handleSlidePropertyChange('content.participationModes', updatedModes);
            }}
          >
            إضافة طريقة مشاركة
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label>خلفية المشهد</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select 
              value={currentSlide.background?.type || 'color'} 
              onValueChange={(value) => handleSlidePropertyChange('background.type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="نوع الخلفية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="color">لون</SelectItem>
                <SelectItem value="gradient">تدرج</SelectItem>
                <SelectItem value="image">صورة</SelectItem>
              </SelectContent>
            </Select>
            
            {currentSlide.background?.type === 'color' && (
              <ColorPicker 
                color={currentSlide.background.value || '#1a1a2e'} 
                onChange={(color) => handleSlidePropertyChange('background.value', color)}
              />
            )}
            
            {currentSlide.background?.type === 'gradient' && (
              <Input 
                value={currentSlide.background.value || 'linear-gradient(45deg, #1a1a2e, #0f3460)'} 
                onChange={(e) => handleSlidePropertyChange('background.value', e.target.value)}
              />
            )}
            
            {currentSlide.background?.type === 'image' && (
              <Input 
                value={currentSlide.background.value || ''} 
                onChange={(e) => handleSlidePropertyChange('background.value', e.target.value)}
                placeholder="رابط الصورة"
              />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>توقيت المشهد (بالثواني)</Label>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Slider 
              value={[currentSlide.timing?.duration ? currentSlide.timing.duration / 1000 : 5]} 
              min={1} 
              max={10} 
              step={0.5} 
              onValueChange={(value) => handleSlidePropertyChange('timing.duration', value[0] * 1000)}
              className="flex-1"
            />
            <span className="w-8 text-center">
              {currentSlide.timing?.duration ? (currentSlide.timing.duration / 1000).toFixed(1) : '5.0'}
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  // عرض خصائص مشهد دعوة العمل
  const renderCtaSlideProperties = () => {
    if (!currentSlide) return null;
    
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="ctaTitle">عنوان دعوة العمل</Label>
          <Input 
            id="ctaTitle" 
            value={currentSlide.content.title || ''} 
            onChange={(e) => handleSlidePropertyChange('content.title', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ctaSubtitle">العنوان الفرعي</Label>
          <Input 
            id="ctaSubtitle" 
            value={currentSlide.content.subtitle || ''} 
            onChange={(e) => handleSlidePropertyChange('content.subtitle', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ctaText">نص الزر</Label>
          <Input 
            id="ctaText" 
            value={currentSlide.content.ctaText || ''} 
            onChange={(e) => handleSlidePropertyChange('content.ctaText', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ctaLink">رابط الزر</Label>
          <Input 
            id="ctaLink" 
            value={currentSlide.content.ctaLink || ''} 
            onChange={(e) => handleSlidePropertyChange('content.ctaLink', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="qrCode">عرض رمز QR</Label>
          <div className="flex items-center space-x-2 space-x-reverse">
            <input 
              type="checkbox" 
              id="qrCode" 
              checked={currentSlide.content.qrCode || false} 
              onChange={(e) => handleSlidePropertyChange('content.qrCode', e.target.checked)}
            />
            <Label htmlFor="qrCode">عرض رمز QR للرابط</Label>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>خلفية المشهد</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select 
              value={currentSlide.background?.type || 'color'} 
              onValueChange={(value) => handleSlidePropertyChange('background.type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="نوع الخلفية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="color">لون</SelectItem>
                <SelectItem value="gradient">تدرج</SelectItem>
                <SelectItem value="image">صورة</SelectItem>
              </SelectContent>
            </Select>
            
            {currentSlide.background?.type === 'color' && (
              <ColorPicker 
                color={currentSlide.background.value || '#1a1a2e'} 
                onChange={(color) => handleSlidePropertyChange('background.value', color)}
              />
            )}
            
            {currentSlide.background?.type === 'gradient' && (
              <Input 
                value={currentSlide.background.value || 'linear-gradient(45deg, #1a1a2e, #0f3460)'} 
                onChange={(e) => handleSlidePropertyChange('background.value', e.target.value)}
              />
            )}
            
            {currentSlide.background?.type === 'image' && (
              <Input 
                value={currentSlide.background.value || ''} 
                onChange={(e) => handleSlidePropertyChange('background.value', e.target.value)}
                placeholder="رابط الصورة"
              />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>توقيت المشهد (بالثواني)</Label>
          <div className="flex items-center space-x-2 space-x-reverse">
            <Slider 
              value={[currentSlide.timing?.duration ? currentSlide.timing.duration / 1000 : 5]} 
              min={1} 
              max={10} 
              step={0.5} 
              onValueChange={(value) => handleSlidePropertyChange('timing.duration', value[0] * 1000)}
              className="flex-1"
            />
            <span className="w-8 text-center">
              {currentSlide.timing?.duration ? (currentSlide.timing.duration / 1000).toFixed(1) : '5.0'}
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  // عرض الإعدادات العامة
  const renderGeneralProperties = () => {
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="title">عنوان المشروع</Label>
          <Input 
            id="title" 
            value={project.reelsConfig.general.title || ''} 
            onChange={(e) => handleGeneralPropertyChange('title', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="direction">اتجاه النص</Label>
          <Select 
            value={project.reelsConfig.general.direction || 'rtl'} 
            onValueChange={(value) => handleGeneralPropertyChange('direction', value)}
          >
            <SelectTrigger id="direction">
              <SelectValue placeholder="اتجاه النص" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rtl">من اليمين إلى اليسار (RTL)</SelectItem>
              <SelectItem value="ltr">من اليسار إلى اليمين (LTR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>الخطوط</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="headingFont" className="text-xs">خط العناوين</Label>
              <Select 
                value={project.reelsConfig.general.fonts?.headingFont || 'Cairo'} 
                onValueChange={(value) => handleGeneralPropertyChange('fonts.headingFont', value)}
              >
                <SelectTrigger id="headingFont">
                  <SelectValue placeholder="خط العناوين" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cairo">Cairo</SelectItem>
                  <SelectItem value="Tajawal">Tajawal</SelectItem>
                  <SelectItem value="Almarai">Almarai</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bodyFont" className="text-xs">خط النصوص</Label>
              <Select 
                value={project.reelsConfig.general.fonts?.bodyFont || 'Tajawal'} 
                onValueChange={(value) => handleGeneralPropertyChange('fonts.bodyFont', value)}
              >
                <SelectTrigger id="bodyFont">
                  <SelectValue placeholder="خط النصوص" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tajawal">Tajawal</SelectItem>
                  <SelectItem value="Cairo">Cairo</SelectItem>
                  <SelectItem value="Almarai">Almarai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>ألوان السمة</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="primaryColor" className="text-xs">اللون الرئيسي</Label>
              <ColorPicker 
                color={project.reelsConfig.general.theme?.primaryColor || '#3498db'} 
                onChange={(color) => handleGeneralPropertyChange('theme.primaryColor', color)}
              />
            </div>
            <div>
              <Label htmlFor="secondaryColor" className="text-xs">اللون الثانوي</Label>
              <ColorPicker 
                color={project.reelsConfig.general.theme?.secondaryColor || '#e74c3c'} 
                onChange={(color) => handleGeneralPropertyChange('theme.secondaryColor', color)}
              />
            </div>
            <div>
              <Label htmlFor="backgroundColor" className="text-xs">لون الخلفية</Label>
              <ColorPicker 
                color={project.reelsConfig.general.theme?.backgroundColor || '#1a1a2e'} 
                onChange={(color) => handleGeneralPropertyChange('theme.backgroundColor', color)}
              />
            </div>
            <div>
              <Label htmlFor="textColor" className="text-xs">لون النص</Label>
              <ColorPicker 
                color={project.reelsConfig.general.theme?.textColor || '#ffffff'} 
                onChange={(color) => handleGeneralPropertyChange('theme.textColor', color)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <h2 className="font-semibold">الخصائص</h2>
      </div>
      
      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'slide' | 'general')} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mx-4 my-2">
          <TabsTrigger value="slide" disabled={!currentSlideId}>المشهد</TabsTrigger>
          <TabsTrigger value="general">عام</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="slide" className="m-0">
            {renderSlideProperties()}
          </TabsContent>
          
          <TabsContent value="general" className="m-0">
            {renderGeneralProperties()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default PropertiesPanel;
