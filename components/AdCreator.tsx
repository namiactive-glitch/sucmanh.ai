import React, { useState } from 'react';
import { Sparkles, Box, Upload, Download, RefreshCw, AlertCircle, Megaphone, Palette, Type } from 'lucide-react';
import { ProcessedImage } from '../types';
import { generateAdImage } from '../services/geminiService';
import { ImageUploader } from './ImageUploader';

export const AdCreator: React.FC = () => {
  const [productImage, setProductImage] = useState<ProcessedImage | null>(null);
  const [logoImage, setLogoImage] = useState<ProcessedImage | null>(null);
  const [adPrompt, setAdPrompt] = useState('Ảnh quảng cáo, chất lượng cao, hiện đại');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<ProcessedImage | null>>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn một file ảnh.');
        return;
    }

    try {
      setError(null);
      const processed = await processFile(file);
      setter(processed);
      setGeneratedImage(null);
    } catch (err) {
      console.error(err);
      setError('Lỗi xử lý ảnh. Vui lòng thử file khác.');
    }
  };

  const handleGenerate = async () => {
    if (!productImage) {
      setError('Vui lòng tải lên ảnh sản phẩm trước.');
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);
    setError(null);

    try {
        const result = await generateAdImage(productImage, logoImage, adPrompt);
        setGeneratedImage(result);
    } catch (err: any) {
        console.error('Lỗi gọi API:', err);
        setError(`Lỗi tạo ảnh: ${err.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `quang-cao-ai-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 bg-white">
      
      <div className="lg:col-span-3 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar bg-slate-50/50">
          <div className="flex items-center gap-2 mb-1">
              <span className="bg-orange-100 text-orange-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold">1</span>
              <h3 className="font-display font-bold text-gray-700 text-sm uppercase">Đầu Vào</h3>
          </div>
          
          <div className="space-y-4">
              <ImageUploader 
                  label="Ảnh Sản Phẩm Chính" 
                  icon={<Box size={14} className="text-orange-600" />}
                  image={productImage}
                  onUpload={(e) => handleFileUpload(e, setProductImage)}
                  onRemove={() => setProductImage(null)}
                  colorClass="text-orange-600"
                  bgColorClass="bg-orange-50"
                  borderColorClass="border-orange-400"
                  heightClass="h-48"
              />
              
              <ImageUploader 
                  label="Logo (Tùy chọn)" 
                  icon={<Upload size={14} className="text-amber-600" />}
                  image={logoImage}
                  onUpload={(e) => handleFileUpload(e, setLogoImage)}
                  onRemove={() => setLogoImage(null)}
                  colorClass="text-amber-600"
                  bgColorClass="bg-amber-50"
                  borderColorClass="border-amber-400"
                  heightClass="h-32"
              />
              <p className="text-[10px] text-gray-500 italic px-1 font-body">
                  *Logo sẽ được AI tự động chèn vào góc phù hợp nhất của ảnh quảng cáo.
              </p>
          </div>
      </div>

      <div className="lg:col-span-5 p-4 overflow-y-auto custom-scrollbar bg-white">
          <div className="flex items-center gap-2 mb-4 sticky top-0 bg-white z-10 py-1">
              <span className="bg-orange-100 text-orange-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold">2</span>
              <h3 className="font-display font-bold text-gray-700 text-sm uppercase">Cấu Hình Quảng Cáo</h3>
          </div>
          
          <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <label className="flex items-center gap-1.5 font-display font-bold text-gray-600 text-xs uppercase mb-3">
                      <Palette size={14}/> Phong Cách Thiết Kế
                  </label>
                  
                  <textarea
                      rows={4}
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow resize-none bg-gray-50 font-body"
                      placeholder="Ví dụ: Phong cách cyberpunk với ánh sáng neon đỏ và xanh dương, hiện đại, tối giản. Nền tối sang trọng..."
                      value={adPrompt}
                      onChange={(e) => setAdPrompt(e.target.value)}
                  />
                  
                  <div className="mt-3 flex gap-2 flex-wrap font-body">
                      {['Tối giản (Minimalist)', 'Sang trọng (Luxury)', 'Thiên nhiên (Eco)', 'Công nghệ (Tech)'].map(tag => (
                          <button 
                              key={tag}
                              onClick={() => setAdPrompt(tag)}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] rounded-md transition-colors"
                          >
                              {tag}
                          </button>
                      ))}
                  </div>
                   <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-body">
                      <Megaphone size={10} /> AI sẽ tự động đề xuất phong cách nếu để trống.
                   </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <h4 className="font-display font-bold text-orange-800 text-xs uppercase mb-2">Thông tin xử lý</h4>
                  {logoImage ? (
                      <p className='text-orange-700 text-xs flex items-start gap-2 font-body'>
                          <span className="mt-1 block w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0"></span>
                          Logo được cung cấp. AI sẽ chèn vào vị trí phù hợp.
                      </p>
                  ) : (
                      <p className='text-orange-700 text-xs flex items-start gap-2 font-body'>
                           <span className="mt-1 block w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0"></span>
                          Không có logo. AI sẽ tạo ảnh sạch, không chứa văn bản.
                      </p>
                  )}
              </div>
          </div>
      </div>

      <div className="lg:col-span-4 p-4 flex flex-col gap-4 bg-slate-50/30">
          <div className="flex items-center gap-2 mb-1">
              <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold">3</span>
              <h3 className="font-display font-bold text-gray-700 text-sm uppercase">Kết Quả</h3>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={isLoading || !productImage}
            className={`
                w-full py-3 rounded-xl text-sm font-display font-bold text-white shadow-lg transition-all transform
                ${(!productImage) 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : isLoading 
                    ? 'bg-gray-800 cursor-wait' 
                    : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:scale-[1.02] active:scale-95'}
            `}
        >
            <div className="flex items-center justify-center gap-2">
                {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {isLoading ? 'ĐANG THIẾT KẾ...' : 'TẠO ẢNH QUẢNG CÁO'}
            </div>
        </button>

         {error && (
             <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100 text-xs font-body">
                <AlertCircle size={14} />
                {error}
            </div>
        )}

        <div className="flex-1 bg-gray-200/50 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden group min-h-[300px]">
             {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-4">
                    <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-orange-600 font-bold animate-pulse text-xs font-body">AI đang thiết kế...</p>
                </div>
            )}
            
            {generatedImage ? (
                <>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                <img src={generatedImage} alt="Kết Quả" className="w-full h-full object-contain p-2 z-10" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20 px-4">
                    <button onClick={downloadImage} className="bg-white/90 backdrop-blur text-gray-900 px-4 py-2 rounded-full text-xs font-bold font-display flex items-center gap-1 shadow-lg hover:bg-white hover:scale-105 transition-all">
                        <Download size={14} /> Tải Về
                    </button>
                </div>
                </>
            ) : (
                <div className="text-center text-gray-400 p-6">
                    <Megaphone size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium font-body">Chưa Có Ảnh</p>
                    <p className="text-xs mt-1 font-body">Kết quả sẽ hiển thị ở đây</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};