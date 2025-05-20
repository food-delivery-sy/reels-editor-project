// نموذج بيانات reelsConfig
export interface ReelsConfig {
  general: GeneralSettings;
  slides: Slide[];
}

// الإعدادات العامة
export interface GeneralSettings {
  title: string;
  direction: 'rtl' | 'ltr';
  theme: ThemeSettings;
  timing: TimingSettings;
  fonts: FontSettings;
}

// إعدادات المظهر
export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

// إعدادات التوقيت
export interface TimingSettings {
  defaultSlideDuration: number;
  defaultTransitionDuration: number;
  autoPlay: boolean;
}

// إعدادات الخطوط
export interface FontSettings {
  headingFont: string;
  bodyFont: string;
}

// المشهد الأساسي
export interface Slide {
  id: string;
  type: SlideType;
  content: SlideContent;
  timing: SlideTimingSettings;
  background: SlideBackground;
  logos?: LogoItem[];
}

// أنواع المشاهد
export type SlideType = 'title' | 'list' | 'features' | 'cta';

// محتوى المشهد (واجهة عامة)
export interface SlideContent {
  [key: string]: any;
}

// محتوى مشهد العنوان
export interface TitleSlideContent extends SlideContent {
  motivationalText?: string;
  mainTitle: string;
  subTitle?: string;
}

// محتوى مشهد القائمة
export interface ListSlideContent extends SlideContent {
  title: string;
  items: ListItem[];
  motivationalText?: string;
}

// محتوى مشهد المزايا
export interface FeaturesSlideContent extends SlideContent {
  title: string;
  features: FeatureItem[];
  participationModes?: ParticipationMode[];
}

// محتوى مشهد دعوة العمل
export interface CTASlideContent extends SlideContent {
  title: string;
  subtitle?: string;
  ctaLink: string;
  ctaText: string;
  qrCode?: boolean;
}

// عنصر القائمة
export interface ListItem {
  text: string;
  icon: string;
}

// عنصر الميزة
export interface FeatureItem {
  text: string;
  icon: string;
}

// طريقة المشاركة
export interface ParticipationMode {
  text: string;
  icon: string;
}

// الشعار
export interface LogoItem {
  id: string;
  alt: string;
}

// إعدادات توقيت المشهد
export interface SlideTimingSettings {
  duration: number;
  transitionIn: TransitionEffect;
  transitionOut: TransitionEffect;
}

// تأثيرات الانتقال
export type TransitionEffect = 'fadeIn' | 'fadeOut' | 'slideInRight' | 'slideOutLeft' | 'zoomIn' | 'zoomOut';

// خلفية المشهد
export interface SlideBackground {
  type: 'color' | 'gradient' | 'image';
  value: string;
}

// الأصول
export interface Assets {
  logoImages: Record<string, string>;
  svgIcons: Record<string, string>;
}

// نموذج بيانات المشروع الكامل
export interface ReelsEditorProject {
  reelsConfig: ReelsConfig;
  assets: Assets;
}

// دالة لإنشاء مشروع فارغ
export const createEmptyProject = (): ReelsEditorProject => {
  return {
    reelsConfig: {
      general: {
        title: "مشروع جديد",
        direction: "rtl",
        theme: {
          primaryColor: "#4169e1",
          secondaryColor: "#ff8c00",
          backgroundColor: "#1a1a2e",
          textColor: "#ffffff"
        },
        timing: {
          defaultSlideDuration: 5000,
          defaultTransitionDuration: 800,
          autoPlay: true
        },
        fonts: {
          headingFont: "Cairo, sans-serif",
          bodyFont: "Tajawal, sans-serif"
        }
      },
      slides: []
    },
    assets: {
      logoImages: {},
      svgIcons: {}
    }
  };
};

// دالة لإنشاء مشهد جديد
export const createNewSlide = (type: SlideType, id: string): Slide => {
  const baseSlide: Slide = {
    id,
    type,
    timing: {
      duration: 5000,
      transitionIn: 'fadeIn',
      transitionOut: 'fadeOut'
    },
    background: {
      type: 'color',
      value: '#1a1a2e'
    },
    content: {}
  };

  // إضافة المحتوى حسب نوع المشهد
  switch (type) {
    case 'title':
      baseSlide.content = {
        mainTitle: "عنوان رئيسي جديد",
        subTitle: "عنوان فرعي",
        motivationalText: "نص تحفيزي"
      };
      baseSlide.logos = [];
      break;
    case 'list':
      baseSlide.content = {
        title: "عنوان القائمة",
        items: [],
        motivationalText: "نص تحفيزي"
      };
      break;
    case 'features':
      baseSlide.content = {
        title: "المزايا",
        features: [],
        participationModes: []
      };
      break;
    case 'cta':
      baseSlide.content = {
        title: "سجّل الآن!",
        subtitle: "لا تفوّت الفرصة",
        ctaLink: "https://example.com/register",
        ctaText: "التسجيل",
        qrCode: true
      };
      baseSlide.logos = [];
      break;
  }

  return baseSlide;
};

// دالة للتحقق من صحة كائن reelsConfig
export const validateReelsConfig = (config: any): boolean => {
  // التحقق من وجود الحقول الأساسية
  if (!config || typeof config !== 'object') return false;
  if (!config.general || !config.slides || !Array.isArray(config.slides)) return false;
  
  // التحقق من الإعدادات العامة
  const general = config.general;
  if (!general.theme || !general.timing || !general.fonts) return false;
  
  // التحقق من المشاهد
  for (const slide of config.slides) {
    if (!slide.id || !slide.type || !slide.content || !slide.timing || !slide.background) {
      return false;
    }
  }
  
  return true;
};

// دالة لتحويل reelsConfig إلى نموذج البيانات الداخلي
export const convertToInternalModel = (config: any): ReelsEditorProject => {
  // إذا كان التحقق من الصحة يفشل، إنشاء مشروع فارغ
  if (!validateReelsConfig(config)) {
    console.error('بنية reelsConfig غير صالحة');
    return createEmptyProject();
  }
  
  // نسخ الكائن لتجنب تعديل الأصل
  const reelsConfig = JSON.parse(JSON.stringify(config));
  
  // إنشاء مشروع جديد
  const project: ReelsEditorProject = {
    reelsConfig,
    assets: {
      logoImages: {},
      svgIcons: {}
    }
  };
  
  return project;
};
