
import React, { useState } from 'react';
import { Copy, Check, Sparkles, AlertCircle, Loader2, BookOpen, PenTool, RefreshCw, Box, Target, FileText, Zap, Tag, CircleDollarSign, AlertCircle as AlertIcon, Info, MessageSquareCode, Megaphone, Newspaper, MousePointer2 } from 'lucide-react';
import { generateAdCopy } from '../services/geminiService';
import { ImageUploader } from './ImageUploader';
import { ProcessedImage } from '../types';

export const ContentGeniusAI: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [productInfo, setProductInfo] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [selectedFormula, setSelectedFormula] = useState('AIDA');
  const [selectedHookStyle, setSelectedHookStyle] = useState('fomo');
  const [productImage, setProductImage] = useState<ProcessedImage | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const formulas = [
    { id: 'AIDA', name: 'AIDA', desc: 'Attention - Interest - Desire - Action', icon: '📢' },
    { id: 'PAS', name: 'PAS', desc: 'Problem - Agitate - Solution', icon: '🔥' },
    { id: '4U', name: '4U', desc: 'Urgent - Unique - Useful - Ultra-specific', icon: '⚡' },
    { id: 'FAB', name: 'FAB', desc: 'Features - Advantages - Benefits', icon: '💎' },
    { id: 'STORY', name: 'Storytelling', desc: 'Kể chuyện dẫn dắt cảm xúc', icon: '📖' },
    { id: 'REVIEW', name: 'Review', desc: 'Đánh giá chi tiết ưu & nhược điểm', icon: '⭐' },
    { id: 'EXPERIENCE', name: 'Trải Nghiệm', desc: 'Chia sẻ hành trình sử dụng thực tế', icon: '🗣️' },
  ];

  const hookStyles = [
    { id: 'fomo', name: 'Gây chú ý (FOMO)', icon: '🚨', desc: 'Đánh vào tâm lý sợ bỏ lỡ. "Mua 1 nhận 3 - Chậm tay mất liền!"' },
    { id: 'benefit_explain', name: 'Kể lợi ích', icon: '💎', desc: 'Giải thích tại sao nên mua ngay. "Tiết kiệm gấp đôi, quà cực xịn"' },
    { id: 'mini_story', name: 'Mini Story', icon: '📖', desc: 'Kể chuyện gần gũi. "Mua bộ dao tặng quà tưởng shop gửi nhầm"' },
    { id: 'hard_cta', name: 'Chốt đơn mạnh', icon: '📣', desc: 'Thúc đẩy hành động. "Chỉ còn 50 suất - Inbox nhận quà ngay!"' },
    { id: 'news', name: 'Thông báo CTKM', icon: '📢', desc: 'Giọng chuyên nghiệp. "Tuần lễ tri ân - Ưu đãi MUA 1 TẶNG 2"' },
    { id: 'surprising', name: 'Bất ngờ', icon: '🎲', desc: 'Gây ngạc nhiên cho người đọc' },
    { id: 'scandal', name: 'Bóc phốt', icon: '🕵️', desc: 'Tiêu đề gây shock, nội dung khen ngợi' },
    { id: 'warning', name: 'Cảnh báo', icon: '⚠️', desc: 'Gây chú ý bằng sự nguy cấp' },
    { id: 'funny', name: 'Hài hước', icon: '😂', desc: 'Vui vẻ, gần gũi Gen Z' },
    { id: 'trend', name: 'Bắt trend', icon: '⚡', desc: 'Sử dụng xu hướng hiện tại' },
    { id: 'curiosity', name: 'Gây tò mò', icon: '🧐', desc: 'Tạo cảm giác tò mò cực độ' },
  ];

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.");
      return;
    }

    try {
        setError('');
        const processed = await processFile(file);
        setProductImage(processed);
    } catch (err) {
        console.error(err);
        setError('Lỗi xử lý ảnh.');
    }
  };

  const handleGenerate = async () => {
    if (!productName || !productInfo) {
      setError("Vui lòng nhập tên và thông tin sản phẩm.");
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedContent('');
    setCopied(false);

    const formula = formulas.find(f => f.id === selectedFormula);

    try {
      const imgData = productImage ? { data: productImage.base64, mimeType: productImage.mimeType } : null;

      const resultText = await generateAdCopy(
        productName,
        productInfo,
        targetAudience,
        formula?.name || 'AIDA',
        formula?.desc || '',
        selectedHookStyle,
        originalPrice,
        discountPrice,
        imgData
      );

      setGeneratedContent(resultText);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tạo nội dung.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = generatedContent;
    
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    
    textArea.select();
    
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      setError("Không thể copy, vui lòng copy thủ công.");
    }
    
    document.body.removeChild(textArea);
  };

  return (
      <div className="lg:h-full h-auto grid grid-cols-1 lg:grid-cols-12 lg:divide-x lg:divide-y-0 divide-y divide-gray-200 bg-white">
        <div className="lg:col-span-3 p-4 flex flex-col gap-4 lg:overflow-y-auto h-auto custom-scrollbar bg-slate-50/50">
           <div className="flex items-center gap-2 mb-1">
              <span className="bg-orange-100 text-orange-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold">1</span>
              <h3 className="font-display font-bold text-gray-700 text-sm uppercase">Sản Phẩm</h3>
           </div>
           
           <ImageUploader 
              label="Ảnh Sản Phẩm (AI Vision)" 
              icon={<Box size={14} className="text-orange-600" />}
              image={productImage}
              onUpload={handleImageUpload}
              onRemove={() => setProductImage(null)}
              colorClass="text-orange-600"
              bgColorClass="bg-orange-50"
              borderColorClass="border-orange-400"
              heightClass="h-48"
           />
           
           <div className="space-y-3">
              <div>
                <label className="flex items-center gap-1.5 font-display font-bold text-gray-600 text-xs uppercase mb-1"><Box size={14}/> Tên sản phẩm *</label>
                <input 
                  type="text" 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ví dụ: Dao thép Nhật cao cấp..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all font-body"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="flex items-center gap-1.5 font-display font-bold text-gray-600 text-[10px] uppercase mb-1"><Tag size={12}/> Giá Gốc</label>
                    <input 
                      type="text" 
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="990.000đ"
                      className="w-full px-2 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none font-body"
                    />
                 </div>
                 <div>
                    <label className="flex items-center gap-1.5 font-display font-bold text-gray-600 text-[10px] uppercase mb-1"><CircleDollarSign size={12} className="text-red-500"/> Giá Deal</label>
                    <input 
                      type="text" 
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      placeholder="499k"
                      className="w-full px-2 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none font-body text-red-600 font-bold"
                    />
                 </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 font-display font-bold text-gray-600 text-xs uppercase mb-1"><Target size={14}/> Khách hàng mục tiêu</label>
                <input 
                  type="text" 
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="VD: Người nội trợ, đầu bếp..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all font-body"
                />
              </div>
           </div>
        </div>

        <div className="lg:col-span-5 p-4 lg:overflow-y-auto h-auto custom-scrollbar bg-white">
            <div className="flex items-center gap-2 mb-4 lg:sticky lg:top-0 static bg-white z-10 py-1">
              <span className="bg-orange-100 text-orange-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold">2</span>
              <h3 className="font-display font-bold text-gray-700 text-sm uppercase">Cấu Hình Content</h3>
            </div>
            
            <div className="space-y-6">
               <div>
                  <label className="flex items-center gap-1.5 font-display font-bold text-gray-600 text-xs uppercase mb-2"><FileText size={14}/> Thông tin sản phẩm (USP) *</label>
                  <textarea 
                    value={productInfo}
                    onChange={(e) => setProductInfo(e.target.value)}
                    placeholder="Thành phần, công dụng, quà tặng kèm theo..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none bg-slate-50 transition-all font-body"
                  />
                  <p className="text-[10px] text-orange-600 mt-1 font-bold italic">* Content hoàn chỉnh, tối đa 800 ký tự, đầy đủ Headline & CTA.</p>
               </div>

               <div>
                   <label className="flex items-center gap-1.5 font-display font-bold text-gray-600 text-xs uppercase mb-3"><Zap size={14} className="text-amber-500"/> Chọn Phong Cách Hook</label>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {hookStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedHookStyle(style.id)}
                          className={`
                            p-2 rounded-lg text-left transition-all border flex flex-col gap-1
                            ${selectedHookStyle === style.id 
                              ? 'bg-amber-50 border-amber-500 shadow-sm ring-1 ring-amber-200' 
                              : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-slate-50'}
                          `}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{style.icon}</span>
                            <span className={`font-bold text-[10px] font-display uppercase tracking-tight ${selectedHookStyle === style.id ? 'text-amber-700' : 'text-slate-600'}`}>
                                {style.name}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 line-clamp-1 font-body">{style.desc}</p>
                        </button>
                      ))}
                   </div>
               </div>

               <div>
                   <label className="flex items-center gap-1.5 font-display font-bold text-gray-600 text-xs uppercase mb-3"><BookOpen size={14}/> Chọn Công Thức Ads</label>
                   <div className="grid grid-cols-2 gap-2">
                      {formulas.map((formula) => (
                        <button
                          key={formula.id}
                          onClick={() => setSelectedFormula(formula.id)}
                          className={`
                            p-3 rounded-xl text-left transition-all border flex flex-col gap-1
                            ${selectedFormula === formula.id 
                              ? 'bg-orange-50 border-orange-500 shadow-sm ring-1 ring-orange-200' 
                              : 'bg-white border-slate-200 hover:border-orange-300 hover:bg-slate-50'}
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{formula.icon}</span>
                            <span className={`font-bold text-sm font-display ${selectedFormula === formula.id ? 'text-orange-700' : 'text-slate-700'}`}>
                              {formula.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-1 font-body">{formula.desc}</p>
                        </button>
                      ))}
                   </div>
               </div>
            </div>
        </div>

        <div className="lg:col-span-4 p-4 flex flex-col gap-4 bg-slate-50/30 h-auto">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-100 text-amber-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold">3</span>
              <h3 className="font-display font-bold text-gray-700 text-sm uppercase">Kết Quả Content</h3>
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={isLoading || !productName || !productInfo}
              className={`w-full py-3 rounded-xl font-display font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${isLoading || !productName || !productInfo ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:scale-[1.02] active:scale-95'}`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
              {isLoading ? 'Đang Viết...' : 'TẠO CONTENT NGAY'}
            </button>
            
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[300px]">
                <div className="p-2 border-b border-slate-100 bg-slate-50 flex justify-end gap-2">
                     <button onClick={handleGenerate} disabled={isLoading || !generatedContent} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors" title="Tạo lại"><RefreshCw size={14}/></button>
                     <button onClick={copyToClipboard} disabled={!generatedContent} className={`p-1.5 rounded flex items-center gap-1 text-xs font-bold transition-colors ${copied ? 'bg-green-100 text-green-700' : 'hover:bg-slate-200 text-slate-600'}`}>{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied' : 'Copy'}</button>
                </div>
                <div className="flex-1 lg:overflow-y-auto p-4 custom-scrollbar h-auto">
                     {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm border border-red-200 font-body">
                           <AlertIcon size={16} /> {error}
                        </div>
                     )}
                     {!generatedContent && !isLoading && !error && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                           <PenTool className="w-12 h-12 mb-2" />
                           <p className="text-xs font-body">Kết quả sẽ hiển thị tại đây</p>
                        </div>
                     )}
                     {isLoading && (
                        <div className="space-y-3 p-2">
                            <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
                            <div className="h-20 bg-slate-100 rounded w-full animate-pulse"></div>
                        </div>
                     )}
                     {generatedContent && !isLoading && (
                        <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-body">
                           {generatedContent}
                        </div>
                     )}
                </div>
                {generatedContent && !isLoading && (
                    <div className="p-2 border-t border-slate-100 bg-slate-50 text-[10px] text-right text-slate-400 font-mono">
                        {generatedContent.length} ký tự
                    </div>
                )}
            </div>
        </div>
      </div>
  );
};
