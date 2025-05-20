import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Play, Pause, SkipBack, SkipForward, RefreshCw } from 'lucide-react';
import { useEditor } from '../lib/editor-context';
import { ReelsConfig } from '../lib/models';

interface DynamicPreviewProps {
  width?: number;
  height?: number;
}

const DynamicPreview: React.FC<DynamicPreviewProps> = ({ 
  width = 270, 
  height = 480 
}) => {
  const { project, currentSlideId } = useEditor();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // تحديث المعاينة عند تغيير البيانات
  useEffect(() => {
    updatePreview();
  }, [project, currentSlideId]);
  
  // تحديث المعاينة
  const updatePreview = () => {
    if (!iframeRef.current) return;
    
    setIsLoading(true);
    
    // توليد HTML للمعاينة
    const previewHtml = generatePreviewHtml(project.reelsConfig);
    
    // تحديث محتوى الـ iframe
    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(previewHtml);
      iframeDoc.close();
      
      // إعداد التواصل مع iframe
      setupIframeCommunication();
      
      // تحديد المشهد الحالي إذا كان محدداً
      if (currentSlideId) {
        const slideIndex = project.reelsConfig.slides.findIndex(slide => slide.id === currentSlideId);
        if (slideIndex !== -1) {
          setTimeout(() => {
            sendMessageToIframe({ action: 'goToSlide', slideIndex });
          }, 500); // انتظار تحميل الـ iframe
        }
      }
    }
  };
  
  // توليد HTML للمعاينة
  const generatePreviewHtml = (reelsConfig: ReelsConfig): string => {
    // نسخة من reelsConfig لتجنب تعديل الأصل
    const configCopy = JSON.stringify(reelsConfig);
    
    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reelsConfig.general.title}</title>
    
    <!-- خطوط جوجل العربية -->
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
    
    <!-- مكتبة GSAP للحركات المتقدمة -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/ScrollToPlugin.min.js"></script>
    
    <style>
    /* ===== بداية قسم CSS ===== */
    /* إعدادات عامة */
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    :root {
        /* متغيرات CSS للألوان والخطوط - سيتم تعديلها ديناميكياً */
        --primary-color: ${reelsConfig.general.theme.primaryColor};
        --secondary-color: ${reelsConfig.general.theme.secondaryColor};
        --background-color: ${reelsConfig.general.theme.backgroundColor};
        --text-color: ${reelsConfig.general.theme.textColor};
        --heading-font: ${reelsConfig.general.fonts.headingFont};
        --body-font: ${reelsConfig.general.fonts.bodyFont};
    }

    html, body {
        height: 100%;
        width: 100%;
        overflow: hidden;
        direction: ${reelsConfig.general.direction};
    }

    body {
        font-family: var(--body-font);
        color: var(--text-color);
        background-color: var(--background-color);
    }

    #app {
        position: relative;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }

    /* حاوية المشاهد */
    .reels-container {
        position: relative;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }

    /* المشهد */
    .reel-slide {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 20px;
        text-align: center;
        background-color: var(--background-color);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.5s ease;
    }

    .reel-slide.active {
        opacity: 1;
        pointer-events: auto;
    }

    /* حاوية المحتوى */
    .content {
        max-width: 90%;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 20px;
    }

    /* العناوين */
    h1, h2, h3 {
        font-family: var(--heading-font);
        margin-bottom: 10px;
    }

    .main-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 10px;
    }

    .sub-title {
        font-size: 1.8rem;
        font-weight: 500;
        margin-bottom: 20px;
    }

    .title {
        font-size: 2rem;
        font-weight: 600;
        margin-bottom: 20px;
    }

    /* العبارة التحفيزية */
    .motivational {
        font-size: 1.5rem;
        color: var(--secondary-color);
        margin-bottom: 20px;
        font-weight: 500;
    }

    .motivational-end {
        font-size: 1.5rem;
        color: var(--secondary-color);
        margin-top: 20px;
        font-weight: 500;
    }

    /* حاوية الشعارات */
    .logos-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin-top: 30px;
        flex-wrap: wrap;
    }

    .logo {
        height: 60px;
        max-width: 120px;
        object-fit: contain;
    }

    .footer-logos .logo {
        height: 40px;
    }

    /* قائمة التخصصات */
    .specialties {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 15px;
        width: 100%;
        max-width: 400px;
    }

    .specialty {
        display: flex;
        align-items: center;
        gap: 15px;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 10px 15px;
        border-radius: 10px;
        opacity: 0;
        transform: translateX(30px);
    }

    .specialty-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 8px;
    }

    .specialty-icon svg {
        width: 100%;
        height: 100%;
    }

    /* قائمة المزايا */
    .features {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 15px;
        width: 100%;
        max-width: 400px;
    }

    .feature {
        display: flex;
        align-items: center;
        gap: 15px;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 10px 15px;
        border-radius: 10px;
        opacity: 0;
        transform: translateX(30px);
    }

    .feature-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 8px;
    }

    .feature-icon svg {
        width: 100%;
        height: 100%;
    }

    /* طرق المشاركة */
    .participation-modes {
        display: flex;
        justify-content: center;
        gap: 30px;
        margin-top: 20px;
        width: 100%;
    }

    .mode {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .mode-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
    }

    .mode-icon svg {
        width: 100%;
        height: 100%;
    }

    /* دعوة العمل */
    .cta-title {
        font-size: 2.5rem;
        color: var(--secondary-color);
    }

    .subtitle {
        font-size: 1.2rem;
        margin-bottom: 30px;
    }

    .cta-container {
        margin: 20px 0;
    }

    .cta-button {
        display: inline-block;
        padding: 12px 30px;
        background-color: var(--secondary-color);
        color: #fff;
        text-decoration: none;
        border-radius: 30px;
        font-size: 1.2rem;
        font-weight: 600;
        transition: all 0.3s ease;
    }

    .cta-button:hover {
        transform: scale(1.05);
        box-shadow: 0 0 15px rgba(255, 140, 0, 0.5);
    }

    .qr-container {
        margin: 20px 0;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 15px;
        border-radius: 10px;
    }

    .qr-code {
        width: 150px;
        height: 150px;
        background-color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #000;
    }

    /* رسالة الخطأ */
    .error-message {
        padding: 20px;
        background-color: rgba(255, 0, 0, 0.2);
        border-radius: 10px;
        text-align: center;
    }

    /* تأثيرات الحركة */
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }

    @keyframes slideInRight {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOutLeft {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-100px); opacity: 0; }
    }

    @keyframes zoomIn {
        from { transform: scale(0.5); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }

    @keyframes zoomOut {
        from { transform: scale(1); opacity: 1; }
        to { transform: scale(1.5); opacity: 0; }
    }

    /* تطبيق التأثيرات */
    .fadeIn {
        animation: fadeIn 0.8s forwards;
    }

    .fadeOut {
        animation: fadeOut 0.8s forwards;
    }

    .slideInRight {
        animation: slideInRight 0.8s forwards;
    }

    .slideOutLeft {
        animation: slideOutLeft 0.8s forwards;
    }

    .zoomIn {
        animation: zoomIn 0.8s forwards;
    }

    .zoomOut {
        animation: zoomOut 0.8s forwards;
    }

    /* شريط التقدم */
    .progress-bar {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        width: 80%;
        height: 4px;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        overflow: hidden;
    }

    .progress-indicator {
        height: 100%;
        background-color: var(--secondary-color);
        width: 0%;
        transition: width 0.3s linear;
    }

    /* تحسينات للأجهزة المحمولة */
    @media (max-width: 768px) {
        .main-title {
            font-size: 2rem;
        }
        
        .sub-title {
            font-size: 1.5rem;
        }
        
        .title {
            font-size: 1.8rem;
        }
        
        .motivational {
            font-size: 1.3rem;
        }
        
        .logo {
            height: 50px;
        }
        
        .specialty, .feature {
            padding: 8px 12px;
        }
        
        .specialty-icon, .feature-icon, .mode-icon {
            width: 35px;
            height: 35px;
        }
        
        .cta-button {
            padding: 10px 25px;
            font-size: 1.1rem;
        }
        
        .qr-code {
            width: 120px;
            height: 120px;
        }
    }
    /* ===== نهاية قسم CSS ===== */
    </style>
</head>
<body>
    <!-- ===== بداية قسم التكوين ===== -->
    <script>
    // قم بتعديل هذا المتغير لتخصيص العرض التقديمي
    const reelsConfig = ${configCopy};
    
    // مكتبة الأيقونات المضمنة (SVG)
    const svgIcons = {
        // أيقونات التخصصات
        humanities: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm8-1.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5zM9.11 16.5c.39-.44.89-.8 1.45-1.07.56-.27 1.17-.43 1.8-.43.63 0 1.24.16 1.8.43.56.27 1.05.63 1.45 1.07.2.23.6.23.8 0 .21-.23.21-.6 0-.83-.48-.55-1.1-1-1.8-1.33-.71-.33-1.48-.5-2.25-.5-.77 0-1.54.17-2.25.5-.7.33-1.32.78-1.8 1.33-.21.23-.21.6 0 .83.2.23.6.23.8 0z"/>
        </svg>\`,
        ai: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
            <path d="M21 10.5h-1v-1c0-0.83-0.67-1.5-1.5-1.5h-1v-1c0-0.83-0.67-1.5-1.5-1.5h-6c-0.83 0-1.5 0.67-1.5 1.5v1h-1c-0.83 0-1.5 0.67-1.5 1.5v1h-1c-0.83 0-1.5 0.67-1.5 1.5v5c0 0.83 0.67 1.5 1.5 1.5h1v1c0 0.83 0.67 1.5 1.5 1.5h1v1c0 0.83 0.67 1.5 1.5 1.5h6c0.83 0 1.5-0.67 1.5-1.5v-1h1c0.83 0 1.5-0.67 1.5-1.5v-1h1c0.83 0 1.5-0.67 1.5-1.5v-5c0-0.83-0.67-1.5-1.5-1.5zM16 18H8v-1h8v1zm0-3H8v-1h8v1zm0-3H8v-1h8v1zm0-3H8V8h8v1z"/>
        </svg>\`,
        sustainability: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
            <path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25zM12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5zM3 13c0 4.97 4.03 9 9 9 0-4.97-4.03-9-9-9z"/>
        </svg>\`,
        islamic: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>\`,
        
        // أيقونات المزايا
        workshop: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm1-11h-2v3H8v2h3v3h2v-3h3v-2h-3V8z"/>
        </svg>\`,
        publication: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>\`,
        certificate: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>\`,
        
        // أيقونات طرق المشاركة
        physical: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>\`,
        online: \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>\`
    };
    
    // مكتبة الشعارات المضمنة (Base64)
    const logoImages = {
        // يمكنك استبدال هذه الصور بصور حقيقية محولة إلى Base64
        areed: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgODAiIGZpbGw9IndoaXRlIj48dGV4dCB4PSIxMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMCIgZm9udC13ZWlnaHQ9ImJvbGQiPtmF2YbYtdipINij2LHZitisPC90ZXh0Pjwvc3ZnPg==",
        almahfal: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgODAiIGZpbGw9IndoaXRlIj48dGV4dCB4PSIxMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMCIgZm9udC13ZWlnaHQ9ImJvbGQiPtin2YTZhdis2YHZhCDYp9mE2LnZhNmF2Yo8L3RleHQ+PC9zdmc+",
        fatih: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgODAiIGZpbGw9IndoaXRlIj48dGV4dCB4PSIxMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMCIgZm9udC13ZWlnaHQ9ImJvbGQiPtis2KfZhdi52Kkg2YXYrdmF2K8g2KfZhNmB2KfYqtitPC90ZXh0Pjwvc3ZnPg=="
    };
    </script>
    
    <!-- حاوية التطبيق الرئيسية -->
    <div id="app">
        <!-- سيتم توليد المحتوى ديناميكياً هنا -->
    </div>

    <!-- ===== بداية قسم JavaScript ===== -->
    <script>
    // ===== بداية قسم وحدة التحكم بالحركة =====
    class AnimationController {
        constructor() {
            this.currentSlideIndex = 0;
            this.slides = [];
            this.autoPlayInterval = null;
            this.isPlaying = false;
            this.slideDurations = [];
            this.progressIndicator = null;
            this.progressTimer = null;
        }

        /**
         * تهيئة وحدة التحكم بالحركة
         */
        initialize() {
            // تهيئة المشاهد
            this.setupSlides();
            
            // إضافة شريط التقدم
            this.addProgressBar();
            
            // إضافة مستمعي الأحداث للرسائل من الواجهة الرئيسية
            this.setupMessageListener();
            
            // عرض المشهد الأول
            this.showSlide(0);
            
            // إرسال رسالة جاهزية
            this.sendReadyMessage();
        }

        /**
         * إعداد المشاهد
         */
        setupSlides() {
            // إنشاء حاوية المشاهد
            const appContainer = document.getElementById('app');
            const reelsContainer = document.createElement('div');
            reelsContainer.className = 'reels-container';
            appContainer.appendChild(reelsContainer);
            
            // توليد المشاهد
            if (reelsConfig && reelsConfig.slides && Array.isArray(reelsConfig.slides)) {
                reelsConfig.slides.forEach((slideConfig, index) => {
                    // إنشاء عنصر المشهد
                    const slide = document.createElement('section');
                    slide.className = 'reel-slide';
                    slide.id = slideConfig.id;
                    
                    // تطبيق الخلفية
                    if (slideConfig.background) {
                        if (slideConfig.background.type === 'color') {
                            slide.style.backgroundColor = slideConfig.background.value;
                        } else if (slideConfig.background.type === 'gradient') {
                            slide.style.background = slideConfig.background.value;
                        } else if (slideConfig.background.type === 'image') {
                            slide.style.backgroundImage = \`url(\${slideConfig.background.value})\`;
                            slide.style.backgroundSize = 'cover';
                            slide.style.backgroundPosition = 'center';
                        }
                    }
                    
                    // إنشاء حاوية المحتوى
                    const content = document.createElement('div');
                    content.className = 'content';
                    slide.appendChild(content);
                    
                    // توليد المحتوى حسب نوع المشهد
                    this.generateSlideContent(content, slideConfig);
                    
                    // إضافة المشهد إلى الحاوية
                    reelsContainer.appendChild(slide);
                    
                    // حفظ مدة المشهد
                    this.slideDurations.push(slideConfig.timing?.duration || 5000);
                    
                    // إضافة المشهد إلى المصفوفة
                    this.slides.push(slide);
                });
            } else {
                // إذا لم تكن هناك مشاهد، إضافة رسالة خطأ
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.innerHTML = '<h2>لا توجد مشاهد</h2><p>يرجى إضافة مشاهد إلى المشروع</p>';
                reelsContainer.appendChild(errorMessage);
            }
        }

        /**
         * توليد محتوى المشهد
         * @param {HTMLElement} container حاوية المحتوى
         * @param {Object} slideConfig تكوين المشهد
         */
        generateSlideContent(container, slideConfig) {
            const content = slideConfig.content;
            
            switch (slideConfig.type) {
                case 'title':
                    this.generateTitleSlide(container, slideConfig);
                    break;
                case 'list':
                    this.generateListSlide(container, slideConfig);
                    break;
                case 'features':
                    this.generateFeaturesSlide(container, slideConfig);
                    break;
                case 'cta':
                    this.generateCtaSlide(container, slideConfig);
                    break;
                default:
                    container.innerHTML = \`<div class="error-message">نوع مشهد غير معروف: \${slideConfig.type}</div>\`;
            }
        }

        /**
         * توليد مشهد العنوان
         * @param {HTMLElement} container حاوية المحتوى
         * @param {Object} slideConfig تكوين المشهد
         */
        generateTitleSlide(container, slideConfig) {
            const content = slideConfig.content;
            
            // إضافة العبارة التحفيزية
            if (content.motivationalText) {
                const motivational = document.createElement('p');
                motivational.className = 'motivational';
                motivational.textContent = content.motivationalText;
                container.appendChild(motivational);
            }
            
            // إضافة العنوان الرئيسي
            if (content.mainTitle) {
                const mainTitle = document.createElement('h1');
                mainTitle.className = 'main-title';
                mainTitle.textContent = content.mainTitle;
                container.appendChild(mainTitle);
            }
            
            // إضافة العنوان الفرعي
            if (content.subTitle) {
                const subTitle = document.createElement('h2');
                subTitle.className = 'sub-title';
                subTitle.textContent = content.subTitle;
                container.appendChild(subTitle);
            }
            
            // إضافة الشعارات
            if (slideConfig.logos && slideConfig.logos.length > 0) {
                const logosContainer = document.createElement('div');
                logosContainer.className = 'logos-container';
                
                slideConfig.logos.forEach(logo => {
                    const logoImg = document.createElement('img');
                    logoImg.src = logoImages[logo.id] || '';
                    logoImg.alt = logo.alt || '';
                    logoImg.className = 'logo';
                    logosContainer.appendChild(logoImg);
                });
                
                container.appendChild(logosContainer);
            }
        }

        /**
         * توليد مشهد القائمة
         * @param {HTMLElement} container حاوية المحتوى
         * @param {Object} slideConfig تكوين المشهد
         */
        generateListSlide(container, slideConfig) {
            const content = slideConfig.content;
            
            // إضافة العنوان
            if (content.title) {
                const title = document.createElement('h2');
                title.className = 'title';
                title.textContent = content.title;
                container.appendChild(title);
            }
            
            // إضافة قائمة العناصر
            if (content.items && content.items.length > 0) {
                const specialtiesList = document.createElement('ul');
                specialtiesList.className = 'specialties';
                
                content.items.forEach((item, index) => {
                    const specialty = document.createElement('li');
                    specialty.className = 'specialty';
                    specialty.style.animationDelay = \`\${index * 0.2}s\`;
                    
                    // إضافة الأيقونة
                    if (item.icon) {
                        const iconContainer = document.createElement('div');
                        iconContainer.className = \`specialty-icon \${item.icon}-icon\`;
                        
                        // استخدام الأيقونة المضمنة
                        iconContainer.innerHTML = svgIcons[item.icon] || '';
                        
                        specialty.appendChild(iconContainer);
                    }
                    
                    // إضافة النص
                    const text = document.createElement('span');
                    text.textContent = item.text;
                    specialty.appendChild(text);
                    
                    specialtiesList.appendChild(specialty);
                });
                
                container.appendChild(specialtiesList);
            }
            
            // إضافة العبارة التحفيزية في النهاية
            if (content.motivationalText) {
                const motivational = document.createElement('p');
                motivational.className = 'motivational-end';
                motivational.textContent = content.motivationalText;
                container.appendChild(motivational);
            }
        }

        /**
         * توليد مشهد المزايا
         * @param {HTMLElement} container حاوية المحتوى
         * @param {Object} slideConfig تكوين المشهد
         */
        generateFeaturesSlide(container, slideConfig) {
            const content = slideConfig.content;
            
            // إضافة العنوان
            if (content.title) {
                const title = document.createElement('h2');
                title.className = 'title';
                title.textContent = content.title;
                container.appendChild(title);
            }
            
            // إضافة قائمة المزايا
            if (content.features && content.features.length > 0) {
                const featuresList = document.createElement('ul');
                featuresList.className = 'features';
                
                content.features.forEach((feature, index) => {
                    const featureItem = document.createElement('li');
                    featureItem.className = 'feature';
                    featureItem.style.animationDelay = \`\${index * 0.2}s\`;
                    
                    // إضافة الأيقونة
                    if (feature.icon) {
                        const iconContainer = document.createElement('div');
                        iconContainer.className = \`feature-icon \${feature.icon}-icon\`;
                        
                        // استخدام الأيقونة المضمنة
                        iconContainer.innerHTML = svgIcons[feature.icon] || '';
                        
                        featureItem.appendChild(iconContainer);
                    }
                    
                    // إضافة النص
                    const text = document.createElement('span');
                    text.textContent = feature.text;
                    featureItem.appendChild(text);
                    
                    featuresList.appendChild(featureItem);
                });
                
                container.appendChild(featuresList);
            }
            
            // إضافة طرق المشاركة
            if (content.participationModes && content.participationModes.length > 0) {
                const modesContainer = document.createElement('div');
                modesContainer.className = 'participation-modes';
                
                content.participationModes.forEach(mode => {
                    const modeDiv = document.createElement('div');
                    modeDiv.className = \`mode \${mode.icon}-mode\`;
                    
                    // إضافة الأيقونة
                    if (mode.icon) {
                        const iconContainer = document.createElement('div');
                        iconContainer.className = 'mode-icon';
                        
                        // استخدام الأيقونة المضمنة
                        iconContainer.innerHTML = svgIcons[mode.icon] || '';
                        
                        modeDiv.appendChild(iconContainer);
                    }
                    
                    // إضافة النص
                    const text = document.createElement('span');
                    text.textContent = mode.text;
                    modeDiv.appendChild(text);
                    
                    modesContainer.appendChild(modeDiv);
                });
                
                container.appendChild(modesContainer);
            }
        }

        /**
         * توليد مشهد دعوة العمل
         * @param {HTMLElement} container حاوية المحتوى
         * @param {Object} slideConfig تكوين المشهد
         */
        generateCtaSlide(container, slideConfig) {
            const content = slideConfig.content;
            
            // إضافة العنوان
            if (content.title) {
                const title = document.createElement('h2');
                title.className = 'title cta-title';
                title.textContent = content.title;
                container.appendChild(title);
            }
            
            // إضافة العنوان الفرعي
            if (content.subtitle) {
                const subtitle = document.createElement('p');
                subtitle.className = 'subtitle';
                subtitle.textContent = content.subtitle;
                container.appendChild(subtitle);
            }
            
            // إضافة زر دعوة العمل
            if (content.ctaLink) {
                const ctaContainer = document.createElement('div');
                ctaContainer.className = 'cta-container';
                
                const ctaLink = document.createElement('a');
                ctaLink.href = content.ctaLink;
                ctaLink.className = 'cta-button';
                ctaLink.textContent = content.ctaText || 'سجل الآن';
                ctaLink.target = '_blank';
                
                ctaContainer.appendChild(ctaLink);
                container.appendChild(ctaContainer);
            }
            
            // إضافة رمز QR
            if (content.qrCode) {
                const qrContainer = document.createElement('div');
                qrContainer.className = 'qr-container';
                
                // إنشاء رمز QR ديناميكياً (يمكن استخدام مكتبة خارجية)
                const qrPlaceholder = document.createElement('div');
                qrPlaceholder.className = 'qr-code';
                qrPlaceholder.setAttribute('data-url', content.ctaLink);
                qrPlaceholder.textContent = 'QR Code';
                
                qrContainer.appendChild(qrPlaceholder);
                container.appendChild(qrContainer);
            }
            
            // إضافة الشعارات
            if (slideConfig.logos && slideConfig.logos.length > 0) {
                const logosContainer = document.createElement('div');
                logosContainer.className = 'logos-container footer-logos';
                
                slideConfig.logos.forEach(logo => {
                    const logoImg = document.createElement('img');
                    logoImg.src = logoImages[logo.id] || '';
                    logoImg.alt = logo.alt || '';
                    logoImg.className = 'logo';
                    logosContainer.appendChild(logoImg);
                });
                
                container.appendChild(logosContainer);
            }
        }

        /**
         * إضافة شريط التقدم
         */
        addProgressBar() {
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            
            this.progressIndicator = document.createElement('div');
            this.progressIndicator.className = 'progress-indicator';
            
            progressBar.appendChild(this.progressIndicator);
            document.getElementById('app').appendChild(progressBar);
        }

        /**
         * إعداد مستمع الرسائل
         */
        setupMessageListener() {
            window.addEventListener('message', (event) => {
                // التحقق من مصدر الرسالة
                if (event.source !== window.parent) return;
                
                const message = event.data;
                
                // معالجة الرسالة
                switch (message.action) {
                    case 'play':
                        this.play();
                        break;
                    case 'pause':
                        this.pause();
                        break;
                    case 'next':
                        this.nextSlide();
                        break;
                    case 'prev':
                        this.prevSlide();
                        break;
                    case 'goToSlide':
                        if (typeof message.slideIndex === 'number') {
                            this.showSlide(message.slideIndex);
                        }
                        break;
                }
            });
        }

        /**
         * إرسال رسالة جاهزية
         */
        sendReadyMessage() {
            window.parent.postMessage({
                type: 'preview-ready',
                slidesCount: this.slides.length,
                currentSlideIndex: this.currentSlideIndex
            }, '*');
        }

        /**
         * إرسال رسالة تحديث الحالة
         */
        sendStatusUpdate() {
            window.parent.postMessage({
                type: 'status-update',
                isPlaying: this.isPlaying,
                currentSlideIndex: this.currentSlideIndex,
                slidesCount: this.slides.length
            }, '*');
        }

        /**
         * عرض مشهد محدد
         * @param {number} index رقم المشهد
         */
        showSlide(index) {
            // التأكد من أن الرقم ضمن النطاق
            if (index < 0) {
                index = this.slides.length - 1;
            } else if (index >= this.slides.length) {
                index = 0;
            }
            
            // إيقاف مؤقت التقدم
            this.stopProgressTimer();
            
            // إخفاء جميع المشاهد
            this.slides.forEach((slide, i) => {
                slide.classList.remove('active');
            });
            
            // عرض المشهد الحالي
            this.slides[index].classList.add('active');
            
            // تحديث المؤشر الحالي
            this.currentSlideIndex = index;
            
            // إعادة تشغيل المؤقت إذا كان التشغيل التلقائي مفعلاً
            if (this.isPlaying) {
                this.startProgressTimer();
            }
            
            // إرسال تحديث الحالة
            this.sendStatusUpdate();
        }

        /**
         * الانتقال إلى المشهد التالي
         */
        nextSlide() {
            const nextIndex = this.currentSlideIndex + 1;
            this.showSlide(nextIndex);
        }

        /**
         * الانتقال إلى المشهد السابق
         */
        prevSlide() {
            const prevIndex = this.currentSlideIndex - 1;
            this.showSlide(prevIndex);
        }

        /**
         * بدء التشغيل
         */
        play() {
            this.isPlaying = true;
            this.startProgressTimer();
            this.sendStatusUpdate();
        }

        /**
         * إيقاف التشغيل
         */
        pause() {
            this.isPlaying = false;
            this.stopProgressTimer();
            this.sendStatusUpdate();
        }

        /**
         * بدء مؤقت التقدم
         */
        startProgressTimer() {
            // إيقاف المؤقت الحالي إذا كان موجوداً
            this.stopProgressTimer();
            
            // الحصول على مدة المشهد الحالي
            const duration = this.slideDurations[this.currentSlideIndex] || 5000;
            
            // إعادة تعيين شريط التقدم
            if (this.progressIndicator) {
                this.progressIndicator.style.width = '0%';
                
                // تحريك شريط التقدم
                const startTime = Date.now();
                
                this.progressTimer = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration * 100, 100);
                    
                    this.progressIndicator.style.width = \`\${progress}%\`;
                    
                    if (progress >= 100) {
                        this.stopProgressTimer();
                        this.nextSlide();
                        this.startProgressTimer();
                    }
                }, 50);
            }
        }

        /**
         * إيقاف مؤقت التقدم
         */
        stopProgressTimer() {
            if (this.progressTimer) {
                clearInterval(this.progressTimer);
                this.progressTimer = null;
            }
        }
    }
    // ===== نهاية قسم وحدة التحكم بالحركة =====
    
    // ===== بداية قسم التشغيل الرئيسي =====
    // انتظار تحميل الصفحة بالكامل
    document.addEventListener('DOMContentLoaded', () => {
        try {
            // تهيئة وحدة التحكم بالحركة
            const animationController = new AnimationController();
            animationController.initialize();
            
            // إضافة وحدة التحكم بالحركة إلى النافذة للوصول إليها من وحدة التسجيل
            window.animationController = animationController;
            
        } catch (error) {
            console.error('حدث خطأ أثناء تهيئة العرض التقديمي:', error);
            document.getElementById('app').innerHTML = \`
                <div class="error-message">
                    <h2>حدث خطأ أثناء تحميل العرض التقديمي</h2>
                    <p>\${error.message}</p>
                </div>
            \`;
        }
    });
    // ===== نهاية قسم التشغيل الرئيسي =====
    </script>
    <!-- ===== نهاية قسم JavaScript ===== -->
</body>
</html>`;
  };
  
  // إعداد التواصل مع iframe
  const setupIframeCommunication = () => {
    window.addEventListener('message', handleIframeMessage);
  };
  
  // معالجة الرسائل من iframe
  const handleIframeMessage = (event) => {
    // التحقق من مصدر الرسالة
    if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
    
    const message = event.data;
    
    // معالجة الرسالة
    if (message.type === 'preview-ready') {
      setIsLoading(false);
      setCurrentSlideIndex(message.currentSlideIndex);
    } else if (message.type === 'status-update') {
      setIsPlaying(message.isPlaying);
      setCurrentSlideIndex(message.currentSlideIndex);
    }
  };
  
  // إرسال رسالة إلى iframe
  const sendMessageToIframe = (message: any) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(message, '*');
  };
  
  // تشغيل العرض
  const handlePlay = () => {
    sendMessageToIframe({ action: 'play' });
  };
  
  // إيقاف العرض
  const handlePause = () => {
    sendMessageToIframe({ action: 'pause' });
  };
  
  // الانتقال إلى المشهد السابق
  const handlePrev = () => {
    sendMessageToIframe({ action: 'prev' });
  };
  
  // الانتقال إلى المشهد التالي
  const handleNext = () => {
    sendMessageToIframe({ action: 'next' });
  };
  
  // إعادة تحميل المعاينة
  const handleRefresh = () => {
    updatePreview();
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* شريط أدوات المعاينة */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">المعاينة</h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button variant="outline" size="sm" onClick={handlePrev}>
            <SkipBack className="h-4 w-4" />
          </Button>
          
          {isPlaying ? (
            <Button variant="outline" size="sm" onClick={handlePause}>
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handlePlay}>
              <Play className="h-4 w-4" />
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={handleNext}>
            <SkipForward className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* منطقة المعاينة */}
      <div className="flex-1 flex items-center justify-center bg-background p-4">
        <div 
          className="relative bg-[#1a1a2e] rounded-md shadow-lg overflow-hidden"
          style={{ 
            width: `${width}px`, 
            height: `${height}px`, 
            aspectRatio: '9/16'
          }}
        >
          {/* حالة التحميل */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            </div>
          )}
          
          {/* iframe للمعاينة */}
          <iframe 
            ref={iframeRef}
            className="w-full h-full border-0"
            title="معاينة الريل"
          ></iframe>
        </div>
      </div>
      
      {/* شريط الحالة */}
      <div className="h-8 border-t border-border bg-muted flex items-center px-4">
        <div className="text-xs text-muted-foreground">
          المشهد {currentSlideIndex + 1} من {project.reelsConfig.slides.length}
        </div>
      </div>
    </div>
  );
};

export default DynamicPreview;
