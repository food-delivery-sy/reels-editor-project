import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { ColorPicker } from './ColorPicker';
import { useEditor } from '../lib/editor-context';
import { Play, Pause, SkipBack, SkipForward, RefreshCw, Download, Settings, Maximize, Minimize } from 'lucide-react';
import { Tooltip } from './ui/tooltip';

const DynamicPreview: React.FC = () => {
  const { project, currentSlideId, updateProject } = useEditor();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // تحديث مؤشر المشهد الحالي عند تغيير currentSlideId
  useEffect(() => {
    if (currentSlideId) {
      const index = project.reelsConfig.slides.findIndex(slide => slide.id === currentSlideId);
      if (index !== -1) {
        setCurrentSlideIndex(index);
      }
    }
  }, [currentSlideId, project.reelsConfig.slides]);
  
  // إنشاء HTML للمعاينة
  const generatePreviewHTML = () => {
    // استخراج كائن reelsConfig من المشروع
    const { reelsConfig } = project;
    
    // إنشاء HTML كامل مع تضمين SlideGenerator و AnimationController
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>معاينة</title>
        <style>
          /* أنماط أساسية */
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            font-family: 'Tajawal', sans-serif;
          }
          
          /* أنماط الحاوية */
          #container {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          
          /* أنماط المشاهد */
          .slide {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            opacity: 0;
            transition: opacity 0.5s ease;
          }
          
          .slide.active {
            opacity: 1;
          }
          
          /* أنماط العناصر */
          h1, h2, h3, p {
            margin: 0;
            padding: 0;
          }
          
          h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          
          h2 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }
          
          p {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }
          
          ul {
            list-style: none;
            padding: 0;
            margin: 0;
            text-align: center;
          }
          
          li {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          li:before {
            content: "•";
            margin-left: 0.5rem;
          }
          
          button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            font-size: 1.2rem;
            border-radius: 0.25rem;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          
          button:hover {
            background-color: #2980b9;
          }
        </style>
      </head>
      <body>
        <div id="container"></div>
        
        <script>
          // كائن reelsConfig
          const reelsConfig = ${JSON.stringify(reelsConfig)};
          
          // مولد المشاهد
          class SlideGenerator {
            constructor(container, config) {
              this.container = container;
              this.config = config;
              this.slides = [];
            }
            
            // إنشاء جميع المشاهد
            generateSlides() {
              // إزالة المشاهد السابقة
              this.container.innerHTML = '';
              this.slides = [];
              
              // إنشاء المشاهد الجديدة
              this.config.slides.forEach((slide, index) => {
                const slideElement = this.createSlide(slide, index);
                this.container.appendChild(slideElement);
                this.slides.push(slideElement);
              });
              
              return this.slides;
            }
            
            // إنشاء مشهد واحد
            createSlide(slide, index) {
              const slideElement = document.createElement('div');
              slideElement.className = 'slide';
              slideElement.id = slide.id;
              
              // تعيين خلفية المشهد
              if (slide.background) {
                if (slide.background.type === 'color') {
                  slideElement.style.backgroundColor = slide.background.value;
                } else if (slide.background.type === 'image') {
                  slideElement.style.backgroundImage = \`url(\${slide.background.value})\`;
                  slideElement.style.backgroundSize = 'cover';
                  slideElement.style.backgroundPosition = 'center';
                }
              }
              
              // إنشاء محتوى المشهد حسب النوع
              let content;
              switch (slide.type) {
                case 'title':
                  content = this.createTitleSlide(slide.content);
                  break;
                case 'list':
                  content = this.createListSlide(slide.content);
                  break;
                case 'features':
                  content = this.createFeaturesSlide(slide.content);
                  break;
                case 'cta':
                  content = this.createCtaSlide(slide.content);
                  break;
                default:
                  content = document.createElement('div');
                  content.textContent = 'نوع مشهد غير معروف';
              }
              
              slideElement.appendChild(content);
              return slideElement;
            }
            
            // إنشاء مشهد عنوان
            createTitleSlide(content) {
              const container = document.createElement('div');
              
              if (content.mainTitle) {
                const mainTitle = document.createElement('h1');
                mainTitle.textContent = content.mainTitle;
                mainTitle.style.color = content.mainTitleColor || '#ffffff';
                container.appendChild(mainTitle);
              }
              
              if (content.subtitle) {
                const subtitle = document.createElement('h2');
                subtitle.textContent = content.subtitle;
                subtitle.style.color = content.subtitleColor || '#ffffff';
                container.appendChild(subtitle);
              }
              
              return container;
            }
            
            // إنشاء مشهد قائمة
            createListSlide(content) {
              const container = document.createElement('div');
              
              if (content.title) {
                const title = document.createElement('h2');
                title.textContent = content.title;
                title.style.color = content.titleColor || '#ffffff';
                container.appendChild(title);
              }
              
              if (content.items && content.items.length > 0) {
                const list = document.createElement('ul');
                list.style.marginTop = '1rem';
                
                content.items.forEach(item => {
                  const listItem = document.createElement('li');
                  listItem.textContent = item.text;
                  listItem.style.color = content.itemsColor || '#ffffff';
                  list.appendChild(listItem);
                });
                
                container.appendChild(list);
              }
              
              return container;
            }
            
            // إنشاء مشهد مزايا
            createFeaturesSlide(content) {
              const container = document.createElement('div');
              
              if (content.title) {
                const title = document.createElement('h2');
                title.textContent = content.title;
                title.style.color = content.titleColor || '#ffffff';
                container.appendChild(title);
              }
              
              if (content.features && content.features.length > 0) {
                const featuresContainer = document.createElement('div');
                featuresContainer.style.display = 'flex';
                featuresContainer.style.flexWrap = 'wrap';
                featuresContainer.style.justifyContent = 'center';
                featuresContainer.style.marginTop = '1rem';
                
                content.features.forEach(feature => {
                  const featureElement = document.createElement('div');
                  featureElement.style.margin = '0.5rem';
                  featureElement.style.padding = '1rem';
                  featureElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  featureElement.style.borderRadius = '0.5rem';
                  featureElement.style.width = '200px';
                  
                  const featureTitle = document.createElement('h3');
                  featureTitle.textContent = feature.title;
                  featureTitle.style.color = content.featuresColor || '#ffffff';
                  featureTitle.style.marginBottom = '0.5rem';
                  
                  const featureDescription = document.createElement('p');
                  featureDescription.textContent = feature.description;
                  featureDescription.style.color = content.featuresColor || '#ffffff';
                  featureDescription.style.fontSize = '1rem';
                  
                  featureElement.appendChild(featureTitle);
                  featureElement.appendChild(featureDescription);
                  featuresContainer.appendChild(featureElement);
                });
                
                container.appendChild(featuresContainer);
              }
              
              return container;
            }
            
            // إنشاء مشهد دعوة عمل
            createCtaSlide(content) {
              const container = document.createElement('div');
              
              if (content.title) {
                const title = document.createElement('h2');
                title.textContent = content.title;
                title.style.color = content.titleColor || '#ffffff';
                container.appendChild(title);
              }
              
              if (content.description) {
                const description = document.createElement('p');
                description.textContent = content.description;
                description.style.color = content.descriptionColor || '#ffffff';
                description.style.margin = '1rem 0';
                container.appendChild(description);
              }
              
              if (content.buttonText) {
                const button = document.createElement('button');
                button.textContent = content.buttonText;
                button.style.backgroundColor = content.buttonColor || '#3498db';
                button.style.marginTop = '1rem';
                container.appendChild(button);
              }
              
              return container;
            }
          }
          
          // متحكم الحركة
          class AnimationController {
            constructor(slides, config) {
              this.slides = slides;
              this.config = config;
              this.currentIndex = 0;
              this.isPlaying = false;
              this.timer = null;
              this.duration = config.settings?.slideDuration || 3000;
            }
            
            // عرض مشهد محدد
            showSlide(index) {
              // التأكد من أن الفهرس ضمن النطاق
              if (index < 0) index = 0;
              if (index >= this.slides.length) index = this.slides.length - 1;
              
              // إخفاء جميع المشاهد
              this.slides.forEach(slide => {
                slide.classList.remove('active');
              });
              
              // عرض المشهد المحدد
              this.slides[index].classList.add('active');
              this.currentIndex = index;
              
              // إرسال رسالة بتغيير المشهد
              window.parent.postMessage({
                type: 'slideChange',
                index: this.currentIndex,
                slideId: this.slides[this.currentIndex].id
              }, '*');
            }
            
            // عرض المشهد التالي
            nextSlide() {
              let nextIndex = this.currentIndex + 1;
              if (nextIndex >= this.slides.length) {
                nextIndex = 0;
              }
              this.showSlide(nextIndex);
            }
            
            // عرض المشهد السابق
            prevSlide() {
              let prevIndex = this.currentIndex - 1;
              if (prevIndex < 0) {
                prevIndex = this.slides.length - 1;
              }
              this.showSlide(prevIndex);
            }
            
            // تشغيل العرض
            play() {
              if (!this.isPlaying) {
                this.isPlaying = true;
                this.timer = setInterval(() => {
                  this.nextSlide();
                }, this.duration);
                
                // إرسال رسالة بتشغيل العرض
                window.parent.postMessage({
                  type: 'playbackChange',
                  isPlaying: true
                }, '*');
              }
            }
            
            // إيقاف العرض
            pause() {
              if (this.isPlaying) {
                this.isPlaying = false;
                clearInterval(this.timer);
                
                // إرسال رسالة بإيقاف العرض
                window.parent.postMessage({
                  type: 'playbackChange',
                  isPlaying: false
                }, '*');
              }
            }
            
            // تغيير مدة عرض المشهد
            setDuration(duration) {
              this.duration = duration;
              if (this.isPlaying) {
                this.pause();
                this.play();
              }
            }
          }
          
          // تهيئة العرض
          const container = document.getElementById('container');
          const slideGenerator = new SlideGenerator(container, reelsConfig);
          const slides = slideGenerator.generateSlides();
          const animationController = new AnimationController(slides, reelsConfig);
          
          // عرض المشهد الأول
          animationController.showSlide(0);
          
          // الاستماع للرسائل من النافذة الأم
          window.addEventListener('message', (event) => {
            const message = event.data;
            
            switch (message.type) {
              case 'play':
                animationController.play();
                break;
              case 'pause':
                animationController.pause();
                break;
              case 'next':
                animationController.nextSlide();
                break;
              case 'prev':
                animationController.prevSlide();
                break;
              case 'showSlide':
                animationController.showSlide(message.index);
                break;
              case 'setDuration':
                animationController.setDuration(message.duration);
                break;
              case 'updateConfig':
                // تحديث التكوين وإعادة إنشاء المشاهد
                slideGenerator.config = message.config;
                const newSlides = slideGenerator.generateSlides();
                animationController.slides = newSlides;
                animationController.showSlide(animationController.currentIndex);
                break;
            }
          });
          
          // إرسال رسالة جاهزية
          window.parent.postMessage({
            type: 'ready'
          }, '*');
        </script>
      </body>
      </html>
    `;
    
    return html;
  };
  
  // تحديث المعاينة
  const updatePreview = () => {
    if (iframeRef.current) {
      const html = generatePreviewHTML();
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  };
  
  // تحديث المعاينة عند تغيير المشروع
  useEffect(() => {
    updatePreview();
  }, [project]);
  
  // الاستماع للرسائل من الـ iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      
      switch (message.type) {
        case 'ready':
          // إرسال المشهد الحالي عند جاهزية الـ iframe
          if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
              type: 'showSlide',
              index: currentSlideIndex
            }, '*');
          }
          break;
        case 'slideChange':
          // تحديث المشهد الحالي عند تغييره في الـ iframe
          setCurrentSlideIndex(message.index);
          break;
        case 'playbackChange':
          // تحديث حالة التشغيل عند تغييرها في الـ iframe
          setIsPlaying(message.isPlaying);
          break;
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // تشغيل/إيقاف العرض
  const togglePlayback = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: isPlaying ? 'pause' : 'play'
      }, '*');
    }
  };
  
  // عرض المشهد التالي
  const nextSlide = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'next'
      }, '*');
    }
  };
  
  // عرض المشهد السابق
  const prevSlide = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'prev'
      }, '*');
    }
  };
  
  // تغيير مدة عرض المشهد
  const changeSlideDuration = (duration: number) => {
    // تحديث المشروع
    updateProject({
      ...project,
      reelsConfig: {
        ...project.reelsConfig,
        settings: {
          ...project.reelsConfig.settings,
          slideDuration: duration
        }
      }
    });
    
    // إرسال الإعداد الجديد إلى الـ iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'setDuration',
        duration
      }, '*');
    }
  };
  
  // تبديل وضع ملء الشاشة
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  };
  
  // الاستماع لتغييرات وضع ملء الشاشة
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  return (
    <div className="h-full flex flex-col" ref={containerRef}>
      {/* شريط الأدوات */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">المعاينة</h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Tooltip content="تغيير حجم المعاينة">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewScale(Math.max(0.5, previewScale - 0.1))}
                disabled={previewScale <= 0.5}
              >
                -
              </Button>
              <span className="text-xs w-12 text-center">{Math.round(previewScale * 100)}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewScale(Math.min(1.5, previewScale + 0.1))}
                disabled={previewScale >= 1.5}
              >
                +
              </Button>
            </div>
          </Tooltip>
          <Tooltip content={isFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'}>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </Tooltip>
        </div>
      </div>
      
      {/* منطقة المعاينة */}
      <div className="flex-1 overflow-hidden bg-muted flex items-center justify-center p-4">
        <div 
          className="relative rounded-md overflow-hidden shadow-lg transition-transform"
          style={{ 
            transform: `scale(${previewScale})`,
            width: '100%',
            maxWidth: '600px',
            height: '100%',
            maxHeight: '800px',
            aspectRatio: '9/16'
          }}
        >
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            title="معاينة"
          />
        </div>
      </div>
      
      {/* أزرار التحكم */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center justify-center space-x-2 space-x-reverse">
          <Tooltip content="المشهد السابق">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          </Tooltip>
          <Tooltip content={isPlaying ? 'إيقاف' : 'تشغيل'}>
            <Button
              variant={isPlaying ? "secondary" : "primary"}
              size="icon"
              onClick={togglePlayback}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </Tooltip>
          <Tooltip content="المشهد التالي">
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
        
        {/* معلومات المشهد الحالي */}
        <div className="mt-2 text-center">
          <div className="text-sm">
            المشهد {currentSlideIndex + 1} من {project.reelsConfig.slides.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {project.reelsConfig.slides[currentSlideIndex]?.content?.mainTitle || 
             project.reelsConfig.slides[currentSlideIndex]?.content?.title || 
             `مشهد ${currentSlideIndex + 1}`}
          </div>
        </div>
      </div>
      
      {/* إعدادات المعاينة */}
      <div className="p-3 border-t border-border">
        <Tabs defaultValue="playback">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="playback" className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              <span>التشغيل</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              <span>التصدير</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="playback" className="mt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>مدة عرض المشهد (مللي ثانية)</Label>
                  <span className="text-xs">{project.reelsConfig.settings?.slideDuration || 3000}</span>
                </div>
                <Slider
                  value={[project.reelsConfig.settings?.slideDuration || 3000]}
                  min={1000}
                  max={10000}
                  step={500}
                  onValueChange={(value) => changeSlideDuration(value[0])}
                />
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch id="autoplay" />
                <Label htmlFor="autoplay">تشغيل تلقائي عند التحميل</Label>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="export" className="mt-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>دقة الفيديو</Label>
                <select className="w-full p-2 border border-border rounded-md bg-background">
                  <option value="720">HD (720p)</option>
                  <option value="1080">Full HD (1080p)</option>
                  <option value="480">SD (480p)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>معدل الإطارات</Label>
                <select className="w-full p-2 border border-border rounded-md bg-background">
                  <option value="30">30 إطار/ثانية</option>
                  <option value="60">60 إطار/ثانية</option>
                  <option value="24">24 إطار/ثانية</option>
                </select>
              </div>
              
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                تصدير كفيديو
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DynamicPreview;
