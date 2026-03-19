
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Copy, RefreshCw, AlertTriangle, MessageCircle, Share2, 
  ThumbsUp, Globe, MoreHorizontal, Sparkles, Zap, 
  Check, Layers, Laugh, Skull, Eye, HeartHandshake, ShieldAlert, Loader2, ArrowDown, Star, Wand2, Palette
} from 'lucide-react';
import { KOL_TEMPLATES } from '../constants';
import { KolInputState, KolStyleKey } from '../types';

export const KolContentGenerator: React.FC = () => {
  const [inputs, setInputs] = useState<KolInputState>({
    kolName: '',
    productName: '',
    productDescription: '',
    benefit: '',
    context: '',
    link: '',
    style: 'kol_boc_phot'
  });

  const [generatedPost, setGeneratedPost] = useState('');
  const [generatedComment, setGeneratedComment] = useState('');
  
  const [isPostCopied, setIsPostCopied] = useState(false);
  const [isCommentCopied, setIsCommentCopied] = useState(false);
  const [isAllCopied, setIsAllCopied] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggestingBenefit, setIsSuggestingBenefit] = useState(false);
  const [useAI, setUseAI] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputs(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const setStyle = (style: KolStyleKey) => {
    setInputs(prev => ({ ...prev, style }));
  };

  // Helper to generate content from static templates (Fallback)
  const generateStaticContent = useCallback(() => {
    const styleTemplates = KOL_TEMPLATES[inputs.style];
    const randomTemplate = styleTemplates[Math.floor(Math.random() * styleTemplates.length)];
    
    let post = randomTemplate.post;
    let comment = randomTemplate.comment;
    
    const productNameNoSpace = inputs.productName.replace(/\s+/g, '') || "Sanpham";
    const replaceAll = (str: string, find: string, replace: string) => str.split(find).join(replace);

    const kolName = inputs.kolName || "[Tên Idol/KOL]";
    const productName = inputs.productName || "[Tên Sản Phẩm]";
    const productNameKey = inputs.productName ? productNameNoSpace : "Sanpham";
    const benefit = inputs.benefit || "[Điểm mạnh/Lợi ích]";
    const link = inputs.link || "[Link mua hàng]";

    post = replaceAll(post, '{kolName}', kolName);
    post = replaceAll(post, '{productName}', productName);
    post = replaceAll(post, '{productNameNoSpace}', productNameKey);
    post = replaceAll(post, '{benefit}', benefit);
    post = replaceAll(post, '{link}', link);

    comment = replaceAll(comment, '{kolName}', kolName);
    comment = replaceAll(comment, '{productName}', productName);
    comment = replaceAll(comment, '{productNameNoSpace}', productNameKey);
    comment = replaceAll(comment, '{benefit}', benefit);
    comment = replaceAll(comment, '{link}', link);

    setGeneratedPost(post);
    setGeneratedComment(comment);
  }, [inputs]);

  // Suggest Benefits based on Product Name
  const handleSuggestBenefits = async () => {
    if (!inputs.productName && !inputs.productDescription) {
      alert("Vui lòng nhập Tên sản phẩm hoặc Mô tả sản phẩm để AI gợi ý!");
      return;
    }

    if (!process.env.API_KEY) {
      alert("Chưa cấu hình API Key.");
      return;
    }

    setIsSuggestingBenefit(true);
    try {
       const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
       const prompt = `
         Dựa trên thông tin sau:
         - Tên sản phẩm: "${inputs.productName}"
         - Mô tả sơ bộ: "${inputs.productDescription}"
         
         Hãy phân tích và liệt kê 5-7 "Điểm mạnh nhất/USP" (Unique Selling Point) của sản phẩm này dưới dạng từ khóa ngắn gọn, hấp dẫn để dùng viết quảng cáo.
         Chỉ trả về kết quả dưới dạng một đoạn văn, các ý cách nhau bởi dấu phẩy.
         Ví dụ output: "Thiết kế Titanium sang trọng, chip A17 Pro siêu mạnh, cổng USB-C tiện lợi, camera 48MP sắc nét, pin trâu cả ngày".
       `;
       
       const response = await ai.models.generateContent({
        // Use gemini-3-flash-preview for text tasks
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        setInputs(prev => ({
          ...prev,
          benefit: response.text.trim()
        }));
      }

    } catch (error) {
      console.error("Benefit Suggestion Error:", error);
      alert("AI đang bận, vui lòng thử lại sau!");
    } finally {
      setIsSuggestingBenefit(false);
    }
  };

  // Main generation function using AI
  const generateContent = async () => {
    setIsPostCopied(false);
    setIsCommentCopied(false);
    setIsAllCopied(false);

    // If AI mode is off or API key is missing, use static
    if (!useAI || !process.env.API_KEY) {
      generateStaticContent();
      return;
    }

    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const stylePrompts: Record<KolStyleKey, string> = {
        kol_boc_phot: "Phong cách 'Bóc phốt Idol': Giật tít như đang tố cáo KOL lừa dối, dùng hàng giả, hoặc có scandal. Nhưng thực tế là 'bóc' việc KOL dùng sản phẩm này quá đẹp/tốt mà giấu fan.",
        kol_canh_bao: "Phong cách 'Cảnh báo đu trend': Cảnh báo người dùng về hậu quả khi bắt chước KOL (hậu quả là bị nghiện sản phẩm, bị đẹp quá mức). Tạo cảm giác cấp bách.",
        kol_to_mo: "Phong cách 'Tò mò/Soi mói': Zoom vào chi tiết nhỏ trong ảnh/video của KOL (túi xách, bàn trang điểm) để tìm ra vật thể lạ (sản phẩm). Kích thích sự tò mò tột độ.",
        kol_hoi_han: "Phong cách 'Hối hận': Đóng vai fan hâm mộ đã bỏ qua lời khuyên của KOL và giờ hối hận. Hoặc đóng vai anti-fan đã trách nhầm KOL.",
        kol_tam_linh: "Phong cách 'Tâm linh/Vía': Kết nối sự thành công/may mắn của KOL với sản phẩm (vía tốt, vật phẩm phong thủy, tín hiệu vũ trụ).",
        kol_kin_di: "Phong cách 'Kinh dị/Shock': Mô tả những hình ảnh 'đáng sợ' (mặt mộc xấu, sự cố) của KOL trước khi dùng sản phẩm, hoặc sự thay đổi 'rùng mình' (theo hướng tốt) sau khi dùng.",
        kol_hai_huoc: "Phong cách 'Hài hước/Lầy lội': Kể về những tình huống dở khóc dở cười, sự cố 'ố dề' của KOL liên quan đến sản phẩm. Dùng ngôn ngữ Gen Z vui nhộn."
      };

      const systemInstruction = `
      BẠN LÀ MỘT BẬC THẦY 'CLICKBAIT' VÀ CHUYÊN GIA SÁNG TẠO NỘI DUNG VIRAL VỀ SHOWBIZ.
      
      QUY TẮC ĐỊNH DẠNG QUAN TRỌNG NHẤT (BẮT BUỘC): 
      1. SỬ DỤNG KÝ TỰ XUỐNG DÒNG (\\n\\n) ĐỂ TÁCH CÁC ĐOẠN VĂN. KHÔNG VIẾT DÍNH LIỀN.
      2. TRÌNH BÀY THOÁNG MẮT, DỄ ĐỌC TRÊN ĐIỆN THOẠI.
      3. BÀI ĐĂNG (CAPTION) PHẢI NGẮN GỌN (DƯỚI 50 TỪ) NHƯNG ĐỦ Ý.

      MỤC TIÊU: NỘI DUNG PHẢI LẤP LỬNG, CẮT NGANG ĐỂ BẮT BUỘC KHÁCH HÀNG PHẢI BẤM VÀO COMMENT ĐỂ ĐỌC TIẾP.

      NHIỆM VỤ:
      Viết 01 Bài đăng Facebook (Post) và 01 Bình luận ghim (Seeding Comment) để bán sản phẩm: "${inputs.productName || "Sản phẩm"}"
      Dựa trên hình ảnh của KOL: "${inputs.kolName || "Người nổi tiếng"}"
      Bối cảnh/Tin đồn (nếu có): "${inputs.context || "Không có"}"
      Keyword lợi ích/Điểm mạnh: "${inputs.benefit || "Công dụng tuyệt vời"}"
      Link mua hàng: "${inputs.link || "[Link]"}"
      Phong cách chủ đạo: ${stylePrompts[inputs.style]}

      ----------------------------------
      YÊU CẦU 1: BÀI ĐĂNG (CAPTION) - CẤU TRÚC 3 PHẦN TÁCH BIỆT
      
      1. HEADLINE GIẬT GÂN (IN HOA, Icon sốc).
         [Xuống dòng \\n\\n]
      2. ĐÚNG 1-2 câu "nhử mồi" nói về sự việc của KOL nhưng TUYỆT ĐỐI KHÔNG giải thích rõ ràng, KHÔNG nhắc tên sản phẩm.
         [Xuống dòng \\n\\n]
      3. Mũi tên chỉ xuống 👇 và câu kêu gọi xem dưới bình luận (VD: "Sự thật ở dưới cmt", "Xem full ở dưới", "Bằng chứng ở dưới 👇").

      ----------------------------------
      YÊU CẦU 2: BÌNH LUẬN (SEEDING) - GIẢI MÃ & BÁN HÀNG - CHIA ĐOẠN RÕ RÀNG
      
      - Đoạn 1: Tiết lộ "thủ phạm" hoặc "bí mật" chính là sản phẩm. Giải thích vì sao KOL lại như vậy.
         [Xuống dòng \\n\\n]
      - Đoạn 2: Review chi tiết lợi ích "${inputs.benefit}". Khẳng định uy tín của KOL khi dùng sản phẩm này.
         [Xuống dòng \\n\\n]
      - Đoạn 3: Kêu gọi hành động và Link mua hàng.

      ----------------------------------
      Định dạng đầu ra JSON bắt buộc:
      {
        "post": "Nội dung caption với các ký tự \\n\\n để xuống dòng...",
        "comment": "Nội dung comment với các ký tự \\n\\n để xuống dòng..."
      }`;

      const response = await ai.models.generateContent({
        // Use gemini-3-flash-preview for text tasks
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [{ text: `Viết content viral về ${inputs.kolName} dùng sản phẩm ${inputs.productName}. Context: ${inputs.context}. Phong cách ${inputs.style}. Nhớ quy tắc xuống dòng thoáng mắt.` }]
        },
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              post: { type: Type.STRING },
              comment: { type: Type.STRING }
            },
            required: ["post", "comment"]
          }
        }
      });

      const jsonResult = JSON.parse(response.text || "{}");
      
      if (jsonResult.post && jsonResult.comment) {
        setGeneratedPost(jsonResult.post);
        setGeneratedComment(jsonResult.comment);
      } else {
        generateStaticContent();
      }

    } catch (error) {
      console.error("AI Generation Error:", error);
      generateStaticContent();
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-200">
            <Star className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight">KOL Viral Content Generator</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tạo nội dung "bóc phốt", "cảnh báo" viral cực mạnh</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setUseAI(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${useAI ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <Sparkles size={14} /> AI Mode
          </button>
          <button 
            onClick={() => setUseAI(false)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${!useAI ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <Zap size={14} /> Template Mode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <Layers size={14} /> Cấu hình nội dung
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên KOL/Idol</label>
                <input 
                  name="kolName"
                  value={inputs.kolName}
                  onChange={handleInputChange}
                  placeholder="VD: Ninh Anh Bùi..." 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-purple-50 focus:border-purple-400 outline-none text-sm font-bold transition-all" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên Sản Phẩm</label>
                <input 
                  name="productName"
                  value={inputs.productName}
                  onChange={handleInputChange}
                  placeholder="VD: iPhone 15 Pro..." 
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-purple-50 focus:border-purple-400 outline-none text-sm font-bold transition-all" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả sản phẩm (Để AI hiểu)</label>
              <textarea 
                name="productDescription"
                value={inputs.productDescription}
                onChange={handleInputChange}
                placeholder="Mô tả ngắn gọn về sản phẩm..." 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-purple-50 focus:border-purple-400 outline-none text-sm font-medium transition-all h-20 resize-none" 
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Điểm mạnh / Lợi ích</label>
                <button 
                  onClick={handleSuggestBenefits}
                  disabled={isSuggestingBenefit || (!inputs.productName && !inputs.productDescription)}
                  className="text-[10px] font-black text-purple-600 hover:text-purple-700 flex items-center gap-1 disabled:opacity-30"
                >
                  {isSuggestingBenefit ? <RefreshCw size={10} className="animate-spin" /> : <Wand2 size={10} />} Gợi ý điểm mạnh
                </button>
              </div>
              <input 
                name="benefit"
                value={inputs.benefit}
                onChange={handleInputChange}
                placeholder="VD: Camera 48MP, Pin trâu..." 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-purple-50 focus:border-purple-400 outline-none text-sm font-medium transition-all" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bối cảnh / Tin đồn (Context)</label>
              <input 
                name="context"
                value={inputs.context}
                onChange={handleInputChange}
                placeholder="VD: Vừa lộ ảnh đi ăn tối, Scandal mới..." 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-purple-50 focus:border-purple-400 outline-none text-sm font-medium transition-all" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link mua hàng</label>
              <input 
                name="link"
                value={inputs.link}
                onChange={handleInputChange}
                placeholder="https://..." 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-purple-50 focus:border-purple-400 outline-none text-sm font-medium transition-all" 
              />
            </div>

            <div className="pt-2">
              <button 
                onClick={generateContent}
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-100 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {isGenerating ? 'Đang sáng tạo...' : 'Tạo Content Viral'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Palette size={14} /> Chọn phong cách
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setStyle('kol_boc_phot')} className={`p-3 rounded-xl border-2 text-left transition-all ${inputs.style === 'kol_boc_phot' ? 'border-purple-500 bg-purple-50' : 'border-slate-50 hover:border-purple-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert size={14} className="text-red-500" />
                  <span className="text-[11px] font-black uppercase">Bóc phốt</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">Giật tít tố cáo nhưng thực chất là khen.</p>
              </button>
              <button onClick={() => setStyle('kol_canh_bao')} className={`p-3 rounded-xl border-2 text-left transition-all ${inputs.style === 'kol_canh_bao' ? 'border-purple-500 bg-purple-50' : 'border-slate-50 hover:border-purple-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span className="text-[11px] font-black uppercase">Cảnh báo</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">Cảnh báo hậu quả khi dùng (quá tốt).</p>
              </button>
              <button onClick={() => setStyle('kol_to_mo')} className={`p-3 rounded-xl border-2 text-left transition-all ${inputs.style === 'kol_to_mo' ? 'border-purple-500 bg-purple-50' : 'border-slate-50 hover:border-purple-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Eye size={14} className="text-blue-500" />
                  <span className="text-[11px] font-black uppercase">Tò mò</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">Soi chi tiết nhỏ trong ảnh của KOL.</p>
              </button>
              <button onClick={() => setStyle('kol_hai_huoc')} className={`p-3 rounded-xl border-2 text-left transition-all ${inputs.style === 'kol_hai_huoc' ? 'border-purple-500 bg-purple-50' : 'border-slate-50 hover:border-purple-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Laugh size={14} className="text-green-500" />
                  <span className="text-[11px] font-black uppercase">Hài hước</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">Tình huống lầy lội, Gen Z vui nhộn.</p>
              </button>
              <button onClick={() => setStyle('kol_tam_linh')} className={`p-3 rounded-xl border-2 text-left transition-all ${inputs.style === 'kol_tam_linh' ? 'border-purple-500 bg-purple-50' : 'border-slate-50 hover:border-purple-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-yellow-500" />
                  <span className="text-[11px] font-black uppercase">Tâm linh</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">Vía tốt, tín hiệu vũ trụ từ sản phẩm.</p>
              </button>
              <button onClick={() => setStyle('kol_kin_di')} className={`p-3 rounded-xl border-2 text-left transition-all ${inputs.style === 'kol_kin_di' ? 'border-purple-500 bg-purple-50' : 'border-slate-50 hover:border-purple-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Skull size={14} className="text-slate-700" />
                  <span className="text-[11px] font-black uppercase">Kinh dị</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">Sự thay đổi rùng mình sau khi dùng.</p>
              </button>
            </div>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Result Cards */}
          <div className="grid grid-cols-1 gap-6">
            {/* Post Content */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Share2 size={14} /> Bài đăng (Caption)
                </span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPost);
                    setIsPostCopied(true);
                    setTimeout(() => setIsPostCopied(false), 2000);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${isPostCopied ? 'bg-green-500 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                >
                  {isPostCopied ? <Check size={12} /> : <Copy size={12} />} {isPostCopied ? 'Đã copy' : 'Sao chép'}
                </button>
              </div>
              <div className="p-6 flex-1 min-h-[150px] relative">
                {isGenerating && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <Loader2 className="animate-spin text-purple-600" size={32} />
                  </div>
                )}
                <div className="whitespace-pre-wrap font-body text-slate-700 leading-relaxed">
                  {generatedPost || "Nội dung bài đăng sẽ xuất hiện ở đây..."}
                </div>
              </div>
            </div>

            {/* Comment Content */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageCircle size={14} /> Bình luận ghim (Seeding)
                </span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedComment);
                    setIsCommentCopied(true);
                    setTimeout(() => setIsCommentCopied(false), 2000);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${isCommentCopied ? 'bg-green-500 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                >
                  {isCommentCopied ? <Check size={12} /> : <Copy size={12} />} {isCommentCopied ? 'Đã copy' : 'Sao chép'}
                </button>
              </div>
              <div className="p-6 flex-1 min-h-[150px] relative">
                {isGenerating && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <Loader2 className="animate-spin text-purple-600" size={32} />
                  </div>
                )}
                <div className="whitespace-pre-wrap font-body text-slate-700 leading-relaxed">
                  {generatedComment || "Nội dung bình luận ghim sẽ xuất hiện ở đây..."}
                </div>
              </div>
            </div>
          </div>

          {/* Facebook Preview */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Globe size={14} /> Xem trước trên Facebook
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black">
                    {inputs.kolName ? inputs.kolName.charAt(0) : 'K'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1">
                      {inputs.kolName || "Tên KOL/Idol"} <Check size={12} className="bg-blue-500 text-white rounded-full p-0.5" />
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      Vừa xong • <Globe size={10} />
                    </div>
                  </div>
                </div>
                <MoreHorizontal className="text-slate-400" size={20} />
              </div>

              {/* Post Content */}
              <div className="text-sm text-slate-800 whitespace-pre-wrap leading-tight">
                {generatedPost || "Nội dung bài đăng..."}
              </div>

              {/* Post Image Placeholder */}
              <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                <div className="text-center opacity-20">
                  <Share2 size={48} className="mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase">Ảnh/Video của {inputs.kolName || "KOL"}</p>
                </div>
              </div>

              {/* Post Stats */}
              <div className="flex items-center justify-between py-2 border-y border-slate-100">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-1">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center border border-white"><ThumbsUp size={8} className="text-white" /></div>
                    <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border border-white"><HeartHandshake size={8} className="text-white" /></div>
                  </div>
                  <span className="text-[11px] text-slate-500">9.2K</span>
                </div>
                <div className="text-[11px] text-slate-500">1.4K bình luận • 856 chia sẻ</div>
              </div>

              {/* Post Actions */}
              <div className="flex justify-around py-1">
                <button className="flex items-center gap-2 text-slate-500 font-bold text-xs py-2 px-4 rounded-lg hover:bg-slate-50 transition-all"><ThumbsUp size={16} /> Thích</button>
                <button className="flex items-center gap-2 text-slate-500 font-bold text-xs py-2 px-4 rounded-lg hover:bg-slate-50 transition-all"><MessageCircle size={16} /> Bình luận</button>
                <button className="flex items-center gap-2 text-slate-500 font-bold text-xs py-2 px-4 rounded-lg hover:bg-slate-50 transition-all"><Share2 size={16} /> Chia sẻ</button>
              </div>

              {/* Comment Section */}
              <div className="pt-2 space-y-3">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-[10px] shrink-0">
                    {inputs.kolName ? inputs.kolName.charAt(0) : 'K'}
                  </div>
                  <div className="bg-slate-100 p-3 rounded-2xl flex-1">
                    <div className="font-bold text-[11px] text-slate-900 flex items-center gap-1 mb-1">
                      {inputs.kolName || "Tên KOL/Idol"} <span className="text-[9px] font-black bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">Tác giả</span>
                    </div>
                    <div className="text-xs text-slate-700 whitespace-pre-wrap leading-tight">
                      {generatedComment || "Bình luận ghim..."}
                    </div>
                  </div>
                </div>
                <div className="ml-10 flex gap-4 text-[10px] font-bold text-slate-500">
                  <button className="hover:underline">Thích</button>
                  <button className="hover:underline">Phản hồi</button>
                  <span>1 giờ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Copy All Button */}
      {generatedPost && (
        <button 
          onClick={() => {
            navigator.clipboard.writeText(`CAPTION:\n${generatedPost}\n\nCOMMENT:\n${generatedComment}`);
            setIsAllCopied(true);
            setTimeout(() => setIsAllCopied(false), 2000);
          }}
          className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 ${isAllCopied ? 'bg-green-500 text-white' : 'bg-slate-900 text-white'}`}
        >
          {isAllCopied ? <Check size={20} /> : <Copy size={20} />}
          {isAllCopied ? 'ĐÃ COPY TẤT CẢ' : 'COPY CẢ BÀI & CMT'}
        </button>
      )}
    </div>
  );
};
