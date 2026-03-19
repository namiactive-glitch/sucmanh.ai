import React, { useState } from 'react';
import { Sparkles, Video, RefreshCw, Download, AlertCircle, Box, User, Copy } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { ProcessedImage } from '../types';
import { generateMarketingImage, generateVideoPrompt } from '../services/geminiService';

export const MarketingAI: React.FC = () => {
    const [productImage, setProductImage] = useState<ProcessedImage | null>(null);
    const [faceImage, setFaceImage] = useState<ProcessedImage | null>(null);
    const [productName, setProductName] = useState('');
    const [feedback, setFeedback] = useState('');
    
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generatedVideoPrompt, setGeneratedVideoPrompt] = useState<string>('');
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [isVideoGenerating, setIsVideoGenerating] = useState(false);
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<ProcessedImage | null>>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const processed = await processFile(file);
            setter(processed);
        } catch (err) {
            console.error(err);
            setError('Lỗi tải ảnh');
        }
    };

    const handleGenerateImage = async () => {
        if (!productImage || !productName) {
            setError('Vui lòng nhập Tên sản phẩm và Ảnh sản phẩm.');
            return;
        }
        setIsGenerating(true);
        setError('');
        setGeneratedImage(null);
        setGeneratedVideoPrompt('');

        try {
            const result = await generateMarketingImage(productImage, faceImage, productName, feedback);
            setGeneratedImage(result);
        } catch (err: any) {
            setError(err.message || 'Lỗi tạo ảnh');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateVideoPrompt = async () => {
        if (!generatedImage || !productName) return;
        setIsVideoGenerating(true);
        try {
            const imageDesc = `Ảnh marketing cho ${productName}. ${feedback}`;
            const prompt = await generateVideoPrompt(productName, feedback, imageDesc);
            setGeneratedVideoPrompt(prompt);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsVideoGenerating(false);
        }
    };
    
    const downloadImage = () => {
        if (generatedImage) {
          const link = document.createElement('a');
          link.href = generatedImage;
          link.download = `marketing-ai-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
    };

    return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 bg-white">
            <div className="lg:col-span-3 p-4 flex flex-col gap-4 bg-slate-50/50 custom-scrollbar overflow-y-auto">
                 <div className="flex items-center gap-2 mb-1">
                    <span className="bg-orange-100 text-orange-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold">1</span>
                    <h3 className="font-display font-bold text-gray-700 text-sm uppercase">Tài Nguyên</h3>
                </div>
                <ImageUploader 
                    label="Ảnh Sản Phẩm *" 
                    icon={<Box size={14}/>} 
                    image={productImage} 
                    onUpload={(e) => handleFileUpload(e, setProductImage)} 
                    onRemove={() => setProductImage(null)}
                    colorClass="text-orange-600"
                    bgColorClass="bg-orange-50"
                    borderColorClass="border-orange-400"
                    heightClass="h-40"
                />
                 <ImageUploader 
                    label="Ảnh Gương Mặt (Tùy chọn)" 
                    icon={<User size={14}/>} 
                    image={faceImage} 
                    onUpload={(e) => handleFileUpload(e, setFaceImage)} 
                    onRemove={() => setFaceImage(null)}
                    colorClass="text-amber-600"
                    bgColorClass="bg-amber-50"
                    borderColorClass="border-amber-400"
                    heightClass="h-40"
                />
            </div>

            <div className="lg:col-span-5 p-4 bg-white custom-scrollbar overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-orange-100 text-orange-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold">2</span>
                    <h3 className="font-display font-bold text-gray-700 text-sm uppercase">Cấu Hình</h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-display font-bold text-gray-600 mb-1 block uppercase">Tên Sản Phẩm *</label>
                        <input 
                            type="text" 
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none font-body"
                            placeholder="Ví dụ: Nước hoa Charme..."
                            value={productName}
                            onChange={e => setProductName(e.target.value)}
                        />
                    </div>
                     <div>
                        <label className="text-xs font-display font-bold text-gray-600 mb-1 block uppercase">Yêu Cầu / USP (Unique Selling Point)</label>
                        <textarea 
                            rows={6}
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none font-body"
                            placeholder="Mô tả bối cảnh, ánh sáng, hoặc điểm nổi bật của sản phẩm..."
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 p-4 bg-slate-50/30 custom-scrollbar overflow-y-auto flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                    <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold">3</span>
                    <h3 className="font-display font-bold text-gray-700 text-sm uppercase">Kết Quả</h3>
                </div>

                <button 
                    onClick={handleGenerateImage}
                    disabled={isGenerating || !productImage || !productName}
                    className="w-full py-3 bg-orange-600 text-white font-display font-bold rounded-xl hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                    {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                    {isGenerating ? 'Đang Thiết Kế...' : 'Tạo Ảnh Marketing'}
                </button>

                {error && <div className="text-red-500 text-xs bg-red-50 p-2 rounded border border-red-100 flex items-center gap-1 font-body"><AlertCircle size={12}/>{error}</div>}

                <div className="relative min-h-[300px] border-2 border-dashed border-gray-300 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                    {generatedImage ? (
                        <>
                            <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
                             <button onClick={downloadImage} className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full shadow text-gray-800 hover:text-orange-600">
                                <Download size={16}/>
                            </button>
                        </>
                    ) : (
                         <div className="text-center text-gray-400">
                            <Sparkles className="mx-auto mb-2 opacity-50" size={24}/>
                            <p className="text-xs font-body">Kết quả hiển thị tại đây</p>
                        </div>
                    )}
                </div>

                {generatedImage && (
                    <div className="mt-2 border-t pt-4 border-gray-200">
                         <button 
                            onClick={handleGenerateVideoPrompt}
                            disabled={isVideoGenerating}
                            className="w-full py-2 bg-amber-100 text-amber-700 font-display font-bold rounded-lg hover:bg-amber-200 transition flex items-center justify-center gap-2 text-sm"
                        >
                            {isVideoGenerating ? <RefreshCw className="animate-spin" size={14}/> : <Video size={14}/>}
                            Tạo Prompt Video (Từ Ảnh Này)
                        </button>
                        
                        {generatedVideoPrompt && (
                            <div className="mt-3 bg-white border border-amber-200 rounded-xl p-3 relative group">
                                <label className="text-[10px] font-bold text-amber-500 uppercase mb-1 block">Prompt Video (Copy & Paste vào Veo/Sora)</label>
                                <p className="text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar font-body">{generatedVideoPrompt}</p>
                                <button 
                                    onClick={() => {navigator.clipboard.writeText(generatedVideoPrompt); alert('Copied!');}}
                                    className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-white rounded text-gray-500 hover:text-amber-600 transition"
                                >
                                    <Copy size={12}/>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};