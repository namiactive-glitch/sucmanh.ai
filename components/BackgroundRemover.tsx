import React, { useState } from 'react';
import { Eraser, Download, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { ProcessedImage } from '../types';
import { removeBackground } from '../services/geminiService';
import { ImageUploader } from './ImageUploader';

export const BackgroundRemover: React.FC = () => {
  const [image, setImage] = useState<ProcessedImage | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const processFile = (file: File): Promise<ProcessedImage> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        if (event.target?.result) {
            img.src = event.target.result as string;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1024; 
              const scaleSize = MAX_WIDTH / Math.max(img.width, MAX_WIDTH);
              canvas.width = img.width * scaleSize;
              canvas.height = img.height * scaleSize;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  const dataUrl = canvas.toDataURL(file.type);
                  resolve({
                    preview: dataUrl,
                    base64: dataUrl.split(',')[1],
                    mimeType: file.type
                  });
              } else {
                  reject(new Error("Canvas context failed"));
              }
            };
            img.onerror = (e) => reject(e);
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setError('Dung lượng file quá lớn. Vui lòng chọn ảnh dưới 4MB.');
      return;
    }

    try {
      setError('');
      setResultImage(null);
      const processed = await processFile(file);
      setImage(processed);
    } catch (err) {
      console.error(err);
      setError('Lỗi xử lý ảnh. Vui lòng thử file khác.');
    }
  };

  const handleRemoveBackground = async () => {
    if (!image) return;

    setIsProcessing(true);
    setError('');
    setResultImage(null);

    try {
      const result = await removeBackground(image);
      setResultImage(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Tách nền thất bại. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `tach-nen-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8">
       <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Eraser className="text-orange-500" />
                Tách Nền Sản Phẩm AI
            </h2>
            <p className="text-gray-500 mb-6 font-body">Tự động xóa phông nền, giữ lại sản phẩm sắc nét với nền trong suốt (PNG).</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                <div className="space-y-4">
                    <ImageUploader 
                        label="Ảnh Gốc" 
                        icon={<ImageIcon size={16} className="text-orange-600" />}
                        image={image}
                        onUpload={handleFileUpload}
                        onRemove={() => { setImage(null); setResultImage(null); }}
                        colorClass="text-orange-600"
                        bgColorClass="bg-orange-50"
                        borderColorClass="border-orange-400"
                    />
                    
                    <button
                        onClick={handleRemoveBackground}
                        disabled={!image || isProcessing}
                        className={`w-full py-3 rounded-xl font-display font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                        ${!image 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : isProcessing
                                ? 'bg-orange-700 cursor-wait'
                                : 'bg-orange-500 hover:bg-orange-600 hover:scale-[1.02] active:scale-95'}`}
                    >
                        {isProcessing ? (
                            <>
                                <RefreshCw className="animate-spin" size={20} />
                                Đang Xử Lý...
                            </>
                        ) : (
                            <>
                                <Eraser size={20} />
                                Tách Nền Ngay
                            </>
                        )}
                    </button>
                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-100 text-sm font-body">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 font-display font-bold text-gray-700 text-sm uppercase tracking-wide">
                        <Download size={16} className="text-orange-600" />
                        Kết Quả (Trong Suốt)
                    </label>
                    <div className="relative h-64 border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden checkerboard flex items-center justify-center">
                        {resultImage ? (
                            <img src={resultImage} alt="Kết quả tách nền" className="h-full w-full object-contain p-2 relative z-10" />
                        ) : (
                            <div className="text-center text-gray-400 font-body">
                                <p className="text-sm">{isProcessing ? 'Đang gọi AI xử lý...' : 'Chờ xử lý'}</p>
                            </div>
                        )}
                    </div>
                    
                    {resultImage && (
                         <button 
                            onClick={downloadImage}
                            className="w-full mt-2 bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-xl font-display font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            <Download size={16} /> Tải Ảnh PNG
                        </button>
                    )}
                </div>
            </div>
          </div>
       </div>
    </div>
  );
};