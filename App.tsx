import React, { useState, useCallback } from 'react';
import { 
  Sparkles, Download, RefreshCw, AlertCircle, 
  Box, User, Shirt, Hand, Layers, ImageIcon, Smile, Crop, Megaphone, PenTool, Mic, Lightbulb, Camera, BookOpen, Video, Wand2, Bolt, Eye, ScanEye, ChevronRight, Menu, X, LayoutTemplate, Eraser
} from 'lucide-react';

import { BACKDROPS, OUTFITS, POSES, EXPRESSIONS, ASPECT_RATIOS, CAMERA_ANGLES } from './constants';
import { ProcessedImage, OptionItem } from './types';
import { generateCompositeImage } from './services/geminiService';
import { ImageUploader } from './components/ImageUploader';
import { AIImageGenerator } from './components/AIImageGenerator';
import { TextToSpeech } from './components/TextToSpeech';
import { PromptBuilder } from './components/PromptBuilder';
import { VirtualTryOn } from './components/VirtualTryOn';
import { SoraPromptGen } from './components/SoraPromptGen';
import { HookGenerator } from './components/HookGenerator';
import { VisionScanner } from './components/VisionScanner';
import { MarketingAI } from './components/MarketingAI';
import { KolContentGenerator } from './components/KolContentGenerator';
import { PhotoConcept } from './components/PhotoConcept';
import { AdCreator } from './components/AdCreator';
import { BackgroundRemover } from './components/BackgroundRemover';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'ai_image_generator' | 'text_to_speech' | 'prompt_builder' | 'sora_prompt_gen' | 'hook_generator' | 'vision_scanner' | 'marketing_ai' | 'kol_content' | 'photo_concept' | 'ad_creator' | 'bg_remover'>('studio');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [studioMode, setStudioMode] = useState<'composite' | 'try_on'>('composite');

  // --- Fashion Studio (Composite) State ---
  const [personImage, setPersonImage] = useState<ProcessedImage | null>(null);
  const [productImage, setProductImage] = useState<ProcessedImage | null>(null);
  const [customBackdropImage, setCustomBackdropImage] = useState<ProcessedImage | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  
  const [selectedOutfit, setSelectedOutfit] = useState<OptionItem>(OUTFITS[0]);
  const [selectedPose, setSelectedPose] = useState<OptionItem>(POSES[0]);
  const [selectedBackdrop, setSelectedBackdrop] = useState<OptionItem>(BACKDROPS[0]);
  const [selectedExpression, setSelectedExpression] = useState<OptionItem>(EXPRESSIONS[0]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<OptionItem>(ASPECT_RATIOS[0]);
  const [selectedCamera, setSelectedCamera] = useState<OptionItem>(CAMERA_ANGLES[0]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'person' | 'product' | 'bg') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      const processed = await processFile(file);
      if (type === 'person') setPersonImage(processed);
      else if (type === 'product') setProductImage(processed);
      else if (type === 'bg') setCustomBackdropImage(processed);
      setResultImage(null);
    } catch (err) {
      setError('Lỗi xử lý ảnh.');
    }
  };

  const handleGenerate = async () => {
    if (!personImage || !productImage) {
      setError('Vui lòng tải lên cả ảnh người mẫu và ảnh sản phẩm.');
      return;
    }
    setIsGenerating(true);
    setError('');
    setResultImage(null);
    setStatusMessage('Đang phân tích...');
    try {
      const result = await generateCompositeImage({
          personImage, productImage, customBackdrop: selectedBackdrop.id === 'custom_bg' ? customBackdropImage : null,
          outfit: selectedOutfit, pose: selectedPose, backdrop: selectedBackdrop, expression: selectedExpression,
          aspectRatio: selectedAspectRatio, camera: selectedCamera
      });
      setResultImage(result);
    } catch (err: any) {
      setError(err.message || 'Tạo ảnh thất bại.');
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  const menuItems = [
    { id: 'studio', label: 'Fashion Studio', icon: Shirt, desc: 'Ghép mặt & Thử đồ ảo' },
    { id: 'marketing_ai', label: 'Marketing AI', icon: Megaphone, desc: 'Tạo ảnh & Video Marketing' },
    { id: 'kol_content', label: 'KOL Content', icon: User, desc: 'Kịch bản KOL & Viral Post' },
    { id: 'photo_concept', label: 'Photo Concept', icon: Camera, desc: 'Concept & Remix Ảnh AI' },
    { id: 'ad_creator', label: 'Ad Creator', icon: LayoutTemplate, desc: 'Thiết kế Poster Quảng cáo' },
    { id: 'ai_image_generator', label: 'Tạo Ảnh AI', icon: ImageIcon, desc: 'Poster & Lifestyle' },
    { id: 'bg_remover', label: 'Tách Nền AI', icon: Eraser, desc: 'Xóa phông nền sản phẩm' },
    { id: 'hook_generator', label: 'Hook & Content', icon: Bolt, desc: 'Viral Script Creator' },
    { id: 'text_to_speech', label: 'Giọng Đọc AI', icon: Mic, desc: 'Chuyển văn bản thành tiếng' },
    { id: 'prompt_builder', label: 'Prompt Builder', icon: Lightbulb, desc: 'Kho lệnh AI chuyên sâu' },
    { id: 'sora_prompt_gen', label: 'Sora Video', icon: Video, desc: 'Kịch bản video Sora/Veo' },
    { id: 'vision_scanner', label: 'Vision Scan', icon: ScanEye, desc: 'Đọc dữ liệu từ hình ảnh' }
  ];

  return (
    <div className="h-screen font-body text-gray-800 flex overflow-hidden bg-slate-50">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 relative z-30 shadow-xl
        ${isSidebarOpen ? 'w-72' : 'w-20'}`}
      >
        <div className="h-20 flex items-center px-6 border-b border-slate-100 bg-gradient-to-r from-orange-600 to-amber-600">
           <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-white/20 p-2 rounded-xl shrink-0">
                <Sparkles className="text-white w-6 h-6" />
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col animate-in slide-in-from-left-2 duration-300">
                  <h1 className="text-white font-display font-black text-lg leading-tight uppercase tracking-tighter">SỨC MẠNH AI</h1>
                  <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">by Nam Le</span>
                </div>
              )}
           </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const ItemIcon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all group relative
                ${isActive 
                  ? 'bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-100' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
              >
                <div className={`p-2 rounded-xl transition-all
                  ${isActive ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-100 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600'}`}>
                  <ItemIcon size={20} />
                </div>
                {isSidebarOpen && (
                  <div className="flex flex-col items-start animate-in fade-in duration-300 overflow-hidden">
                    <span className="font-display font-bold text-sm whitespace-nowrap">{item.label}</span>
                    <span className="text-[10px] opacity-60 font-medium whitespace-nowrap">{item.desc}</span>
                  </div>
                )}
                {isActive && isSidebarOpen && <ChevronRight size={16} className="ml-auto text-orange-400" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full flex items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* --- MOBILE HEADER & MENU --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-[100] flex items-center justify-between px-4 shadow-sm">
         <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg shadow-sm">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="font-display font-black text-slate-800 text-sm uppercase tracking-tighter">SỨC MẠNH AI</h1>
         </div>
         <button 
           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
           className="p-2 bg-slate-100 rounded-lg text-slate-600 active:scale-90 transition-all"
         >
           {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
         </button>
      </div>

      {/* MOBILE MENU OVERLAY - Tối ưu hóa Z-Index và Blur */}
      <div className={`lg:hidden fixed inset-0 z-[90] bg-white transition-all duration-300 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <nav className="p-6 pt-24 space-y-3 h-full overflow-y-auto overscroll-contain">
              {menuItems.map((item) => {
                const ItemIcon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left active:scale-[0.98]
                    ${isActive ? 'bg-orange-500 text-white shadow-lg ring-4 ring-orange-100' : 'text-slate-600 bg-slate-50 border border-slate-100'}`}
                  >
                    <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                        <ItemIcon size={24} className={isActive ? 'text-white' : 'text-orange-500'} />
                    </div>
                    <div>
                        <div className="font-display font-bold text-base leading-none mb-1">{item.label}</div>
                        <div className={`text-[11px] font-medium leading-none ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{item.desc}</div>
                    </div>
                  </button>
                );
              })}
              <div className="mt-8 p-5 bg-orange-50 rounded-2xl border border-orange-100">
                  <p className="text-[10px] font-black text-orange-400 uppercase mb-1 tracking-widest">Hỗ trợ kỹ thuật (Zalo)</p>
                  <p className="text-base font-black text-orange-700">098.102.8794</p>
              </div>
           </nav>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 h-full pt-16 lg:pt-0">
        
        {/* Dynamic Page Header */}
        <header className="flex-none bg-white border-b border-slate-200 px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between z-20">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-xl text-orange-600 shadow-inner shrink-0">
                {(() => {
                  const activeItem = menuItems.find(m => m.id === activeTab);
                  const HeaderIcon = activeItem ? activeItem.icon : Sparkles;
                  return <HeaderIcon size={20} />;
                })()}
              </div>
              <div className="min-w-0">
                <h2 className="text-sm lg:text-lg font-display font-black text-slate-800 uppercase tracking-tight truncate">
                  {menuItems.find(m => m.id === activeTab)?.label}
                </h2>
                <p className="hidden md:block text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                  {menuItems.find(m => m.id === activeTab)?.desc}
                </p>
              </div>
           </div>

           <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-[10px]">N</div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Support: 098.102.8794</span>
           </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
            {activeTab === 'studio' && (
              <div className="flex flex-col h-full bg-white">
                  <div className="flex-none p-2 lg:p-3 border-b border-slate-100 bg-slate-50/50 flex justify-center">
                      <div className="bg-white p-1 rounded-xl lg:rounded-2xl border border-orange-200 shadow-sm flex gap-1 w-full max-w-sm lg:w-auto">
                          <button 
                              onClick={() => setStudioMode('composite')}
                              className={`flex-1 lg:flex-none px-4 lg:px-6 py-2 rounded-lg lg:rounded-xl text-[11px] lg:text-sm font-display font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${studioMode === 'composite' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                          >
                              <Layers size={14} className="shrink-0" /> <span className="truncate">Ghép Ảnh</span>
                          </button>
                          <button 
                              onClick={() => setStudioMode('try_on')}
                              className={`flex-1 lg:flex-none px-4 lg:px-6 py-2 rounded-lg lg:rounded-xl text-[11px] lg:text-sm font-display font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${studioMode === 'try_on' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                          >
                              <Wand2 size={14} className="shrink-0" /> <span className="truncate">Thử Đồ Ảo</span>
                          </button>
                      </div>
                  </div>

                  <div className="flex-1 min-h-0 lg:overflow-hidden relative overflow-y-auto overscroll-contain custom-scrollbar">
                    {studioMode === 'composite' ? (
                        <div className="lg:h-full h-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                            {/* COLUMN 1 */}
                            <div className="lg:col-span-3 p-4 flex flex-col gap-4 bg-slate-50/30">
                                <div className="space-y-4">
                                  <ImageUploader label="Ảnh Nhân vật" icon={<User size={14} className="text-orange-600" />} image={personImage} onUpload={(e) => handleFileUpload(e, 'person')} onRemove={() => setPersonImage(null)} colorClass="text-orange-600" bgColorClass="bg-orange-50" borderColorClass="border-orange-400" heightClass="h-44 lg:h-48" />
                                  <ImageUploader label="Ảnh Sản Phẩm" icon={<Box size={14} className="text-amber-600" />} image={productImage} onUpload={(e) => handleFileUpload(e, 'product')} onRemove={() => setProductImage(null)} colorClass="text-amber-600" bgColorClass="bg-amber-50" borderColorClass="border-amber-400" heightClass="h-44 lg:h-48" />
                                  {error && <div className="text-red-700 bg-red-50 p-3 rounded-xl border border-red-100 text-xs font-bold leading-tight">{error}</div>}
                                </div>
                            </div>

                            {/* COLUMN 2 */}
                            <div className="lg:col-span-5 p-4 lg:overflow-y-auto h-auto custom-scrollbar bg-white">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-1.5 font-display font-black text-slate-400 text-[9px] uppercase tracking-widest"><Shirt size={12}/> Trang phục</label>
                                            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl p-1 bg-slate-50/50">
                                                {OUTFITS.map((item) => (
                                                    <div key={item.id} onClick={() => setSelectedOutfit(item)} className={`p-2 rounded-lg cursor-pointer border text-[11px] transition-all ${selectedOutfit.id === item.id ? 'border-orange-500 bg-white text-orange-700 shadow-sm' : 'border-transparent text-slate-500 hover:bg-white'}`}>
                                                        <div className="font-bold">{item.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-1.5 font-display font-black text-slate-400 text-[9px] uppercase tracking-widest"><Smile size={12}/> Biểu cảm</label>
                                            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl p-1 bg-slate-50/50">
                                                {EXPRESSIONS.map((item) => (
                                                    <div key={item.id} onClick={() => setSelectedExpression(item)} className={`p-2 rounded-lg cursor-pointer border text-[11px] transition-all ${selectedExpression.id === item.id ? 'border-orange-500 bg-white text-orange-700 shadow-sm' : 'border-transparent text-slate-500 hover:bg-white'}`}>
                                                        <div className="font-bold">{item.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-1.5 font-display font-black text-slate-400 text-[9px] uppercase tracking-widest"><Layers size={12}/> Bối cảnh / Nền</label>
                                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl p-2 bg-slate-50/30">
                                            {BACKDROPS.map((item) => (
                                                <div key={item.id} onClick={() => setSelectedBackdrop(item)} className={`p-2 rounded-lg cursor-pointer border text-[10px] transition-all ${selectedBackdrop.id === item.id ? 'border-orange-500 bg-white text-orange-700 shadow-md ring-1 ring-orange-100' : 'border-transparent bg-white hover:bg-orange-50'}`}>
                                                    <div className="font-bold truncate">{item.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMN 3 */}
                            <div className="lg:col-span-4 p-4 flex flex-col gap-4 bg-slate-50/50 h-auto pb-10">
                                <button
                                  onClick={handleGenerate}
                                  disabled={!personImage || !productImage || isGenerating}
                                  className={`w-full py-4 rounded-xl text-sm font-display font-bold text-white shadow-xl transition-all transform flex-none ${(!personImage || !productImage) ? 'bg-slate-300' : isGenerating ? 'bg-slate-800' : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:shadow-orange-200 active:scale-95'}`}
                                >
                                  <div className="flex items-center justify-center gap-2">
                                  {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                  {isGenerating ? statusMessage || 'Đang xử lý...' : 'GHÉP ẢNH NGAY'}
                                  </div>
                              </button>
                              <div className="w-full bg-white rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden min-h-[300px] shadow-inner">
                                  {resultImage ? <img src={resultImage} alt="Kết Quả" className="max-w-full max-h-full object-contain p-4" /> : <div className="text-center p-8 opacity-20"><ImageIcon size={48} className="mx-auto mb-2" /><p className="text-xs font-bold uppercase tracking-widest">Thành phẩm AI</p></div>}
                                  {isGenerating && <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center animate-in fade-in"><div className="w-10 h-10 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin mb-4"></div><p className="text-orange-700 font-black text-xs uppercase animate-pulse">{statusMessage || 'AI đang tính toán...'}</p></div>}
                              </div>
                            </div>
                        </div>
                    ) : <VirtualTryOn />}
                  </div>
              </div>
            )}

            {activeTab === 'ai_image_generator' && <div className="h-full overflow-y-auto custom-scrollbar overscroll-contain"><AIImageGenerator /></div>}
            {activeTab === 'marketing_ai' && <div className="h-full overflow-y-auto custom-scrollbar overscroll-contain"><MarketingAI /></div>}
            {activeTab === 'kol_content' && <div className="h-full overflow-y-auto custom-scrollbar overscroll-contain"><KolContentGenerator /></div>}
            {activeTab === 'photo_concept' && <div className="h-full overflow-y-auto custom-scrollbar overscroll-contain"><PhotoConcept /></div>}
            {activeTab === 'ad_creator' && <div className="h-full overflow-y-auto custom-scrollbar overscroll-contain"><AdCreator /></div>}
            {activeTab === 'bg_remover' && <div className="h-full overflow-y-auto p-4 lg:p-8 custom-scrollbar overscroll-contain"><BackgroundRemover /></div>}
            {activeTab === 'hook_generator' && <div className="h-full overflow-y-auto custom-scrollbar overscroll-contain"><HookGenerator /></div>}
            {activeTab === 'text_to_speech' && <div className="h-full overflow-y-auto p-4 lg:p-8 custom-scrollbar overscroll-contain"><TextToSpeech /></div>}
            {activeTab === 'prompt_builder' && <div className="h-full overflow-y-auto custom-scrollbar overscroll-contain"><PromptBuilder /></div>}
            {activeTab === 'sora_prompt_gen' && <div className="h-full overflow-y-auto custom-scrollbar overscroll-contain"><SoraPromptGen /></div>}
            {activeTab === 'vision_scanner' && <div className="h-full overflow-y-auto p-4 custom-scrollbar overscroll-contain"><VisionScanner /></div>}
        </div>
      </main>
    </div>
  );
};

export default App;