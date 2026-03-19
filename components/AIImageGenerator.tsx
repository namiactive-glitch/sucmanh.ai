import React, { useState } from 'react';
import { Sparkles, Box, Upload, Download, RefreshCw, AlertCircle, Megaphone, Palette, Type, User, Video, Copy, Camera, Layout, Crop, Lightbulb, MousePointer2, Eye, MoveUpRight, Layers, CalendarDays, Loader2, ShieldCheck, CheckCircle2, Image as ImageIcon, X } from 'lucide-react';
import { ProcessedImage, OptionItem } from '../types';
import { generateAdImage, generateMarketingImage, generateVideoPrompt } from '../services/geminiService';
import { ImageUploader } from './ImageUploader';
import { ASPECT_RATIOS, BACKDROPS } from '../constants';
import { PhotoConcept } from './PhotoConcept';

const POSTER_PHOTO_STYLES = [
  { id: 'standard', name: 'Mặc định (Chuẩn)', prompt: 'Standard high-end commercial product shot.' },
  { id: 'pov_hands', name: 'POV (Tay cầm)', prompt: 'Hyper-realistic first-person perspective. Human hands holding the product.' },
  { id: 'side_angle', name: 'Góc nghiêng (3/4)', prompt: 'Professional 3/4 side angle shot.' },
  { id: 'front_view', name: 'Trực diện (Frontal)', prompt: 'Symmetrical frontal shot.' },
  { id: 'floating', name: 'Bay lơ lửng (Levitation)', prompt: 'Artistic levitation shot.' },
  { id: 'macro', name: 'Siêu cận (Macro)', prompt: 'Extreme close-up macro photography.' },
  { id: 'top_down', name: 'Trên xuống (Flatlay)', prompt: 'Flatlay composition from above.' }
];

const VN_HOLIDAYS = [
  { id: 'none', name: 'Cơ bản', icon: '📷', prompt: '' },
  { id: 'tet', name: 'Tết Nguyên Đán', icon: '🏮', prompt: 'Vietnamese Lunar New Year theme.' },
  { id: 'trung_thu', name: 'Trung Thu', icon: '🥮', prompt: 'Mid-Autumn festival theme.' },
  { id: 'phu_nu', name: 'Phụ Nữ 8/3', icon: '💐', prompt: 'Women\'s Day theme.' },
  { id: 'valentine', name: 'Lễ Tình Nhân', icon: '💘', prompt: 'Valentine\'s day theme.' },
  { id: 'christmas', name: 'Giáng Sinh', icon: '🎄', prompt: 'Christmas theme.' },
];

export const AIImageGenerator: React.FC = () => {
  const [mode, setMode] = useState<'poster' | 'marketing' | 'concept'>('poster');
  
  const [productImage, setProductImage] = useState<ProcessedImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(ASPECT_RATIOS[0].id);

  const [logoImage, setLogoImage] = useState<ProcessedImage | null>(null);
  const [adPrompt, setAdPrompt] = useState('Ảnh quảng cáo sản phẩm, phong cách hiện đại');
  const [selectedPhotoStyle, setSelectedPhotoStyle] = useState(POSTER_PHOTO_STYLES[0].id);
  const [selectedHoliday, setSelectedHoliday] = useState('none');
  const [selectedBackdrop, setSelectedBackdrop] = useState<OptionItem>(BACKDROPS[0]);
  const [posterResult, setPosterResult] = useState<string | null>(null);

  const [faceImage, setFaceImage] = useState<ProcessedImage | null>(null);
  const [productName, setProductName] = useState('');
  const [marketingFeedback, setMarketingFeedback] = useState('');
  const [marketingResult, setMarketingResult] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<ProcessedImage | null>>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width; canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL(file.type);
            setter({ preview: dataUrl, base64: dataUrl.split(',')[1], mimeType: file.type });
          }
        };
      };
    } catch (err) { setError('Lỗi xử lý ảnh.'); }
  };

  const handleGenerate = async () => {
    if (!productImage) { setError('Vui lòng tải lên ảnh sản phẩm.'); return; }
    setIsLoading(true); setError(null);
    try {
        const holidayObj = VN_HOLIDAYS.find(h => h.id === selectedHoliday);
        const styleObj = POSTER_PHOTO_STYLES.find(s => s.id === selectedPhotoStyle);
        const backdropPrompt = selectedBackdrop.id !== 'original_bg' ? selectedBackdrop.prompt : '';
        const combinedContext = `${backdropPrompt} ${holidayObj?.prompt || ''} ${styleObj?.prompt || ''}`.trim();

        if (mode === 'poster') {
            setPosterResult(null);
            const result = await generateAdImage(productImage, logoImage, `${adPrompt}. ${combinedContext}`, selectedAspectRatio);
            setPosterResult(result);
        } else {
            if (!productName) throw new Error('Vui lòng nhập tên sản phẩm.');
            setMarketingResult(null);
            const result = await generateMarketingImage(productImage, faceImage, productName, `${marketingFeedback}. ${combinedContext}`, selectedAspectRatio);
            setMarketingResult(result);
        }
    } catch (err: any) { setError(`Lỗi AI: ${err.message}`); } finally { setIsLoading(false); }
  };

  const downloadImage = (url: string | null) => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `ket-qua-ai.png`;
      link.click();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="flex-none p-2 lg:p-3 bg-orange-50/50 border-b border-orange-100 flex justify-center">
          <div className="bg-white p-1 rounded-xl lg:rounded-2xl border border-orange-200 shadow-sm flex gap-1 w-full max-w-sm lg:w-auto">
              <button onClick={()=>setMode('poster')} className={`flex-1 lg:flex-none px-3 lg:px-5 py-2 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-bold flex items-center justify-center gap-1 lg:gap-2 transition-all ${mode==='poster'?'bg-orange-500 text-white shadow-md':'text-gray-500 hover:bg-orange-50'}`}><Megaphone size={14}/> Poster</button>
              <button onClick={()=>setMode('marketing')} className={`flex-1 lg:flex-none px-3 lg:px-5 py-2 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-bold flex items-center justify-center gap-1 lg:gap-2 transition-all ${mode==='marketing'?'bg-orange-500 text-white shadow-md':'text-gray-500 hover:bg-orange-50'}`}><Camera size={14}/> Lifestyle</button>
              <button onClick={()=>setMode('concept')} className={`flex-1 lg:flex-none px-3 lg:px-5 py-2 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-bold flex items-center justify-center gap-1 lg:gap-2 transition-all ${mode==='concept'?'bg-orange-500 text-white shadow-md':'text-gray-500 hover:bg-orange-50'}`}><Lightbulb size={14}/> Concept</button>
          </div>
      </div>

      {mode === 'concept' ? <PhotoConcept /> : (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 lg:divide-x divide-slate-200 lg:overflow-hidden overflow-y-auto overscroll-contain custom-scrollbar">
          <div className="lg:col-span-3 p-4 bg-slate-50/50 space-y-4 h-auto lg:overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-1"><span className="bg-orange-100 text-orange-700 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">1</span><h3 className="font-black text-slate-500 text-[10px] uppercase tracking-widest">Nguồn Dữ Liệu</h3></div>
              
              <ImageUploader label="Ảnh Sản Phẩm (Bắt buộc)" icon={<Box size={14}/>} image={productImage} onUpload={(e)=>handleFileUpload(e, setProductImage)} onRemove={()=>setProductImage(null)} colorClass="text-orange-600" bgColorClass="bg-orange-50" borderColorClass="border-orange-400" heightClass="h-40 lg:h-44"/>
              
              <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex items-start gap-2 shadow-sm">
                <ShieldCheck size={16} className="text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-black text-green-800 uppercase tracking-tighter">AI CAM KẾT:</p>
                  <p className="text-[9px] font-bold text-green-700 leading-tight">Bảo toàn 100% diện mạo khuôn mặt & sản phẩm. Độ nét 8K.</p>
                </div>
              </div>

              {mode==='poster' ? <ImageUploader label="Logo (Tùy chọn)" icon={<Upload size={14}/>} image={logoImage} onUpload={(e)=>handleFileUpload(e,setLogoImage)} onRemove={()=>setLogoImage(null)} colorClass="text-amber-600" bgColorClass="bg-amber-50" borderColorClass="border-amber-400" heightClass="h-32"/> : <ImageUploader label="Mặt Mẫu (Tùy chọn)" icon={<User size={14}/>} image={faceImage} onUpload={(e)=>handleFileUpload(e,setFaceImage)} onRemove={()=>setFaceImage(null)} colorClass="text-amber-600" bgColorClass="bg-amber-50" borderColorClass="border-amber-400" heightClass="h-32"/>}
          </div>

          <div className="lg:col-span-5 p-4 bg-white space-y-6 h-auto lg:overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-4"><span className="bg-orange-100 text-orange-700 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">2</span><h3 className="font-black text-slate-500 text-[10px] uppercase tracking-widest">Thiết Lập Bối Cảnh</h3></div>
              
              <div className="space-y-6">
                  {/* Bối cảnh chọn nhanh */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><Layers size={14}/> Lựa chọn bối cảnh chủ đề</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                      {BACKDROPS.filter(b => b.id !== 'custom_bg').map(b => (
                        <button 
                          key={b.id} 
                          onClick={() => setSelectedBackdrop(b)}
                          className={`p-2.5 rounded-xl border text-[10px] font-bold text-left transition-all leading-tight flex flex-col gap-1 ${selectedBackdrop.id === b.id ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-orange-200'}`}
                        >
                          <span className="truncate">{b.label}</span>
                          <span className="text-[8px] font-normal text-slate-400 line-clamp-1 italic">{b.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400">Khung hình</label>
                        <select value={selectedAspectRatio} onChange={(e)=>setSelectedAspectRatio(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold outline-none">
                            {ASPECT_RATIOS.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400">Góc Studio</label>
                        <select value={selectedPhotoStyle} onChange={(e)=>setSelectedPhotoStyle(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold outline-none">
                            {POSTER_PHOTO_STYLES.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                  </div>

                  {mode === 'poster' ? (
                      <div className="space-y-4">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <label className="text-[10px] font-black uppercase text-orange-500 mb-3 block">Chủ đề lễ hội Việt Nam</label>
                            <div className="grid grid-cols-3 gap-2">
                                {VN_HOLIDAYS.map(h=><button key={h.id} onClick={()=>setSelectedHoliday(h.id)} className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${selectedHoliday===h.id?'border-orange-500 bg-white text-orange-700 shadow-sm':'border-transparent bg-white/50 text-slate-400'}`}><span className="text-sm">{h.icon}</span><span className="text-[9px] font-bold text-center">{h.name}</span></button>)}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400">Yêu cầu bối cảnh cụ thể</label>
                            <textarea rows={3} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium bg-slate-50 outline-none focus:ring-2 focus:ring-orange-100" placeholder="Mô tả thêm phong cách (vd: luxury, neon, nature)..." value={adPrompt} onChange={(e)=>setAdPrompt(e.target.value)} />
                          </div>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400">Tên sản phẩm *</label>
                            <input type="text" className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold bg-slate-50 outline-none" placeholder="VD: Nước hoa, Mỹ phẩm..." value={productName} onChange={e=>setProductName(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400">Mô tả Lifestyle / Video</label>
                            <textarea rows={4} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium bg-slate-50 outline-none" placeholder="VD: Để trên bàn gỗ nắng sớm, có người mẫu cầm..." value={marketingFeedback} onChange={e=>setMarketingFeedback(e.target.value)} />
                          </div>
                      </div>
                  )}
              </div>
          </div>

          <div className="lg:col-span-4 p-4 bg-slate-100/50 flex flex-col gap-4 h-auto lg:overflow-y-auto custom-scrollbar pb-10">
              <button onClick={handleGenerate} disabled={isLoading || !productImage} className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${isLoading?'bg-slate-400':'bg-gradient-to-r from-orange-600 to-amber-600 hover:shadow-orange-300'}`}>
                {isLoading ? <RefreshCw className="animate-spin" size={20}/> : <Sparkles size={20}/>} {isLoading?'AI ĐANG PHỐI CẢNH...':'TẠO ẢNH NGAY'}
              </button>

              <div className="flex-1 bg-white rounded-[1.5rem] lg:rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shadow-inner relative min-h-[350px] lg:min-h-[400px]">
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center px-6 text-center">
                    <Loader2 className="animate-spin text-orange-500 mb-3" size={40}/>
                    <p className="text-[11px] font-black uppercase text-orange-600 mb-1">AI đang xử lý...</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Bảo toàn 100% chi tiết gương mặt & bối cảnh 8K</p>
                  </div>
                )}
                {(mode==='poster'?posterResult:marketingResult) ? (
                  <div className="w-full h-full relative group">
                    <img src={(mode==='poster'?posterResult:marketingResult)!} alt="AI Result" className="w-full h-full object-contain p-2" />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-white text-[9px] font-black uppercase">
                       <CheckCircle2 size={14} className="text-green-400"/> Face & Product 8K
                    </div>
                    <button onClick={()=>downloadImage(mode==='poster'?posterResult:marketingResult)} className="absolute bottom-4 right-4 p-4 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-500 transition-colors"><Download size={24}/></button>
                  </div>
                ) : (
                    <div className="text-center opacity-20 px-8">
                        <ImageIcon size={64} className="mx-auto mb-3 text-slate-400"/>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thành phẩm AI</p>
                    </div>
                )}
              </div>
          </div>
        </div>
      )}
    </div>
  );
};