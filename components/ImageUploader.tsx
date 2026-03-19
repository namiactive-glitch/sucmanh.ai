import React from 'react';
import { Upload, X } from 'lucide-react';
import { ProcessedImage } from '../types';

interface ImageUploaderProps {
  label: string;
  icon: React.ReactNode;
  image: ProcessedImage | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  colorClass: string;
  bgColorClass: string;
  borderColorClass: string;
  heightClass?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  icon,
  image,
  onUpload,
  onRemove,
  colorClass,
  bgColorClass,
  borderColorClass,
  heightClass = "h-64"
}) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 font-display font-bold text-gray-700 text-xs uppercase tracking-wide">
        {icon}
        {label}
      </label>
      <div 
        className={`relative group ${heightClass} border-2 border-dashed rounded-2xl transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer
          ${image ? `${borderColorClass} ${bgColorClass}` : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50'}`}
      >
        {image ? (
          <>
            <img src={image.preview} alt={label} className="h-full w-full object-contain p-2" />
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(); }} 
              className="absolute top-2 right-2 p-1.5 bg-gray-900/60 text-white rounded-full hover:bg-red-500 transition-colors z-10"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <div className={`mb-2 p-3 rounded-full transition-transform group-hover:scale-110 ${image ? bgColorClass : 'bg-orange-50'} ${image ? colorClass : 'text-orange-500'}`}>
              <Upload size={20} />
            </div>
            <span className="text-xs font-display font-medium text-gray-500 group-hover:text-orange-600 transition-colors">Nhấn để tải lên</span>
          </>
        )}
        <input 
          type="file" 
          accept="image/*" 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={onUpload} 
          onClick={(e) => (e.currentTarget.value = '')} 
        />
      </div>
    </div>
  );
};