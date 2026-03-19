import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ImageAsset } from '../types';

interface UploadBoxProps {
  id: string;
  label: string;
  image: ImageAsset | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  heightClass?: string;
}

export const UploadBox: React.FC<UploadBoxProps> = ({ id, label, image, onUpload, onRemove, heightClass = "h-40" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`relative border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer overflow-hidden group ${heightClass}`}
      onClick={() => fileInputRef.current?.click()}
    >
      {image ? (
        <>
          <img src={image.previewUrl} alt="Preview" className="w-full h-full object-contain p-2" />
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
        </>
      ) : (
        <div className="text-center p-4">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 font-medium">{label}</p>
        </div>
      )}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
};
