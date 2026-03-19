
import React, { useState, useRef } from 'react';
import { Camera, Sparkles, Palette, Lightbulb, Copy, Image as ImageIcon, Wand2, Layers, Aperture, Square, Smartphone, Monitor, LayoutTemplate, MessageSquare, Check, Loader2, Upload, RefreshCw, Download, Video, ShieldCheck } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export const PhotoConcept: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'concept' | 'remix'>('concept');
  
  // State chung
  const [productName, setProductName] = useState('');
  const [style, setStyle] = useState('cute');
  const [occasion, setOccasion] = useState('none');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State cho Tab 1: Concept Text
  const [productColor, setProductColor] = useState('');
  const [suggestingColor, setSuggestingColor] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isCaptionCopied, setIsCaptionCopied] = useState(false);
  const [isPromptCopied, setIsPromptCopied] = useState(false);

  // State cho Tab 2: Remix Image
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [remixCaption, setRemixCaption] = useState('');
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [soraPrompt, setSoraPrompt] = useState('');
  const [generatingSora, setGeneratingSora] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stylesList = [
    { id: 'cute', name: 'Cute & Đáng yêu', icon: '🐰', color: 'from-orange-300 to-amber-300' },
    { id: 'minimalist', name: 'Tối giản (Minimalist)', icon: '🌿', color: 'from-gray-300 to-slate-400' },
    { id: 'luxury', name: 'Sang trọng (Luxury)', icon: '💎', color: 'from-amber-400 to-yellow-600' },
    { id: 'vintage', name: 'Hoài cổ (Vintage)', icon: '🎞️', color: 'from-orange-700 to-amber-800' },
    { id: 'futuristic', name: 'Tương lai (Cyberpunk)', icon: '🚀', color: 'from-blue-400 to-cyan-600' },
    { id: 'natural', name: 'Thiên nhiên (Organic)', icon: '🍃', color: 'from-green-400 to-emerald-600' },
  ];

  const occasions = [
    { id: 'none', name: 'Cơ bản (Không)', icon: '📷' },
    { id: 'tet', name: 'Tết Nguyên Đán', icon: '🏮' },
    { id: 'valentine', name: 'Lễ Tình Nhân', icon: '💘' },
    { id: 'mid_autumn', name: 'Trung Thu', icon: '🥮' },
    { id: 'christmas', name: 'Noel (Giáng sinh)', icon: '🎄' },
    { id: 'auto', name: 'AI Tự Sáng Tạo', icon: '✨' },
  ];

  const aspectRatios = [
    { id: '1:1', name: 'Vuông (Instagram)', icon: <Square size={18} />, desc: '1:1' },
    { id: '9:16', name: 'TikTok / Story', icon: <Smartphone size={18} />, desc: '9:16' },
    { id: '4:5', name: 'Chân dung (Portrait)', icon: <LayoutTemplate size={18} />, desc: '4:5' },
    { id: '16:9', name: 'Ngang (Youtube)', icon: <Monitor size={18} />, desc: '16:9' },
  ];

  // --- Logic Tab 1: Generate Concept Text ---
  const suggestColorAI = async () => {
    setSuggestingColor(true);
    const selectedStyle = stylesList.find(s => s.id === style) || stylesList[0];
    const selectedOccasion = occasions.find(o => o.id === occasion) || occasions[0];
    const prompt = `Gợi ý ngắn gọn 1 phối màu (màu chủ đạo và màu phụ) phù hợp nhất cho sản phẩm "${productName || 'sản phẩm chung'}" theo phong cách "${selectedStyle.name}" và dịp "${selectedOccasion.name}". Chỉ trả về tên màu hoặc mã màu bằng tiếng Việt.`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        // Use gemini-3-flash-preview for text tasks
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setProductColor(response.text?.trim() || "Cam pastel, Trắng kem");
    } catch (err) { 
        console.error(err);
        setProductColor("Cam đất, Be");
    } finally { setSuggestingColor(false); }
  };

  const generateConcept = async () => {
    if (!productName) { setError('Vui lòng nhập tên sản phẩm!'); return; }
    setError(''); setLoading(true); setResult(null); setIsCaptionCopied(false); setIsPromptCopied(false);
    
    const selectedStyle = stylesList.find(s => s.id === style) || stylesList[0];
    const selectedOccasion = occasions.find(o => o.id === occasion) || occasions[0];
    
    let occasionInstruction = "";
    if (selectedOccasion.id === 'auto') occasionInstruction = "Tự sáng tạo bối cảnh lễ hội phù hợp nhất.";
    else if (selectedOccasion.id !== 'none') occasionInstruction = `Bối cảnh chủ đạo: ${selectedOccasion.name}.`;

    const systemPrompt = `Bạn là Creative Art Director. Tạo concept chụp ảnh và caption TikTok. 
    OUTPUT JSON FORMAT ONLY: 
    { 
        "conceptName": "Tên concept ấn tượng", 
        "visualDescription": "Mô tả ngắn gọn moodboard", 
        "background": "Mô tả chi tiết nền", 
        "props": ["đạo cụ 1", "đạo cụ 2"], 
        "lighting": "Cách đánh sáng", 
        "colorPalette": ["Màu 1", "Màu 2"], 
        "aiPrompt": "Prompt tiếng Anh để tạo ảnh (Midjourney/Flux)", 
        "tiktokCaption": "Caption TikTok vui nhộn, bắt trend", 
        "hashtags": "#hashtag1 #hashtag2" 
    }`;
    
    const userPrompt = `Sản phẩm: "${productName}", Màu: "${productColor}", Phong cách: "${selectedStyle.name}", Tỉ lệ: ${aspectRatio}. ${occasionInstruction}`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        // Use gemini-3-flash-preview for text tasks
        model: 'gemini-3-flash-preview',
        contents: userPrompt,
        config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json"
        }
      });
      
      const jsonText = response.text || "{}";
      setResult(JSON.parse(jsonText));
    } catch (err) { 
        console.error(err);
        setError('Lỗi kết nối AI. Vui lòng thử lại.'); 
    } finally { setLoading(false); }
  };
// Logic for remixing images...
  const handleGenerateRemixCaption = async () => {
    setGeneratingCaption(true);
    const selectedStyle = stylesList.find(s => s.id === style) || stylesList[0];
    const selectedOccasion = occasions.find(o => o.id === occasion) || occasions[0];
    
    const prompt = `
    Đóng vai chuyên gia Content Creator trên TikTok.
    Viết 1 caption viral, hấp dẫn cho bức ảnh sản phẩm vừa được tạo.
    Phong cách ảnh: ${selectedStyle.name}, Dịp: ${selectedOccasion.name}
    Yêu cầu: Ngắn gọn, giọng văn bắt trend, có CTA và 3-5 hashtag. Chỉ trả về nội dung caption.
    `;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            // Use gemini-3-flash-preview for text tasks
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        setRemixCaption(response.text?.trim() || "Sản phẩm cực chill cho ngày mới năng động! 🌿✨ #viral #xuhuong #sanphammoi");
    } catch (e) {
        setRemixCaption("Ảnh đẹp quá nè cả nhà ơi! Chốt đơn ngay thôi 💖 #shopping #dealhot");
    } finally {
        setGeneratingCaption(false);
    }
  };

  const handleGenerateSoraPrompt = async () => {
    setGeneratingSora(true);
    const selectedStyle = stylesList.find(s => s.id === style) || stylesList[0];
    const selectedOccasion = occasions.find(o => o.id === occasion) || occasions[0];

    const prompt = `
    Viết Prompt tạo video ngắn (Sora/Veo) cho sản phẩm này.
    Style ${selectedStyle.name}, Bối cảnh ${selectedOccasion.name}.
    Yêu cầu: Cận cảnh (Macro), chuyển động chậm (Slow-mo), nhạc nền Lofi/ASMR.
    Output: Duy nhất 1 đoạn văn mô tả cả hình ảnh và âm thanh.
    `;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            // Use gemini-3-flash-preview for text tasks
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        setSoraPrompt(response.text?.trim() || "Video slow-motion cận cảnh sản phẩm, ánh sáng lung linh huyền ảo. Nhạc nền Lofi chill, tiếng ASMR nhẹ nhàng thư giãn.");
    } catch (e) {
        setSoraPrompt("Lỗi tạo prompt video. Vui lòng thử lại.");
    } finally {
        setGeneratingSora(false);
    }
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateRemix = async () => {
    if (!uploadedImage) return;
    setLoading(true);
    setGeneratedImage(null);
    setRemixCaption('');
    setSoraPrompt('');

    const selectedStyle = stylesList.find(s => s.id === style) || stylesList[0];
    const selectedOccasion = occasions.find(o => o.id === occasion) || occasions[0];

    const prompt = `Hãy tạo một phiên bản nghệ thuật của sản phẩm trong ảnh này theo phong cách ${selectedStyle.name} và bối cảnh ${selectedOccasion.name}. Tỉ lệ khung hình ${aspectRatio}.`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: uploadedImage.split(',')[1], mimeType: 'image/png' } },
            { text: prompt }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any
          }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tạo ảnh remix. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2.5rem] shadow-xl border border-orange-100">
        <div className="flex items-center gap-5">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-4 rounded-3xl shadow-lg shadow-orange-200">
            <Camera className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black text-slate-800 uppercase tracking-tight">Photo Concept & Remix AI</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Sáng tạo concept chụp ảnh & Remix hình ảnh chuyên nghiệp</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('concept')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'concept' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Lightbulb size={14} /> Concept Text
          </button>
          <button 
            onClick={() => setActiveTab('remix')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'remix' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <RefreshCw size={14} /> Remix Image
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-lg border border-slate-100 p-6 space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Palette size={14} /> Cấu hình sáng tạo
            </h3>

            {activeTab === 'concept' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tên Sản Phẩm</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="VD: Son môi, Giày thể thao..." 
                      className="w-full pl-4 pr-10 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-50 focus:border-orange-400 outline-none text-sm font-bold transition-all" 
                    />
                    <Aperture className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Màu sắc sản phẩm</label>
                    <button 
                      onClick={suggestColorAI}
                      disabled={suggestingColor || !productName}
                      className="text-[10px] font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 disabled:opacity-30"
                    >
                      {suggestingColor ? <RefreshCw size={10} className="animate-spin" /> : <Wand2 size={10} />} Gợi ý màu
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={productColor}
                    onChange={(e) => setProductColor(e.target.value)}
                    placeholder="VD: Đỏ nhung, Trắng kem..." 
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-50 focus:border-orange-400 outline-none text-sm font-medium transition-all" 
                  />
                </div>
              </div>
            )}

            {activeTab === 'remix' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ảnh Gốc</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all overflow-hidden relative group"
                  >
                    {uploadedImage ? (
                      <>
                        <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="text-white" size={24} />
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="text-slate-300 mb-2" size={32} />
                        <p className="text-[10px] font-black text-slate-400 uppercase">Tải ảnh lên</p>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phong cách (Style)</label>
              <div className="grid grid-cols-2 gap-2">
                {stylesList.map((s) => (
                  <button 
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${style === s.id ? 'border-orange-500 bg-orange-50' : 'border-slate-50 hover:border-orange-200'}`}
                  >
                    <div className="text-lg mb-1">{s.icon}</div>
                    <div className="text-[10px] font-black uppercase leading-tight text-slate-700">{s.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dịp lễ / Bối cảnh</label>
              <div className="grid grid-cols-2 gap-2">
                {occasions.map((o) => (
                  <button 
                    key={o.id}
                    onClick={() => setOccasion(o.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${occasion === o.id ? 'border-orange-500 bg-orange-50' : 'border-slate-50 hover:border-orange-200'}`}
                  >
                    <div className="text-lg mb-1">{o.icon}</div>
                    <div className="text-[10px] font-black uppercase leading-tight text-slate-700">{o.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tỉ lệ khung hình</label>
              <div className="grid grid-cols-2 gap-2">
                {aspectRatios.map((ar) => (
                  <button 
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${aspectRatio === ar.id ? 'border-orange-500 bg-orange-50' : 'border-slate-50 hover:border-orange-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-orange-500">{ar.icon}</span>
                      <span className="text-[10px] font-black uppercase text-slate-700">{ar.desc}</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium leading-tight">{ar.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={activeTab === 'concept' ? generateConcept : handleGenerateRemix}
              disabled={loading || (activeTab === 'concept' && !productName) || (activeTab === 'remix' && !uploadedImage)}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-100 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {loading ? 'Đang sáng tạo...' : activeTab === 'concept' ? 'Tạo Concept' : 'Remix Ảnh AI'}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'concept' ? (
            <div className="space-y-6">
              {result ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                  {/* Concept Details */}
                  <div className="md:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-500 p-2 rounded-xl">
                          <Lightbulb size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black uppercase tracking-tight">{result.conceptName}</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Chi tiết Concept Chụp Ảnh</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={14} /> Thị giác (Visual)
                          </h4>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed">{result.visualDescription}</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                            <Layers size={14} /> Bối cảnh (Background)
                          </h4>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed">{result.background}</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                            <Palette size={14} /> Bảng màu (Palette)
                          </h4>
                          <div className="flex gap-2">
                            {result.colorPalette?.map((c: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-600 border border-slate-200">{c}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                            <Wand2 size={14} /> Đạo cụ (Props)
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {result.props?.map((p: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-orange-50 rounded-full text-[10px] font-bold text-orange-700 border border-orange-100">{p}</span>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                            <Aperture size={14} /> Ánh sáng (Lighting)
                          </h4>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed">{result.lighting}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Prompt Card */}
                  <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={14} className="text-orange-500" /> Prompt Tạo Ảnh AI
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(result.aiPrompt);
                          setIsPromptCopied(true);
                          setTimeout(() => setIsPromptCopied(false), 2000);
                        }}
                        className={`p-2 rounded-xl transition-all ${isPromptCopied ? 'bg-green-500 text-white' : 'bg-white text-slate-400 hover:text-orange-600 border border-slate-200'}`}
                      >
                        {isPromptCopied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="p-6 flex-1">
                      <div className="bg-slate-900 rounded-2xl p-4 font-mono text-xs text-orange-400 leading-relaxed min-h-[120px]">
                        {result.aiPrompt}
                      </div>
                      <p className="mt-3 text-[10px] text-slate-400 font-medium italic">* Copy prompt này vào Midjourney hoặc Flux để tạo ảnh concept.</p>
                    </div>
                  </div>

                  {/* TikTok Caption Card */}
                  <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={14} className="text-blue-500" /> Caption TikTok Viral
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${result.tiktokCaption}\n\n${result.hashtags}`);
                          setIsCaptionCopied(true);
                          setTimeout(() => setIsCaptionCopied(false), 2000);
                        }}
                        className={`p-2 rounded-xl transition-all ${isCaptionCopied ? 'bg-green-500 text-white' : 'bg-white text-slate-400 hover:text-orange-600 border border-slate-200'}`}
                      >
                        {isCaptionCopied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="p-6 flex-1">
                      <div className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                        {result.tiktokCaption}
                        <div className="mt-3 text-blue-600 font-bold">{result.hashtags}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[500px] bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Lightbulb className="text-slate-200" size={40} />
                  </div>
                  <h3 className="text-xl font-display font-black text-slate-300 uppercase tracking-tight">Chưa có concept nào</h3>
                  <p className="text-sm text-slate-400 max-w-xs mt-2">Nhập tên sản phẩm và cấu hình bên trái để AI sáng tạo concept cho bạn.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Image */}
                <div className="bg-white rounded-[2.5rem] shadow-lg border border-slate-100 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ảnh Gốc</span>
                  </div>
                  <div className="aspect-square bg-slate-100 flex items-center justify-center">
                    {uploadedImage ? (
                      <img src={uploadedImage} alt="Original" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center opacity-20">
                        <ImageIcon size={48} className="mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase">Chưa có ảnh</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Generated Remix */}
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-orange-100 overflow-hidden relative">
                  <div className="p-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Kết quả Remix AI</span>
                    {generatedImage && (
                      <a 
                        href={generatedImage} 
                        download="remix-ai.png"
                        className="p-2 bg-white text-orange-600 rounded-xl border border-orange-200 hover:bg-orange-500 hover:text-white transition-all"
                      >
                        <Download size={14} />
                      </a>
                    )}
                  </div>
                  <div className="aspect-square bg-slate-50 flex items-center justify-center relative">
                    {loading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-orange-600 mb-4" size={40} />
                        <p className="text-xs font-black text-orange-600 uppercase tracking-widest">AI Đang vẽ lại...</p>
                      </div>
                    )}
                    {generatedImage ? (
                      <img src={generatedImage} alt="Remixed" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center opacity-20">
                        <Sparkles size={48} className="mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase">Chờ Remix</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Remix Tools */}
              {generatedImage && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                  {/* Remix Caption */}
                  <div className="bg-white rounded-[2.5rem] shadow-lg border border-slate-100 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={14} className="text-blue-500" /> Caption Viral cho ảnh Remix
                      </span>
                      <button 
                        onClick={handleGenerateRemixCaption}
                        disabled={generatingCaption}
                        className="p-2 bg-white text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30"
                      >
                        {generatingCaption ? <RefreshCw size={14} className="animate-spin" /> : <Wand2 size={14} />}
                      </button>
                    </div>
                    <div className="p-6">
                      {remixCaption ? (
                        <div className="space-y-4">
                          <p className="text-sm text-slate-700 font-medium leading-relaxed">{remixCaption}</p>
                          <button 
                            onClick={() => navigator.clipboard.writeText(remixCaption)}
                            className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase hover:text-blue-700"
                          >
                            <Copy size={12} /> Sao chép caption
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Nhấn nút đũa thần để tạo caption cho ảnh này.</p>
                      )}
                    </div>
                  </div>

                  {/* Sora/Veo Prompt */}
                  <div className="bg-white rounded-[2.5rem] shadow-lg border border-slate-100 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Video size={14} className="text-purple-500" /> Prompt Video (Sora/Veo)
                      </span>
                      <button 
                        onClick={handleGenerateSoraPrompt}
                        disabled={generatingSora}
                        className="p-2 bg-white text-purple-600 rounded-xl border border-purple-100 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-30"
                      >
                        {generatingSora ? <RefreshCw size={14} className="animate-spin" /> : <Wand2 size={14} />}
                      </button>
                    </div>
                    <div className="p-6">
                      {soraPrompt ? (
                        <div className="space-y-4">
                          <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[11px] text-purple-400 leading-relaxed">
                            {soraPrompt}
                          </div>
                          <button 
                            onClick={() => navigator.clipboard.writeText(soraPrompt)}
                            className="flex items-center gap-2 text-[10px] font-black text-purple-600 uppercase hover:text-purple-700"
                          >
                            <Copy size={12} /> Sao chép prompt video
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Nhấn nút đũa thần để tạo prompt video từ concept này.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl z-50 animate-in slide-in-from-bottom-4">
          {error}
        </div>
      )}
    </div>
  );
};
