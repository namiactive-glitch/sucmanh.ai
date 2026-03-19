
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Shirt, Sparkles, Loader2, Download, RefreshCw, Wand2, Palette, Sun, Smile, Package, User, Upload, Search, CheckCircle2, Layers, X, Flame, Heart, Zap, Image as ImageIcon, Accessibility } from 'lucide-react';
import { generateVirtualTryOn } from '../services/geminiService';
import { UploadBox } from './UploadBox';
import { ImageAsset } from '../types';
import { fileToBase64, getMimeType } from '../utils';
import { ASPECT_RATIOS, BACKDROPS, BODY_SHAPES } from '../constants';

const BIKINI_STYLES = [
  "Bikini 2 mảnh dây mảnh sexy màu đỏ rực", "Monokini khoét hông cao quyến rũ", "Bikini len móc (Crochet) phong cách Boho", 
  "Bikini cạp cao tôn dáng màu đen huyền bí", "Micro Bikini táo bạo màu Neon", "Bikini cúp ngực đính đá sang trọng", 
  "Set Bikini họa tiết da báo Wild West", "Bikini 1 mảnh lệch vai màu trắng tinh khôi", "Bikini dây chéo quấn eo gợi cảm", 
  "Bikini chất liệu Satin bóng bẩy cao cấp", "Bikini bèo nhún nhẹ nhàng màu hồng Pastel", "Bikini khoét ngực sâu quyến rũ",
  "Bikini xuyên thấu nhẹ nhàng quyến rũ", "Bikini phong cách vintage chấm bi", "Bikini thể thao năng động khoét cao",
  "Bikini màu vàng chanh nổi bật dưới nắng", "Set đồ bơi 3 mảnh kèm khăn sarong lụa", "Bikini quây ngực sexy không dây",
  "Bikini đan dây chéo lưng nghệ thuật", "Monokini cut-out eo táo bạo", "Bikini lấp lánh Sequin cho pool party",
  "Bikini màu xanh Cobalt cực tôn da", "Bikini thắt nơ hông gợi cảm", "Bikini ren trắng mỏng manh tinh tế",
  "Bikini họa tiết hoa nhí nhiệt đới", "Bikini ombre chuyển màu độc đáo", "Bikini kim loại (Metallic) thời thượng",
  "Set bikini bọc viền tương phản cá tính", "Bikini cổ yếm quyến rũ", "Bikini bồng bềnh xếp ly tiểu thư",
  "Bikini nhung tăm sang chảnh", "Monokini lưới mờ ảo gợi cảm", "Bikini thêu hoa nổi 3D", "Bikini phối dây xích vàng luxury",
  "Bikini sọc ngang thủy thủ", "Bikini dáng yếm lửng năng động", "Bikini khoét bụng khoe cơ sáu múi",
  "Bikini quai trong suốt độc lạ", "Bikini nhúng bèo eo che khuyết điểm", "Bikini khóa kéo trước thể thao",
  "Bikini ren thêu tay tỉ mỉ", "Bikini lụa bóng phong cách hoàng gia", "Set bơi 2 mảnh buộc dây cổ điển",
  "Bikini đính lông vũ nghệ thuật", "Bikini xẻ đùi cao vút chân dài", "Bikini màu be nude cực Tây",
  "Bikini họa tiết camouflage cá tính", "Bikini trễ vai gợi cảm", "Bikini cổ lọ mỏng manh", "Bikini corset nâng ngực",
  "Bikini voan mỏng bay bổng", "Bikini denim phá cách", "Bikini họa tiết thổ cẩm độc đáo", "Bikini nhún chun co giãn tốt",
  "Set bơi 2 mảnh buộc nơ vai", "Bikini cổ V sâu lôi cuốn", "Bikini đính ngọc trai quý phái", "Bikini viền ren đỏ nồng cháy",
  "Bikini họa tiết dải ngân hà", "Bikini thun gân ôm sát đường cong", "Bikini khoét lưng trần quyến rũ",
  "Bikini phong cách Bond Girl mạnh mẽ", "Bikini lính chì đen phối vàng", "Set bikini 2 mảnh cột dây hông",
  "Bikini ren lụa mỏng xuyên thấu", "Bikini ánh kim bạc lấp lánh", "Bikini buộc dây thắt nút sexy",
  "Bikini cổ yếm khoét giọt nước", "Bikini họa tiết Marble vân đá", "Bikini màu xanh rêu nhạt thanh lịch",
  "Set bơi 3 mảnh họa tiết Versace", "Bikini dáng bra năng động", "Bikini khoét lỗ (Eyelet) nhẹ nhàng",
  "Bikini đan lưới tay dài lạ mắt", "Bikini màu đồng bóng cổ điển", "Bikini phối da cá tính", "Bikini cổ vuông retro",
  "Bikini hở chân ngực (Underboob) táo bạo", "Bikini màu san hô rực rỡ", "Bikini tua rua đung đưa",
  "Bikini vải lanh thoáng mát", "Bikini in hình tattoo nghệ thuật", "Bikini màu tím oải hương dịu dàng",
  "Set đồ bơi 2 mảnh thắt nơ to bản", "Bikini khoét eo sâu chữ V", "Bikini hở lưng trần hoàn toàn",
  "Bikini viền xích bạc sang trọng", "Bikini phong cách Baywatch cổ điển", "Bikini họa tiết zebra đen trắng",
  "Bikini màu đỏ đô quyền lực", "Bikini lưới phối ren tinh xảo", "Bikini vải bố mộc mạc", "Bikini cổ vest lạ mắt",
  "Bikini khoét nách rộng sexy", "Bikini màu hồng neon chói lọi", "Bikini đính sequin đen bóng",
  "Bikini cổ yếm thắt dây mảnh", "Bikini cạp cao bèo nhún sang trọng", "Bikini 2 mảnh tối giản minimalism",
  "Bikini 1 mảnh kín đáo nhưng vẫn gợi cảm"
];

const OUTFIT_DATABASE: Record<string, string[]> = {
  "Bikini Gợi Cảm": BIKINI_STYLES,
  "Nữ: Casual": ["Áo thun trắng Basic, quần Jean xanh ống rộng", "Áo sơ mi linen form rộng, quần short vải tây", "Set bộ thể thao nỉ màu xám", "Váy hoa nhí Vintage cổ vuông", "Áo Blazer Oversize, áo thun trắng"],
  "Nữ: Luxury": ["Váy dạ hội đuôi cá màu đỏ rượu", "Đầm lụa Satin màu vàng Gold", "Váy quây màu đen tuyền đính đá", "Đầm công chúa bồng bềnh hồng phấn"],
  "Nam: Gentleman": ["Bộ Vest màu xanh Navy, cà vạt đỏ", "Áo Polo dệt kim màu kem, quần Chinos", "Áo sơ mi trắng Oxford, quần tây xám"],
  "Nam: Streetwear": ["Áo Hoodie Oversize in hình, quần Cargo", "Áo phông trắng, sơ mi Flannel, quần Jean rách", "Áo khoác Varsity màu đỏ trắng"],
  "Truyền Thống": ["Áo dài lụa trắng, quần đen", "Áo dài gấm đỏ họa tiết đồng tiền", "Áo bà ba lụa nâu, khăn rằn"],
};

export const VirtualTryOn: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'preset' | 'upload'>('preset');
  const [modelImage, setModelImage] = useState<ImageAsset | null>(null);
  const [productImage, setProductImage] = useState<ImageAsset | null>(null);
  
  const categories = Object.keys(OUTFIT_DATABASE);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedOutfit, setSelectedOutfit] = useState("");
  const [selectedBodyShape, setSelectedBodyShape] = useState(BODY_SHAPES[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customDescription, setCustomDescription] = useState('');
  const [customBackdropText, setCustomBackdropText] = useState('');

  const [selectedBackdrop, setSelectedBackdrop] = useState(BACKDROPS[0]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(ASPECT_RATIOS[1].id);
  
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const filteredStyles = useMemo(() => {
    const styles = OUTFIT_DATABASE[selectedCategory] || [];
    if (!searchTerm) return styles;
    return styles.filter(style => style.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [selectedCategory, searchTerm]);

  const handleModelUpload = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setModelImage({ id: Date.now().toString(), file, previewUrl: URL.createObjectURL(file), base64, mimeType: getMimeType(file) });
    } catch (e) { alert("Lỗi tải ảnh"); }
  };

  const handleProductUpload = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setProductImage({ id: Date.now().toString(), file, previewUrl: URL.createObjectURL(file), base64, mimeType: getMimeType(file) });
    } catch (e) { alert("Lỗi tải ảnh"); }
  };

  const handleGenerate = async () => {
    if (!modelImage) return;
    setIsGenerating(true);
    setResultImage(null);
    try {
      const desc = activeTab === 'preset' 
        ? (customDescription || selectedOutfit || "Mô tả trang phục thời trang") 
        : "Reference clothing from the uploaded product image";
      
      const imageUrl = await generateVirtualTryOn(
        modelImage, 
        desc, 
        "Studio Lighting", 
        "None", 
        [], 
        selectedBackdrop, 
        activeTab === 'upload' ? productImage : null, 
        selectedAspectRatio,
        customBackdropText,
        selectedBodyShape.label
      );
      setResultImage(imageUrl);
      if (window.innerWidth < 1024) resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e: any) { 
        alert(e.message || "AI đang bận hoặc có lỗi xảy ra. Vui lòng thử lại."); 
    } finally { 
        setIsGenerating(false); 
    }
  };

  return (
    <div className="lg:h-full flex flex-col bg-white">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 overflow-y-auto lg:overflow-hidden">
          {/* Controls */}
          <div className="lg:col-span-5 p-4 lg:overflow-y-auto custom-scrollbar space-y-6">
              <div className="space-y-4">
                <label className="block text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <User size={14} className="text-orange-500" /> 1. Ảnh Người Mẫu
                </label>
                <UploadBox id="model-tryon" label="Tải ảnh mẫu (toàn thân/nửa người)" image={modelImage} onUpload={handleModelUpload} onRemove={() => setModelImage(null)} heightClass="h-44 lg:h-52" />
              </div>

              {/* Lựa chọn Dáng Người */}
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <Accessibility size={12} className="text-orange-500" /> 2. Lựa chọn dáng người
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {BODY_SHAPES.map(shape => (
                          <button
                            key={shape.id}
                            onClick={() => setSelectedBodyShape(shape)}
                            className={`p-2.5 rounded-xl border text-[10px] font-bold text-left transition-all leading-tight flex flex-col gap-0.5 ${selectedBodyShape.id === shape.id ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-orange-200'}`}
                          >
                              <span>{shape.label}</span>
                              <span className="text-[8px] font-normal text-slate-400 line-clamp-1 italic">{shape.desc}</span>
                          </button>
                      ))}
                  </div>
              </div>

              <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 shadow-inner">
                  <button onClick={() => setActiveTab('preset')} className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 ${activeTab === 'preset' ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500'}`}>
                    <Layers size={14} /> Mẫu Có Sẵn
                  </button>
                  <button onClick={() => setActiveTab('upload')} className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'bg-white text-orange-600 shadow-md' : 'text-slate-500'}`}>
                    <Upload size={14} /> Tải Đồ Lên
                  </button>
              </div>

              {activeTab === 'preset' ? (
                <div className="space-y-5">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {categories.map((cat) => (
                            <button 
                                key={cat} 
                                onClick={() => setSelectedCategory(cat)} 
                                className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap border transition-all flex items-center gap-1.5 ${selectedCategory === cat ? 'bg-orange-500 text-white border-orange-500 shadow-lg scale-105' : 'bg-white text-slate-500 border-slate-200 hover:border-orange-300'}`}
                            >
                                {cat === "Bikini Gợi Cảm" && <Flame size={12} className="text-yellow-200 fill-current" />}
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder={`Tìm kiếm trong ${selectedCategory.toLowerCase()}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-200 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto custom-scrollbar p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
                        {filteredStyles.map((style, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => { setSelectedOutfit(style); setCustomDescription(style); }} 
                                className={`group p-3 text-left text-[11px] rounded-xl border transition-all flex items-center justify-between ${selectedOutfit === style ? 'bg-orange-100 border-orange-400 text-orange-800 font-bold shadow-sm' : 'bg-white border-slate-100 text-slate-600 hover:border-orange-200'}`}
                            >
                                <span className="line-clamp-1">{style}</span>
                                {selectedOutfit === style && <CheckCircle2 size={14} className="text-orange-600 shrink-0" />}
                            </button>
                        ))}
                        {filteredStyles.length === 0 && <p className="p-4 text-center text-[10px] text-slate-400 font-bold uppercase italic">Không tìm thấy kiểu phù hợp</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <Zap size={12} className="text-orange-500" /> Tùy chỉnh trang phục (Nhập tay)
                        </label>
                        <textarea 
                            value={customDescription}
                            onChange={(e) => setCustomDescription(e.target.value)}
                            placeholder="Mô tả chi tiết trang phục bạn muốn AI tạo ra... (VD: Váy lụa dài màu xanh ngọc, cổ xẻ sâu...)"
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-200 outline-none resize-none h-20 shadow-sm"
                        />
                    </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">3. Ảnh Trang Phục (Cần thử)</label>
                  <UploadBox id="product-tryon" label="Tải ảnh quần áo (trải phẳng hoặc mannequin)" image={productImage} onUpload={handleProductUpload} onRemove={() => setProductImage(null)} heightClass="h-44 lg:h-52" />
                  <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-3">
                      <Zap size={20} className="text-orange-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black text-orange-800 uppercase tracking-tighter">Mẹo nhỏ:</p>
                        <p className="text-[11px] font-medium text-orange-700 leading-relaxed">Hãy tải ảnh trang phục có độ phân giải cao để AI giữ đúng họa tiết và chất liệu nhất.</p>
                      </div>
                  </div>
                </div>
              )}

              {/* Tùy chỉnh bối cảnh */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                      <ImageIcon size={12} className="text-orange-500" /> Bối cảnh tùy chọn (Mô tả nền)
                  </label>
                  <textarea 
                      value={customBackdropText}
                      onChange={(e) => setCustomBackdropText(e.target.value)}
                      placeholder="Mô tả bối cảnh xung quanh người mẫu (VD: Trên bãi biển nắng vàng, trong quán cafe cổ điển, studio sang trọng...)"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-200 outline-none resize-none h-20 shadow-sm"
                  />
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                      {BACKDROPS.filter(b => b.id !== 'custom_bg' && b.id !== 'original_bg').slice(0, 6).map(b => (
                          <button 
                            key={b.id} 
                            onClick={() => setCustomBackdropText(b.label)}
                            className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[9px] font-bold text-slate-500 whitespace-nowrap hover:border-orange-200 hover:text-orange-600 transition-all"
                          >
                              {b.label}
                          </button>
                      ))}
                  </div>
              </div>

              <button 
                  onClick={handleGenerate} 
                  disabled={!modelImage || isGenerating} 
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-2 transform active:scale-95 ${!modelImage ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : isGenerating ? 'bg-slate-800 text-white cursor-wait' : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-orange-200'}`}
              >
                  {isGenerating ? <RefreshCw className="animate-spin" /> : <Wand2 size={16} />} 
                  {isGenerating ? 'AI ĐANG PHỐI ĐỒ...' : 'THỬ ĐỒ NGAY'}
              </button>
          </div>

          {/* Result */}
          <div ref={resultRef} className="lg:col-span-7 bg-slate-50 flex items-center justify-center relative min-h-[450px] lg:h-full">
            {resultImage ? (
                <div className="relative w-full h-full p-4 lg:p-10 flex items-center justify-center group">
                    <img src={resultImage} alt="Result" className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500" />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setResultImage(null)} className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl text-slate-600 hover:text-red-500 transition-all active:scale-90"><X size={20}/></button>
                        <a href={resultImage} download="try-on-ai.png" className="px-6 py-3 bg-orange-600/90 backdrop-blur-md text-white rounded-2xl shadow-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-orange-600 active:scale-90 transition-all"><Download size={16}/> Tải Ảnh</a>
                    </div>
                </div>
            ) : (
                <div className="text-center p-12 space-y-4 max-w-sm">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                        <Shirt size={48} className="text-slate-200" />
                    </div>
                    <div>
                        <h4 className="font-display font-black text-slate-300 text-base uppercase tracking-tighter">AI Virtual Try-On</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sẵn sàng để biến đổi phong cách của bạn</p>
                    </div>
                </div>
            )}
            {isGenerating && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center animate-in fade-in">
                    <div className="relative mb-6">
                        <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-400 animate-pulse" size={24} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-orange-700 font-black text-xs uppercase tracking-[0.2em] animate-pulse">AI Đang Phối Đồ</p>
                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Bảo toàn 100% gương mặt mẫu</p>
                    </div>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};
