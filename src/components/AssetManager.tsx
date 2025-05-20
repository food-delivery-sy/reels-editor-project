import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useEditor } from '../lib/editor-context';
import { Upload, Image, Music, FileAudio, X, Plus } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'icon' | 'audio';
  url: string;
  thumbnail?: string;
  size?: number;
}

const AssetManager: React.FC = () => {
  const { project, addAsset, removeAsset } = useEditor();
  const [activeTab, setActiveTab] = useState<string>('images');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // تحميل ملف جديد
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileType = file.type;
    
    // تحديد نوع الملف
    let assetType: 'image' | 'icon' | 'audio';
    if (fileType.startsWith('image/')) {
      assetType = activeTab === 'icons' ? 'icon' : 'image';
    } else if (fileType.startsWith('audio/')) {
      assetType = 'audio';
    } else {
      alert('نوع الملف غير مدعوم');
      return;
    }
    
    // إنشاء URL للملف
    const fileUrl = URL.createObjectURL(file);
    
    // إنشاء معرف فريد للأصل
    const assetId = `asset_${Date.now()}`;
    
    // إضافة الأصل إلى المشروع
    addAsset({
      id: assetId,
      name: file.name,
      type: assetType,
      url: fileUrl,
      thumbnail: assetType === 'audio' ? undefined : fileUrl,
      size: file.size
    });
    
    // إعادة تعيين حقل الملف
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // حذف أصل
  const handleRemoveAsset = (assetId: string) => {
    removeAsset(assetId);
  };
  
  // تصفية الأصول حسب النوع
  const filterAssetsByType = (type: 'image' | 'icon' | 'audio') => {
    return project.assets.filter(asset => asset.type === type);
  };
  
  // عرض الصور
  const renderImages = () => {
    const images = filterAssetsByType('image');
    
    return (
      <div className="grid grid-cols-3 gap-3 p-4">
        {images.map(image => (
          <div key={image.id} className="relative group">
            <div className="aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center">
              <img 
                src={image.url} 
                alt={image.name} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="mt-1 text-xs truncate">{image.name}</div>
            <button 
              className="absolute top-1 right-1 bg-background/80 text-destructive rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveAsset(image.id)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        
        {/* زر إضافة صورة */}
        <div 
          className="aspect-square bg-muted/50 rounded-md border border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Plus className="h-6 w-6 text-muted-foreground mb-1" />
          <span className="text-xs text-muted-foreground">إضافة صورة</span>
        </div>
      </div>
    );
  };
  
  // عرض الأيقونات
  const renderIcons = () => {
    const icons = filterAssetsByType('icon');
    
    return (
      <div className="grid grid-cols-4 gap-3 p-4">
        {icons.map(icon => (
          <div key={icon.id} className="relative group">
            <div className="aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center p-2">
              <img 
                src={icon.url} 
                alt={icon.name} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="mt-1 text-xs truncate">{icon.name}</div>
            <button 
              className="absolute top-1 right-1 bg-background/80 text-destructive rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveAsset(icon.id)}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        
        {/* زر إضافة أيقونة */}
        <div 
          className="aspect-square bg-muted/50 rounded-md border border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
          onClick={() => {
            setActiveTab('icons');
            fileInputRef.current?.click();
          }}
        >
          <Plus className="h-6 w-6 text-muted-foreground mb-1" />
          <span className="text-xs text-muted-foreground">إضافة أيقونة</span>
        </div>
      </div>
    );
  };
  
  // عرض الملفات الصوتية
  const renderAudio = () => {
    const audioFiles = filterAssetsByType('audio');
    
    return (
      <div className="space-y-3 p-4">
        {audioFiles.map(audio => (
          <div key={audio.id} className="relative group bg-muted rounded-md p-3 flex items-center">
            <div className="h-10 w-10 bg-primary/20 rounded-md flex items-center justify-center mr-3">
              <FileAudio className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{audio.name}</div>
              <div className="text-xs text-muted-foreground">
                {audio.size ? `${Math.round(audio.size / 1024)} KB` : ''}
              </div>
            </div>
            <audio src={audio.url} controls className="h-8 mx-2" />
            <button 
              className="text-destructive p-1"
              onClick={() => handleRemoveAsset(audio.id)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {/* زر إضافة ملف صوتي */}
        <div 
          className="bg-muted/50 rounded-md border border-dashed border-border p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
          onClick={() => {
            setActiveTab('audio');
            fileInputRef.current?.click();
          }}
        >
          <Music className="h-8 w-8 text-muted-foreground mb-2" />
          <div className="text-sm text-muted-foreground">انقر لإضافة ملف صوتي</div>
          <div className="text-xs text-muted-foreground mt-1">MP3, WAV, OGG</div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">مدير الأصول</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          <span>تحميل</span>
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileUpload}
          accept={activeTab === 'images' ? 'image/*' : activeTab === 'icons' ? 'image/svg+xml,image/png' : 'audio/*'}
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mx-4 my-2">
          <TabsTrigger value="images" className="flex items-center gap-1">
            <Image className="h-4 w-4" />
            <span>الصور</span>
          </TabsTrigger>
          <TabsTrigger value="icons" className="flex items-center gap-1">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>الأيقونات</span>
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-1">
            <Music className="h-4 w-4" />
            <span>الصوت</span>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="images" className="m-0 h-full">
            {renderImages()}
          </TabsContent>
          
          <TabsContent value="icons" className="m-0 h-full">
            {renderIcons()}
          </TabsContent>
          
          <TabsContent value="audio" className="m-0 h-full">
            {renderAudio()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AssetManager;
