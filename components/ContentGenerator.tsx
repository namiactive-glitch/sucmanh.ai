
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Copy, RefreshCw, AlertTriangle, MessageCircle, Share2, 
  ThumbsUp, Globe, MoreHorizontal, Sparkles, Heart, 
  FlaskConical, Laugh, Check, PenLine, Layers, Bot, Zap, Loader2, ArrowDown
} from 'lucide-react';
import { CONTENT_TEMPLATES } from '../constants';
import { InputState, StyleKey } from '../types';

export const ContentGenerator: React.FC = () => {
  const [inputs, setInputs] = useState<InputState>({
    productName: '',
    productDescription: '',
    benefit: '',
    link: '',
    style: 'boc_phot'
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

  const setStyle = (style: StyleKey) => {
    setInputs(prev => ({ ...prev, style }));
  };

  // Helper to generate content from static templates (Fallback)
  const generateStaticContent = useCallback(() => {
    const styleTemplates = CONTENT_TEMPLATES[inputs.style];
    const randomTemplate = styleTemplates[Math.floor(Math.random() * styleTemplates.length)];
    
    let post = randomTemplate.post;
    let comment = randomTemplate.comment;
    
    const productNameNoSpace = inputs.productName.replace(/\s+/g, '') || "Sanpham";
    const replaceAll = (str: string, find: string, replace: string) => str.split(find).join(replace);

    const productName = inputs.productName || "[Tên Sản Phẩm]";
    const productNameKey = inputs.productName ? productNameNoSpace : "Sanpham";
    const benefit = inputs.benefit || "[Điểm mạnh/Lợi ích]";
    const link = inputs.link || "[Link mua hàng]";

    post = replaceAll(post, '{productName}', productName);
    post = replaceAll(post, '{productNameNoSpace}', productNameKey);
    post = replaceAll(post, '{benefit}', benefit);
    post = replaceAll(post, '{link}', link);

    comment = replaceAll(comment, '{productName}', productName);
    comment = replaceAll(comment, '{productNameNoSpace}', productNameKey);
    comment = replaceAll(comment, '{benefit}', benefit);
    comment = replaceAll(comment, '{link}', link);

    setGeneratedPost(post);
    setGeneratedComment(comment);
  }, [inputs]);

  // Suggest Benefits based on Product Name & Description
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
      
      const stylePrompts: Record<StyleKey, string> = {
        boc_phot: "Phong cách 'Bóc phốt' ngược: Tiêu đề giật gân, gay gắt như đang lên án, nhưng nội dung lật kèo khen ngợi.",
        canh_bao: "Phong cách 'Cảnh báo': Đánh vào nỗi sợ (FOMO) hoặc sự cấp bách. Ngắn gọn, nghiêm trọng.",
        to_mo: "Phong cách 'Gây tò mò': Kể một nửa câu chuyện, che giấu nhân vật/kết quả. Bắt buộc phải xem comment.",
        hoi_han: "Phong cách 'Hối hận': Tiếc nuối vì không biết sớm hơn. Chân thành, ngắn gọn.",
        drama: "Phong cách 'Drama': Kịch tính gia đình/xã hội. Câu từ chanh chua hoặc gay cấn.",
        kinh_di: "Phong cách 'Kinh dị': Dùng từ ngữ mạnh, gây ám ảnh. Sản phẩm là cứu tinh.",
        tam_linh: "Phong cách 'Tâm linh': Hệ tâm linh, vía, vũ trụ. Ngắn gọn, bí ẩn.",
        chuyen_gia: "Phong cách 'Chuyên gia': Số liệu, sự thật, khách quan. Tin cậy.",
        tinh_cam: "Phong cách 'Ngôn tình': Cảm xúc, rung động, thoát ế. Ngọt ngào.",
        hai_huoc: "Phong cách 'Hài hước': Gen Z, slang, lầy lội, vô tri.",
        san_sale: "Phong cách 'Săn Deal': Giá sốc, cơ hội cuối, rẻ như cho. Thúc giục cực mạnh."
      };

      const systemInstruction = `
      BẠN LÀ CHUYÊN GIA VIẾT CONTENT TỐI GIẢN (MINIMALIST COPYWRITER).
      TÔN CHỈ: "LESS IS MORE" - CÀNG NGẮN CÀNG TỐT - KHÔNG LAN MAN.

      NHIỆM VỤ:
      Viết 01 Post và 01 Seeding Comment cho sản phẩm: "${inputs.productName || "Sản phẩm"}"
      Dựa trên các điểm mạnh: "${inputs.benefit || "Công dụng tuyệt vời"}"
      Link: "${inputs.link || "[Link]"}"
      Phong cách: ${stylePrompts[inputs.style]}

      ----------------------------------
      QUY TẮC NGHIÊM NGẶT VỀ ĐỘ DÀI VÀ NỘI DUNG:
      
      1. BÀI ĐĂNG (CAPTION): SIÊU NGẮN (Tối đa 30-40 từ).
      - Cấu trúc chỉ gồm 3 phần:
        + HEADLINE: In hoa, giật gân, ngắn gọn (3-5 từ).
        + HOOK: 1-2 câu ngắn gây tò mò cực độ, KHÔNG lộ tên sản phẩm.
        + CTA: Chỉ xuống comment (VD: "Sự thật ở dưới 👇").
      - Tuyệt đối KHÔNG bán hàng ở caption. Chỉ khơi gợi sự tò mò.

      2. BÌNH LUẬN (SEEDING): NGẮN GỌN & TRỌNG TÂM (Tối đa 3 câu).
      - Đi thẳng vào vấn đề: Sản phẩm là gì? Tại sao nó giải quyết được vấn đề?
      - Văn phong: Tự nhiên, đời thường, không văn vở quảng cáo sáo rỗng.
      - Tập trung duy nhất vào lợi ích chính: "${inputs.benefit}".
      - Kết thúc bằng Link.

      ----------------------------------
      Định dạng đầu ra JSON:
      {
        "post": "HEADLINE IN HOA... \\n\\n Câu hook ngắn gọn gây tò mò... \\n\\n CTA 👇",
        "comment": "Tên SP + Lợi ích trực diện. \\n Kêu gọi mua hàng ngắn. \\n Link"
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [{ text: `Viết content cực ngắn, trọng tâm cho ${inputs.productName}. Phong cách ${inputs.style}. Caption dưới 40 từ. Seeding dưới 3 câu.` }]
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

  // Generate on mount (static initially to be fast)
  useEffect(() => {
    generateStaticContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Modern copy function with fallback
  const handleCopy = async (text: string, setCopiedState: React.Dispatch<React.SetStateAction<boolean>>) => {
    if ('clipboard' in navigator) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000);
        return;
      } catch (err) {
        console.error('Clipboard API failed, trying fallback', err);
      }
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {
      console.error('Unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const copyPost = () => handleCopy(generatedPost, setIsPostCopied);
  const copyComment = () => handleCopy(generatedComment, setIsCommentCopied);
  
  const copyAll = () => {
    const fullContent = `--- CAPTION ---\n${generatedPost}\n\n--- SEEDING COMMENT ---\n${generatedComment}`;
    handleCopy(fullContent, setIsAllCopied);
  };

  // Button config
  const buttonConfig: { id: StyleKey; label: string; icon?: React.ReactNode; colorClass: string }[] = [
    { id: 'boc_phot', label: 'Bóc phốt', icon: '🤬', colorClass: 'bg-red-100 text-red-700 border-red-500' },
    { id: 'canh_bao', label: 'Cảnh báo', icon: '⚠️', colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-500' },
    { id: 'to_mo', label: 'Tò mò', icon: '🤔', colorClass: 'bg-purple-100 text-purple-700 border-purple-500' },
    { id: 'hoi_han', label: 'Hối hận', icon: '😭', colorClass: 'bg-orange-100 text-orange-700 border-orange-500' },
    { id: 'drama', label: 'Drama', icon: '🎭', colorClass: 'bg-pink-100 text-pink-700 border-pink-500' },
    { id: 'kinh_di', label: 'Kinh dị', icon: '👻', colorClass: 'bg-gray-800 text-white border-gray-600' },
    { id: 'tam_linh', label: 'Tâm linh', icon: <Sparkles className="w-3 h-3"/>, colorClass: 'bg-indigo-100 text-indigo-700 border-indigo-500' },
    { id: 'chuyen_gia', label: 'Chuyên gia', icon: <FlaskConical className="w-3 h-3"/>, colorClass: 'bg-cyan-100 text-cyan-700 border-cyan-500' },
    { id: 'tinh_cam', label: 'Tình cảm', icon: <Heart className="w-3 h-3"/>, colorClass: 'bg-rose-100 text-rose-700 border-rose-500' },
    { id: 'hai_huoc', label: 'Hài hước', icon: <Laugh className="w-3 h-3"/>, colorClass: 'bg-lime-100 text-lime-700 border-lime-500' },
    { id: 'san_sale', label: 'Săn Deal 1K', icon: '💸', colorClass: 'bg-green-100 text-green-700 border-green-500' },
  ];

  return (
    <div className="h-full font-sans text-slate-800 lg:overflow-y-auto custom-scrollbar">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Input Panel */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-orange-100">
            {/* Header */}
            <div className="bg-orange-600 p-4 flex justify-between items-center">
              <h1 className="text-lg font-bold flex items-center gap-2 text-white uppercase font-display">
                <AlertTriangle className="w-5 h-5 text-white" />
                Cấu Hình Content
              </h1>
              
              {/* AI Toggle */}
              <button 
                onClick={() => setUseAI(!useAI)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border
                  ${useAI 
                    ? 'bg-white text-orange-600 border-white shadow-sm' 
                    : 'bg-orange-700 text-orange-200 border-orange-500'}`}
              >
                {useAI ? <Sparkles className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                {useAI ? 'AI: ON' : 'AI: OFF'}
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <p className="text-slate-500 mb-6 text-sm font-body">
                Sử dụng <strong>{useAI ? 'Gemini AI' : 'Mẫu Có Sẵn'}</strong> để tạo hàng nghìn nội dung viral độc đáo.
              </p>

              <div className="space-y-4">
                {/* Inputs */}
                <div>
                  <label className="block text-sm font-semibold mb-1 text-orange-800 font-display">1. Tên sản phẩm</label>
                  <input
                    type="text"
                    name="productName"
                    placeholder="Ví dụ: Kem dưỡng da X, Máy hút bụi Y..."
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow bg-slate-50 font-body text-sm"
                    value={inputs.productName}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                   <label className="block text-sm font-semibold mb-1 text-orange-800 font-display">2. Mô tả sơ bộ về sản phẩm</label>
                   <textarea
                    name="productDescription"
                    placeholder="Nhập mô tả ngắn gọn về sản phẩm để AI hiểu rõ hơn..."
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow h-20 resize-none bg-slate-50 text-sm font-body"
                    value={inputs.productDescription}
                    onChange={handleInputChange}
                  />
                </div>

                {/* AI ACTION */}
                <div className="flex justify-center -my-2 z-10 relative">
                   <button
                      onClick={handleSuggestBenefits}
                      disabled={isSuggestingBenefit || (!inputs.productName && !inputs.productDescription)}
                      className="text-xs flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700 transition-all shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-bold font-display"
                    >
                      {isSuggestingBenefit ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                      {isSuggestingBenefit ? 'Đang phân tích...' : 'AI Phân Tích & Gợi Ý Điểm Mạnh'}
                      <ArrowDown className="w-3 h-3"/>
                    </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-orange-800 mb-1 font-display">3. Điểm mạnh / USP (Kết quả AI)</label>
                  <textarea
                    name="benefit"
                    placeholder="AI sẽ tự động điền các điểm mạnh vào đây sau khi phân tích..."
                    className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow h-24 resize-none bg-indigo-50/50 text-indigo-900 font-medium font-body text-sm"
                    value={inputs.benefit}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-orange-800 font-display">Link mua hàng (CTA)</label>
                  <input
                    type="text"
                    name="link"
                    placeholder="https://shopee.vn/..."
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow bg-slate-50 font-body text-sm"
                    value={inputs.link}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Style Buttons */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-orange-800 font-display">Phong cách giật tít</label>
                  <div className="grid grid-cols-2 gap-2">
                    {buttonConfig.map((btn) => (
                      <button 
                        key={btn.id}
                        onClick={() => setStyle(btn.id)} 
                        className={`p-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 font-display
                          ${inputs.style === btn.id 
                            ? `${btn.colorClass} border-2 shadow-sm scale-[1.02]` 
                            : 'bg-white text-slate-500 border border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
                          }`}
                      >
                        {btn.icon} {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateContent}
                  disabled={isGenerating}
                  className={`w-full font-bold font-display py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all mt-4 shadow-lg shadow-orange-200 transform 
                    ${isGenerating 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:bg-orange-800 hover:-translate-y-0.5 text-white'}`}
                >
                  {isGenerating ? (
                    <><RefreshCw className="w-5 h-5 animate-spin" /> Đang Sáng Tạo...</>
                  ) : (
                    <><Bot className="w-5 h-5" /> Tạo Content {useAI ? 'Bằng AI' : 'Nhanh'}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
          
        {/* Middle Column: Editors */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-md h-full overflow-hidden border border-orange-100">
             {/* Header */}
             <div className="bg-orange-600 p-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-white uppercase font-display">
                  <PenLine className="w-5 h-5 text-white" />
                  Chỉnh Sửa & Copy
                </h2>
             </div>

             {/* Body */}
             <div className="p-6">
                {/* Post Editor */}
                <div className="mb-6">
                   <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold text-slate-700 font-display">1. Caption Bài Viết (Tò Mò)</label>
                      <button
                        onClick={copyPost}
                        className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition-all font-bold font-display ${isPostCopied ? 'bg-green-100 text-green-700 ring-1 ring-green-500' : 'bg-orange-50 text-orange-600 hover:bg-orange-100 ring-1 ring-orange-200'}`}
                      >
                        {isPostCopied ? <><Check className="w-3 h-3"/> Đã chép!</> : <><Copy className="w-3 h-3"/> Sao chép</>}
                      </button>
                   </div>
                   <textarea
                      className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none font-medium text-slate-700 leading-relaxed shadow-inner whitespace-pre-wrap font-body"
                      value={generatedPost}
                      onChange={(e) => setGeneratedPost(e.target.value)}
                      placeholder="Caption ngắn gọn gây tò mò..."
                   ></textarea>
                </div>

                {/* Comment Editor */}
                <div className="mb-6">
                   <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-bold text-slate-700 font-display">2. Seeding Comment (Giải Mã)</label>
                      <button
                        onClick={copyComment}
                        className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition-all font-bold font-display ${isCommentCopied ? 'bg-green-100 text-green-700 ring-1 ring-green-500' : 'bg-orange-50 text-orange-600 hover:bg-orange-100 ring-1 ring-orange-200'}`}
                      >
                        {isCommentCopied ? <><Check className="w-3 h-3"/> Đã chép!</> : <><Copy className="w-3 h-3"/> Sao chép</>}
                      </button>
                   </div>
                   <textarea
                      className="w-full h-64 p-4 bg-orange-50 border border-orange-100 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none font-medium text-slate-700 leading-relaxed shadow-inner whitespace-pre-wrap font-body"
                      value={generatedComment}
                      onChange={(e) => setGeneratedComment(e.target.value)}
                      placeholder="Nội dung comment sẽ xuất hiện ở đây..."
                   ></textarea>
                </div>

                {/* Copy All Button */}
                <button
                  onClick={copyAll}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold font-display py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md transform hover:-translate-y-0.5"
                >
                  {isAllCopied ? <Check className="w-5 h-5"/> : <Layers className="w-5 h-5"/>}
                  Sao Chép Tất Cả (Caption + Comment)
                </button>

             </div>
          </div>
        </div>

        {/* Right Column: Facebook Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden">
            {/* Header */}
            <div className="bg-orange-600 p-4">
               <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase font-display">
                 <Globe className="w-4 h-4 text-white" />
                 Mô phỏng hiển thị Facebook
               </h3>
            </div>
            
            <div className="max-w-md mx-auto w-full">
              {/* FB Header */}
              <div className="p-4 flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold select-none shadow-sm font-display">
                    K
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900 font-display">Khách Hàng Review</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 font-body">
                      Vừa xong <span aria-hidden="true">·</span> <Globe className="w-3 h-3" />
                    </div>
                  </div>
                </div>
                <MoreHorizontal className="text-slate-500 w-5 h-5 cursor-pointer" />
              </div>

              {/* FB POST Content */}
              <div className="px-4 pb-2 text-sm text-slate-900 whitespace-pre-wrap leading-relaxed font-body">
                {generatedPost || "Nội dung bài viết sẽ hiển thị ở đây..."}
              </div>

              {/* Placeholder Image */}
              <div className="w-full h-64 bg-slate-100 flex flex-col items-center justify-center text-slate-400 border-t border-b border-slate-100 select-none bg-gradient-to-br from-slate-50 to-orange-50/50">
                 <div className="text-5xl mb-3 opacity-20">📸</div>
                 <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-display">[Ảnh Sản Phẩm]</span>
              </div>

              {/* FB Stats */}
              <div className="px-4 py-2 flex justify-between items-center border-b border-slate-100 text-xs text-slate-500 select-none font-body">
                 <div className="flex items-center gap-1">
                    <div className="bg-orange-500 rounded-full p-1 text-white"><ThumbsUp className="w-2 h-2 fill-current" /></div>
                    <span>Bạn và 1.2K người khác</span>
                 </div>
                 <div className="flex gap-3">
                    <span>245 bình luận</span>
                    <span>56 chia sẻ</span>
                 </div>
              </div>

              {/* FB Actions */}
              <div className="px-2 py-1 flex justify-between items-center text-slate-500 text-sm font-medium border-b border-slate-200 select-none font-body">
                 <button className="flex-1 py-2 hover:bg-slate-100 rounded-md flex justify-center items-center gap-2 transition-colors">
                    <ThumbsUp className="w-5 h-5" /> Thích
                 </button>
                 <button className="flex-1 py-2 hover:bg-slate-100 rounded-md flex justify-center items-center gap-2 transition-colors">
                    <MessageCircle className="w-5 h-5" /> Bình luận
                 </button>
                 <button className="flex-1 py-2 hover:bg-slate-100 rounded-md flex justify-center items-center gap-2 transition-colors">
                    <Share2 className="w-5 h-5" /> Chia sẻ
                 </button>
              </div>

              {/* FB COMMENT Section (Simulated) */}
              <div className="bg-slate-50 p-4">
                  <div className="text-xs font-semibold text-slate-500 mb-3 select-none font-body">Phù hợp nhất (Bình luận của bạn)</div>
                  <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-orange-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold select-none shadow-sm font-display">K</div>
                      <div className="flex-1">
                          <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 inline-block w-full">
                              <div className="font-semibold text-xs text-slate-900 mb-1 font-display">Khách Hàng Review <span className="text-slate-400 font-normal ml-1">Tác giả</span></div>
                              <div className="text-sm text-slate-800 whitespace-pre-wrap break-words font-body">
                                  {generatedComment || "Nội dung bình luận chứa link sẽ hiển thị ở đây..."}
                              </div>
                          </div>
                          <div className="flex gap-3 mt-1 ml-2 text-xs text-slate-500 font-medium select-none font-body">
                              <span className="cursor-pointer hover:underline hover:text-orange-600">Thích</span>
                              <span className="cursor-pointer hover:underline hover:text-orange-600">Phản hồi</span>
                              <span>1 phút</span>
                          </div>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
