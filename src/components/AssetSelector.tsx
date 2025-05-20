import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Image, FileImage, Music } from 'lucide-react';
import { useEditor } from '../lib/editor-context';
import { Asset } from '../lib/models';

interface AssetSelectorProps {
  type: 'image' | 'icon' | 'audio';
  value?: string;
  onChange: (value: string) => void;
  buttonLabel?: string;
}

const AssetSelector: React.FC<AssetSelectorProps> = ({
  type,
  value,
  onChange,
  buttonLabel = 'اختيار'
}) => {
  const { project } = useEditor();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  // تحديث الأصل المحدد عند تغيير القيمة
  useEffect(() => {
    if (value) {
      const asset = project.assets.find(a => a.url === value);
      if (asset) {
        setSelectedAsset(asset);
      } else {
        setSelectedAsset(null);
      }
    } else {
      setSelectedAsset(null);
    }
  }, [value, project.assets]);
  
  // تصفية الأصول حسب النوع
  const filteredAssets = project.assets.filter(asset => asset.type === type);
  
  // معالج اختيار أصل
  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    onChange(asset.url);
    setIsOpen(false);
  };
  
  // عرض معاينة الأصل المحدد
  const renderSelectedAssetPreview = () => {
    if (!selectedAsset) {
      return (
        <div className="w-full h-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
          {type === 'image' && <FileImage className="h-6 w-6" />}
          {type === 'icon' && <Image className="h-6 w-6" />}
          {type === 'audio' && <Music className="h-6 w-6" />}
        </div>
      );
    }
    
    if (type === 'image' || type === 'icon') {
      return (
        <div className="w-full h-16 bg-muted rounded-md overflow-hidden flex items-center justify-center">
          <img 
            src={selectedAsset.url} 
            alt={selectedAsset.name} 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }
    
    if (type === 'audio') {
      return (
        <div className="w-full h-16 bg-muted rounded-md flex items-center justify-between p-2">
          <div className="flex items-center">
            <Music className="h-6 w-6 mr-2 text-primary" />
            <div className="text-sm truncate">{selectedAsset.name}</div>
          </div>
          <audio src={selectedAsset.url} controls className="h-8 w-32" />
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="space-y-2">
      {renderSelectedAssetPreview()}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            {buttonLabel}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {type === 'image' && 'اختيار صورة'}
              {type === 'icon' && 'اختيار أيقونة'}
              {type === 'audio' && 'اختيار ملف صوتي'}
            </DialogTitle>
          </DialogHeader>
          
          {filteredAssets.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <p>لا توجد أصول متاحة من هذا النوع.</p>
              <p className="text-sm mt-2">يرجى تحميل أصول جديدة من مدير الأصول.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 py-4">
              {filteredAssets.map(asset => (
                <div 
                  key={asset.id}
                  className={`aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center cursor-pointer hover:bg-accent transition-colors ${
                    selectedAsset?.id === asset.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectAsset(asset)}
                >
                  {(type === 'image' || type === 'icon') && (
                    <img 
                      src={asset.url} 
                      alt={asset.name} 
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                  
                  {type === 'audio' && (
                    <div className="flex flex-col items-center justify-center p-2">
                      <Music className="h-8 w-8 text-primary mb-2" />
                      <div className="text-xs text-center truncate w-full">{asset.name}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetSelector;
