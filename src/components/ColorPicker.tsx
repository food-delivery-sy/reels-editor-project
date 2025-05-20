import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  // إغلاق منتقي الألوان عند النقر خارجه
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // قائمة الألوان المقترحة
  const suggestedColors = [
    '#1a1a2e', '#0f3460', '#e94560', '#16213e', '#533483',
    '#0f3460', '#e94560', '#ff9b6a', '#38b000', '#006466',
    '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0',
    '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#6c757d'
  ];
  
  return (
    <div className="relative" ref={pickerRef}>
      <Button
        type="button"
        variant="outline"
        className="w-full h-10 p-1 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="w-6 h-6 rounded-sm border border-border"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs">{color}</span>
      </Button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 p-2 bg-background border border-border rounded-md shadow-md w-full">
          <div className="grid grid-cols-5 gap-1 mb-2">
            {suggestedColors.map((suggestedColor, index) => (
              <button
                key={index}
                type="button"
                className="w-6 h-6 rounded-sm border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: suggestedColor }}
                onClick={() => {
                  onChange(suggestedColor);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-8 h-8"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 h-8 px-2 text-xs border border-border rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
};
