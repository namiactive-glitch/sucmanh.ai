
import React, { useState } from 'react';
import { Sparkles, Bolt, Mic, Image as ImageIcon, Copy, RefreshCw, Wand2, Palette, Check, MessageSquare, Star, PenTool, X, ShieldCheck, Layers, Video, ChevronRight, BookOpen } from 'lucide-react';
import { generateAIHooks, AIHookResult } from '../services/geminiService';
import { ContentGenerator } from './ContentGenerator';
import { KolContentGenerator } from './KolContentGenerator';
import { ContentGeniusAI } from './ContentGeniusAI';

export const HookGenerator: React.FC = () => {
  const [subTab, setSubTab] = useState<'hook' | 'content' | 'kol' | 'ad_copy'>('hook');
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [hooks, setHooks] = useState<AIHookResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showToast, setShowToast] = useState(false);

  const localHooksLibrary: Record<string, string[]> = {
    top: [
      "Top 3 lý do bạn nên sở hữu [Product] ngay hôm nay!",
      "5 bí kíp dùng [Product] giúp bạn thay đổi hoàn toàn.",
      "Top 1 sản phẩm [Product] bán chạy nhất năm qua.",
      "Duy nhất 1 cách để giải quyết vấn đề chính là em [Product] này.",
      "7 sai lầm thường gặp nếu bạn chưa dùng [Product]."
    ],
    secret: [
      "Bí mật nhà nghề: Tại sao [Product] lại hiệu quả đến vậy?",
      "Điều mà shop không muốn bạn biết về em [Product] này.",
      "Sự thật trần trụi đằng sau cơn sốt [Product] hiện nay.",
      "Tiết lộ bí mật giúp bạn tối ưu hiệu quả với [Product].",
      "Góc khuất của [Product]: Sự thật ít ai ngờ tới."
    ],
    curiosity: [
      "Sự thật về [Product] ít người biết...", 
      "Cân nhắc kỹ trước khi mua [Product]!", 
      "Bất ngờ khi biết đến [Product] sớm...",
      "Bí mật đằng sau sức hút của [Product] là gì?",
      "Đừng bao giờ dùng [Product] nếu bạn chưa biết điều này."
    ],
    pain: [
      "Cách giải quyết vấn đề nan giải với [Product].", 
      "Nếu đang gặp khó khăn, [Product] là gợi ý số 1.", 
      "Lý do nên tham khảo [Product] ngay lập tức.",
      "Thoát khỏi nỗi ám ảnh mỗi khi vắng em [Product].",
      "Sai lầm tai hại khiến bạn luôn mệt mỏi mà không dùng [Product]."
    ],
    trend: [
      "Thấy mọi người nhắc [Product] nhiều quá...", 
      "Đập hộp em [Product] đang cực hot trên tóp tóp.", 
      "Thử [Product] xem có như lời đồn không nha?",
      "Review em [Product] quốc dân đang làm mưa làm gió.",
      "Thử thách 7 ngày dùng [Product] và cái kết bất ngờ."
    ]
  };

  const handleGenerate = async (isAI: boolean) => {
    if (!productName.trim()) return;
    setIsGenerating(true);
    setHooks([]);
    
    if (isAI) {
      try {
        const result = await generateAIHooks(productName, productDesc);
        setHooks(result);
      } catch (e) {
        alert("AI đang bận, đang tải mẫu có sẵn.");
        handleGenerate(false);
      } finally {
        setIsGenerating(false);
      }
    } else {
      const p = productName;
      const all: AIHookResult[] = [];
      Object.keys(localHooksLibrary).forEach(cat => {
        localHooksLibrary[cat].forEach(h => {
          all.push({ category: cat, hook: h.replace(/\[Product\]/g, p) });
        });
      });
      setHooks(all.sort(() => 0.5 - Math.random()));
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowToast(true); setTimeout(() => setShowToast(false), 2000);
  };

  const categoryLabels: Record<string, string> = {
    all: 'Tất cả',
    top: 'Dạng TOP',
    secret: 'Bí mật',
    curiosity: 'Gây tò mò',
    pain: 'Nỗi đau',
    trend: 'Bắt trend',
    comparison: 'So sánh',
    feedback: 'Phản hồi',
    knowledge: 'Kiến thức'
  };

  const filteredHooks = categoryFilter === 'all' ? hooks : hooks.filter(h => h.category.toLowerCase().includes(categoryFilter.toLowerCase()));

  const renderHookTab = () => (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-6 space-y-5">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-black flex items-center gap-2 text-slate-800 uppercase tracking-tight">
                    <Bolt className="text-yellow-500 fill-current" /> 
                    Tạo Tiêu Đề (Hook) Viral
                </h2>
                <span className="text-[10px] bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-black uppercase border border-orange-200">Chuẩn Policy 2026</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sản Phẩm</label>
                    <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Tên sản phẩm..." className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-50 focus:border-orange-400 outline-none text-sm font-bold transition-all" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả / Lợi ích</label>
                    <input type="text" value={productDesc} onChange={(e) => setProductDesc(e.target.value)} placeholder="VD: Trắng da, bền bỉ, tiết kiệm..." className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-50 focus:border-orange-400 outline-none text-sm font-medium transition-all" />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => handleGenerate(false)} className="flex-1 px-6 py-4 bg-white border-2 border-orange-500 text-orange-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-all active:scale-95 shadow-sm">Dùng Mẫu Có Sẵn</button>
                <button onClick={() => handleGenerate(true)} disabled={isGenerating || !productName} className="flex-[2] px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-100 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles size={18}/>} Hỏi AI Viết Hook Mới
                </button>
            </div>
        </div>

        {hooks.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {Object.entries(categoryLabels).map(([id, label]) => (
                        <button key={id} onClick={() => setCategoryFilter(id)} className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap border transition-all ${categoryFilter === id ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-orange-300'}`}>{label}</button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredHooks.map((h, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-orange-400 transition-all hover:shadow-xl group relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-100 group-hover:bg-orange-500 transition-colors"></div>
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[9px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-100 uppercase tracking-tighter">
                                        {categoryLabels[h.category] || h.category}
                                    </span>
                                    <span className="text-slate-300 font-mono text-[10px]">#0{i+1}</span>
                                </div>
                                <p className="font-bold text-slate-800 leading-tight text-sm mb-4 cursor-pointer hover:text-orange-600 transition-colors" onClick={() => copyToClipboard(h.hook)}>
                                    "{h.hook}"
                                </p>
                            </div>
                            <div className="flex justify-end border-t border-slate-50 pt-3 gap-2">
                                <button onClick={() => copyToClipboard(h.hook)} className="p-2 text-slate-400 hover:text-orange-600 bg-slate-50 rounded-lg transition-colors"><Copy size={14}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
        <div className="flex-none p-2 lg:p-3 bg-orange-50/50 border-b border-orange-100 flex justify-center">
            <div className="bg-white p-1 rounded-2xl border border-orange-200 shadow-sm flex gap-1 overflow-x-auto no-scrollbar w-full max-w-2xl">
                <button onClick={() => setSubTab('hook')} className={`flex-1 lg:flex-none px-4 py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap transition-all ${subTab === 'hook' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}><Bolt size={14} /> Tiêu đề Hook</button>
                <button onClick={() => setSubTab('content')} className={`flex-1 lg:flex-none px-4 py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap transition-all ${subTab === 'content' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}><MessageSquare size={14} /> Seeding</button>
                <button onClick={() => setSubTab('kol')} className={`flex-1 lg:flex-none px-4 py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap transition-all ${subTab === 'kol' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400'}`}><Star size={14} /> KOL Viral</button>
                <button onClick={() => setSubTab('ad_copy')} className={`flex-1 lg:flex-none px-4 py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap transition-all ${subTab === 'ad_copy' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}><PenTool size={14} /> Content Ads</button>
            </div>
        </div>
        <div className="flex-1 min-h-0 relative overflow-y-auto overscroll-contain custom-scrollbar">
            {subTab === 'hook' ? renderHookTab() : subTab === 'content' ? <ContentGenerator /> : subTab === 'kol' ? <KolContentGenerator /> : <ContentGeniusAI />}
        </div>
        {showToast && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-2 rounded-full text-xs font-bold shadow-2xl z-50 flex items-center gap-2 animate-in slide-in-from-bottom-2"><Check size={14} className="text-green-400"/> Đã sao chép vào bộ nhớ tạm!</div>}
    </div>
  );
};
