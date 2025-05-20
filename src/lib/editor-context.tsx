import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ReelsEditorProject, ReelsConfig, Slide, createEmptyProject, convertToInternalModel } from './models';

// واجهة سياق المحرر
interface EditorContextType {
  project: ReelsEditorProject;
  currentSlideId: string | null;
  isLoading: boolean;
  
  // دوال التحديث
  setProject: (project: ReelsEditorProject) => void;
  updateGeneralSettings: (settings: Partial<ReelsConfig['general']>) => void;
  updateSlide: (slideId: string, slideData: Partial<Slide>) => void;
  addSlide: (slide: Slide) => void;
  removeSlide: (slideId: string) => void;
  reorderSlides: (newOrder: string[]) => void;
  setCurrentSlideId: (slideId: string | null) => void;
  
  // دوال التحميل والتصدير
  loadFromReelsConfig: (reelsConfig: any) => void;
  exportToReelsConfig: () => ReelsConfig;
  resetProject: () => void;
}

// إنشاء السياق
const EditorContext = createContext<EditorContextType | undefined>(undefined);

// مزود السياق
export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // حالة المشروع
  const [project, setProject] = useState<ReelsEditorProject>(createEmptyProject());
  // المشهد الحالي المحدد
  const [currentSlideId, setCurrentSlideId] = useState<string | null>(null);
  // حالة التحميل
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // تحديث الإعدادات العامة
  const updateGeneralSettings = (settings: Partial<ReelsConfig['general']>) => {
    setProject(prev => ({
      ...prev,
      reelsConfig: {
        ...prev.reelsConfig,
        general: {
          ...prev.reelsConfig.general,
          ...settings
        }
      }
    }));
  };
  
  // تحديث مشهد
  const updateSlide = (slideId: string, slideData: Partial<Slide>) => {
    setProject(prev => ({
      ...prev,
      reelsConfig: {
        ...prev.reelsConfig,
        slides: prev.reelsConfig.slides.map(slide => 
          slide.id === slideId ? { ...slide, ...slideData } : slide
        )
      }
    }));
  };
  
  // إضافة مشهد
  const addSlide = (slide: Slide) => {
    setProject(prev => ({
      ...prev,
      reelsConfig: {
        ...prev.reelsConfig,
        slides: [...prev.reelsConfig.slides, slide]
      }
    }));
    
    // تحديد المشهد الجديد كمشهد حالي
    setCurrentSlideId(slide.id);
  };
  
  // حذف مشهد
  const removeSlide = (slideId: string) => {
    setProject(prev => ({
      ...prev,
      reelsConfig: {
        ...prev.reelsConfig,
        slides: prev.reelsConfig.slides.filter(slide => slide.id !== slideId)
      }
    }));
    
    // إذا كان المشهد المحذوف هو المشهد الحالي، إعادة تعيين المشهد الحالي
    if (currentSlideId === slideId) {
      const remainingSlides = project.reelsConfig.slides.filter(slide => slide.id !== slideId);
      setCurrentSlideId(remainingSlides.length > 0 ? remainingSlides[0].id : null);
    }
  };
  
  // إعادة ترتيب المشاهد
  const reorderSlides = (newOrder: string[]) => {
    setProject(prev => {
      // إنشاء نسخة من المشاهد
      const slides = [...prev.reelsConfig.slides];
      
      // إعادة ترتيب المشاهد حسب المصفوفة الجديدة
      const reorderedSlides = newOrder
        .map(id => slides.find(slide => slide.id === id))
        .filter((slide): slide is Slide => slide !== undefined);
      
      return {
        ...prev,
        reelsConfig: {
          ...prev.reelsConfig,
          slides: reorderedSlides
        }
      };
    });
  };
  
  // تحميل من reelsConfig
  const loadFromReelsConfig = (reelsConfig: any) => {
    setIsLoading(true);
    
    try {
      // تحويل reelsConfig إلى نموذج البيانات الداخلي
      const newProject = convertToInternalModel(reelsConfig);
      setProject(newProject);
      
      // تحديد المشهد الأول كمشهد حالي إذا وجد
      if (newProject.reelsConfig.slides.length > 0) {
        setCurrentSlideId(newProject.reelsConfig.slides[0].id);
      } else {
        setCurrentSlideId(null);
      }
      
      console.log('تم تحميل المشروع بنجاح:', newProject);
    } catch (error) {
      console.error('خطأ في تحميل المشروع:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // تصدير إلى reelsConfig
  const exportToReelsConfig = (): ReelsConfig => {
    return project.reelsConfig;
  };
  
  // إعادة تعيين المشروع
  const resetProject = () => {
    setProject(createEmptyProject());
    setCurrentSlideId(null);
  };
  
  // قيمة السياق
  const contextValue: EditorContextType = {
    project,
    currentSlideId,
    isLoading,
    setProject,
    updateGeneralSettings,
    updateSlide,
    addSlide,
    removeSlide,
    reorderSlides,
    setCurrentSlideId,
    loadFromReelsConfig,
    exportToReelsConfig,
    resetProject
  };
  
  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

// خطاف استخدام السياق
export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  
  if (context === undefined) {
    throw new Error('useEditor يجب أن يستخدم داخل EditorProvider');
  }
  
  return context;
};
