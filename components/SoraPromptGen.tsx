import React, { useState } from 'react';
import { Camera, Sparkles, Copy, Upload, Box, Monitor, Coffee, Diamond, RefreshCw, Zap, Shirt, Leaf, Gift, Mic, MessageSquare, Lamp, Heart, Volume2, MicOff, Check, Video, User } from 'lucide-react';

export const SoraPromptGen: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('tech');
  const [cameraAngle, setCameraAngle] = useState('close-up');
  
  // New States for Gift Box, Voice & Sound
  const [isGiftBox, setIsGiftBox] = useState(false);
  const [hasVoice, setHasVoice] = useState(true); // Toggle Voiceover
  const [voiceGender, setVoiceGender] = useState('female');
  const [voiceRegion, setVoiceRegion] = useState('north');
  const [voiceAge, setVoiceAge] = useState('young');
  const [script, setScript] = useState('');
  
  // Changed to array for multiple selection
  const [selectedSoundEffects, setSelectedSoundEffects] = useState<string[]>(['asmr']); 

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Dữ liệu mẫu cho các phong cách
  const styles: Record<string, any> = {
    tech: {
      id: 'tech',
      name: 'Công Nghệ (Tech)',
      icon: <Monitor className="w-5 h-5" />,
      desc: 'Sạch sẽ, hiện đại, ánh sáng Studio, nền trắng hoặc xám.',
      promptKeywords: 'futuristic, clean, minimal white background, studio lighting, high-tech vibe, metallic reflections, 60fps smooth motion'
    },
    workspace: {
      id: 'workspace',
      name: 'Góc Làm Việc',
      icon: <Lamp className="w-5 h-5" />,
      desc: 'Setup bàn làm việc, đèn RGB/Neon, chill & hiện đại.',
      promptKeywords: 'aesthetic desk setup, RGB lighting background, cozy workspace, soft monitor glow, mechanical keyboard, streamer room vibe, bokeh lights, high quality'
    },
    cute: {
      id: 'cute',
      name: 'Góc Cute (Cute)',
      icon: <Heart className="w-5 h-5" />,
      desc: 'Dễ thương, nhiều đồ decor xinh, màu pastel, ánh sáng trong.',
      promptKeywords: 'kawaii aesthetic desk setup, pastel color palette, cute stationery and plushies background, soft bright diffused lighting, adorable atmosphere, dreamy focus, high resolution'
    },
    cozy: {
      id: 'cozy',
      name: 'Đời Sống (Cozy)',
      icon: <Coffee className="w-5 h-5" />,
      desc: 'Ấm cúng, ánh sáng tự nhiên, nền gỗ hoặc vải.',
      promptKeywords: 'warm morning sunlight, rustic wooden texture, cozy atmosphere, soft shadows, slow relaxing motion, depth of field, organic feel'
    },
    luxury: {
      id: 'luxury',
      name: 'Sang Trọng (Luxury)',
      icon: <Diamond className="w-5 h-5" />,
      desc: 'Huyền bí, nền tối, ánh sáng vàng/bạc, cinematic.',
      promptKeywords: 'dark elegant background, golden bokeh, cinematic rim lighting, luxurious texture, slow motion, jewelry commercial style, 8k resolution'
    },
    fashion: {
      id: 'fashion',
      name: 'Thời Trang',
      icon: <Shirt className="w-5 h-5" />,
      desc: 'Trendy, màu pastel, ánh sáng mềm, chất liệu vải.',
      promptKeywords: 'soft pastel colors background, trendy aesthetic, fashion editorial style, soft diffused lighting, focus on fabric texture, chic vibe, slow cloth movement'
    },
    nature: {
      id: 'nature',
      name: 'Thiên Nhiên',
      icon: <Leaf className="w-5 h-5" />,
      desc: 'Ngoài trời, ánh nắng rực rỡ, nền cỏ cây, tươi mới.',
      promptKeywords: 'outdoor setting, natural bright sunlight, green nature background, lens flare, fresh atmosphere, dynamic handheld feel, travel vlog style, 4k'
    }
  };

  const soundEffects: Record<string, any> = {
    asmr: { label: 'ASMR / Sột soạt', keyword: 'Sound FX: Satisfying ASMR unboxing sounds, cardboard texture sound, paper crinkling, quiet atmosphere.' },
    cute: { label: 'Cute / Đáng yêu', keyword: 'Sound FX: Cute magical sound effects, playful chimes, soft bubbly pops, adorable atmosphere.' },
    ting: { label: 'Ting Ting / Điểm nhấn', keyword: 'Sound FX: Sparkle "ting" sounds for emphasis, notification bells, clean digital sound effects.' },
    upbeat: { label: 'Sôi động / Nhanh', keyword: 'Sound FX: Upbeat background music, energetic whooshes, dynamic transitions.' },
    lofi: { label: 'Thư giãn / Lofi Chill', keyword: 'Sound FX: Soft Lofi hip hop background music, rain sounds, relaxing vibe.' },
  };

  const cameraAngles = [
    { value: 'close-up', label: 'Cận cảnh (Close-up)' },
    { value: 'pov', label: 'Góc nhìn thứ nhất (POV)' },
    { value: 'top-down', label: 'Từ trên xuống (Top-down)' },
    { value: 'macro', label: 'Siêu cận (Macro)' },
  ];

  // Hàm xử lý upload ảnh
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSoundEffect = (key: string) => {
    setSelectedSoundEffects(prev => {
      if (prev.includes(key)) {
        return prev.filter(item => item !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  // Hàm tạo Prompt
  const generatePrompt = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const styleData = styles[selectedStyle];
      
      const baseProduct = productName ? productName : "the product";
      const baseDesc = productDesc ? `, featuring ${productDesc}` : "";
      
      // Xử lý kịch bản mở hộp
      let actionDescription = "";
      if (isGiftBox) {
        actionDescription = `A beautifully wrapped gift box with a satin ribbon sits on the table. Hands gently untie the ribbon and lift the lid to reveal ${baseProduct} inside. The unboxing feels like a surprise reveal.`;
      } else {
        actionDescription = `The hands are unboxing ${baseProduct}'s packaging with smooth, deliberate movements.`;
      }

      // Xử lý thông tin giọng đọc (Audio Prompt)
      const genderMap: Record<string, string> = { male: 'Male', female: 'Female' };
      const regionMap: Record<string, string> = { north: 'Northern Vietnamese', central: 'Central Vietnamese', south: 'Southern Vietnamese' };
      const ageMap: Record<string, string> = { young: 'Gen Z/Young', middle: 'Professional/Adult', old: 'Warm/Elderly' };

      let audioDescription = "";
      
      // 1. Thêm SFX (Gộp tất cả lựa chọn)
      const sfxPrompt = selectedSoundEffects.map(key => soundEffects[key].keyword).join(" ");
      
      // 2. Thêm Voice nếu có
      if (hasVoice) {
         audioDescription = `
      Audio Character: A ${ageMap[voiceAge]} ${genderMap[voiceGender]} voice speaking Vietnamese with a ${regionMap[voiceRegion]} accent. 
      The character is reviewing the product enthusiastically. 
      ${script ? `Spoken lines: "${script}"` : ''}
      ${sfxPrompt}
         `.trim();
      } else {
        audioDescription = `
      Audio: No spoken dialogue.
      ${sfxPrompt}
      Background Audio: Ambient room noise matching the visual style.
        `.trim();
      }

      // Cấu trúc Prompt
      const promptStructure = `
${styleData.promptKeywords}. 
${getCameraDescription(cameraAngle, selectedStyle)}. 
${actionDescription}${baseDesc}. 
Texture quality is photorealistic, highly detailed, sora2 native quality.
--
${audioDescription}
      `.trim().replace(/\s+/g, ' ');

      setGeneratedPrompt(promptStructure);
      setIsGenerating(false);
    }, 800);
  };

  const getCameraDescription = (angle: string, style: string) => {
    switch(angle) {
      case 'pov': return 'First-person POV shot showing human hands';
      case 'top-down': return 'Symmetrical top-down view laying flat';
      case 'macro': return 'Extreme macro shot focusing on texture details';
      default: return 'Cinematic close-up shot at eye level';
    }
  };

  const copyToClipboard = () => {
    const textArea = document.createElement("textarea");
    textArea.value = generatedPrompt;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try { document.execCommand('copy'); } catch (err) { console.error('Lỗi copy', err); }
    document.body.removeChild(textArea);
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 bg-white">
      
      {/* LEFT COLUMN: INPUT FORM */}
      <div className="lg:col-span-8 p-4 lg:p-6 lg:overflow-y-auto custom-scrollbar h-auto">
        <div className="space-y-6 max-w-4xl mx-auto">
          
          {/* Header for Mobile only (hidden on large screens to avoid redundancy with sidebar) */}
          <div className="lg:hidden flex items-center gap-2 mb-4">
             <Video className="text-orange-600" />
             <h2 className="font-display font-bold text-gray-800 text-lg">Sora Video Prompt</h2>
          </div>

          {/* Section 1: Thông tin sản phẩm */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-sm font-display font-bold mb-4 flex items-center gap-2 text-gray-700 uppercase tracking-wide">
              <Upload className="w-4 h-4 text-orange-500" /> 
              1. Thông tin Sản phẩm
            </h2>
            
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                   <div className="relative group cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-orange-400 hover:bg-orange-50 transition-colors bg-gray-50 text-center h-40 flex flex-col justify-center items-center">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {imagePreview ? (
                       <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg p-1" />
                    ) : (
                      <>
                        <div className="bg-white p-3 rounded-full mb-2 shadow-sm">
                            <Upload className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="text-xs font-bold text-gray-500">Tải ảnh sản phẩm</span>
                        <span className="text-[10px] text-gray-400 mt-1">(Tùy chọn để tham khảo)</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-2/3 space-y-3">
                  <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Tên sản phẩm</label>
                      <input 
                        type="text" 
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Ví dụ: Son dưỡng môi, Tai nghe..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-body transition-all"
                      />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-gray-500 mb-1 block">Mô tả đặc điểm</label>
                      <textarea 
                        value={productDesc}
                        onChange={(e) => setProductDesc(e.target.value)}
                        placeholder="Màu sắc, chất liệu, điểm nổi bật..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 h-20 focus:ring-2 focus:ring-orange-500 outline-none resize-none text-sm font-body transition-all"
                      />
                  </div>
                </div>
            </div>
          </div>

          {/* Section 2: Kịch bản & Âm thanh */}
          <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm ring-1 ring-orange-50">
            <h2 className="text-sm font-display font-bold mb-4 flex items-center gap-2 text-gray-700 uppercase tracking-wide">
              <Gift className="w-4 h-4 text-orange-500" /> 
              2. Kịch bản & Âm thanh
            </h2>

            {/* Checkbox Gift Box */}
            <div 
              onClick={() => setIsGiftBox(!isGiftBox)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all mb-5 ${isGiftBox ? 'bg-orange-50 border-orange-500 shadow-sm' : 'bg-white border-gray-200 hover:border-orange-300'}`}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isGiftBox ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'}`}>
                {isGiftBox && <Check className="w-3 h-3 text-white" />}
              </div>
              <div>
                <span className={`font-bold text-sm ${isGiftBox ? 'text-orange-700' : 'text-gray-700'}`}>Mở Hộp Quà (Gift Box Reveal)</span>
                <p className="text-xs text-gray-500">Thay đổi kịch bản thành mở hộp quà thắt nơ bí mật.</p>
              </div>
            </div>

            {/* Audio Settings Wrapper */}
            <div className="space-y-5 border-t border-gray-100 pt-5">
              
              {/* Voice Toggle Switch */}
              <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
                <button
                  onClick={() => setHasVoice(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${hasVoice ? 'bg-white text-orange-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Mic className="w-3 h-3" /> Có Lời Thoại
                </button>
                <button
                  onClick={() => setHasVoice(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${!hasVoice ? 'bg-white text-orange-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <MicOff className="w-3 h-3" /> Chỉ Âm Thanh Nền
                </button>
              </div>

              {/* Sound Effects Selection (Multi-select) */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2">
                   <Volume2 className="w-3 h-3" /> Hiệu ứng âm thanh (Chọn nhiều)
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(soundEffects).map(([key, effect]) => {
                    const isSelected = selectedSoundEffects.includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() => toggleSoundEffect(key)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                          isSelected 
                          ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {effect.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Voice Controls (Conditional) */}
              {hasVoice && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block uppercase">Giới tính</label>
                      <select 
                        value={voiceGender} 
                        onChange={(e) => setVoiceGender(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:border-orange-500 font-body"
                      >
                        <option value="female">Nữ</option>
                        <option value="male">Nam</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block uppercase">Vùng miền</label>
                      <select 
                        value={voiceRegion} 
                        onChange={(e) => setVoiceRegion(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:border-orange-500 font-body"
                      >
                        <option value="north">Miền Bắc</option>
                        <option value="central">Miền Trung</option>
                        <option value="south">Miền Nam</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block uppercase">Độ tuổi</label>
                      <select 
                        value={voiceAge} 
                        onChange={(e) => setVoiceAge(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs outline-none focus:border-orange-500 font-body"
                      >
                        <option value="young">Trẻ (Gen Z)</option>
                        <option value="middle">Trưởng thành</option>
                        <option value="old">Cao tuổi</option>
                      </select>
                    </div>
                  </div>

                  {/* Script Input */}
                  <div className="relative">
                    <MessageSquare className="absolute top-3 left-3 w-4 h-4 text-gray-400" />
                    <textarea
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      placeholder="Nhập câu thoại (VD: 'Em này siêu xinh luôn mọi người ơi')..."
                      className="w-full pl-9 bg-white border border-gray-200 rounded-lg p-2 text-sm h-16 focus:ring-1 focus:ring-orange-500 outline-none resize-none font-body transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Visual Style */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-sm font-display font-bold mb-4 flex items-center gap-2 text-gray-700 uppercase tracking-wide">
              <Camera className="w-4 h-4 text-orange-500" /> 
              3. Phong cách hình ảnh
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
              {Object.values(styles).map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-2 text-center h-24 justify-center ${
                    selectedStyle === style.id 
                    ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm' 
                    : 'bg-white border-gray-200 text-gray-500 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  <div className={`p-2 rounded-full ${selectedStyle === style.id ? 'bg-white' : 'bg-gray-100'}`}>
                    {style.icon}
                  </div>
                  {style.name}
                </button>
              ))}
            </div>
            
             <div className="flex flex-wrap gap-2">
                {cameraAngles.map((angle) => (
                  <button
                    key={angle.value}
                    onClick={() => setCameraAngle(angle.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      cameraAngle === angle.value
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {angle.label}
                  </button>
                ))}
              </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: RESULT (Sticky) */}
      <div className="lg:col-span-4 p-4 lg:p-6 bg-slate-50/50 border-t lg:border-t-0 lg:border-l border-gray-200 h-auto flex flex-col">
          <div className="sticky top-6 flex flex-col gap-4">
             <div className="flex items-center gap-2 mb-1">
                <span className="bg-orange-100 text-orange-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold">3</span>
                <h3 className="font-display font-bold text-gray-700 text-sm uppercase">Kết Quả Prompt</h3>
            </div>

            <button 
                onClick={generatePrompt}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
                {isGenerating ? <RefreshCw className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? 'Đang viết prompt...' : 'Tạo Prompt Hoàn Chỉnh'}
            </button>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-[400px]">
                <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 text-xs flex items-center gap-2 uppercase tracking-wide">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Nội dung Prompt
                    </h3>
                    {generatedPrompt && (
                        <button 
                        onClick={copyToClipboard}
                        className="text-xs bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors font-bold shadow-sm"
                        >
                        <Copy className="w-3 h-3" /> Copy
                        </button>
                    )}
                </div>

                <div className="flex-1 p-4 relative bg-slate-50/30">
                {generatedPrompt ? (
                    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-4">
                            <p className="text-gray-600 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words">
                                {generatedPrompt}
                            </p>
                        </div>
                    
                        <div className="border-t border-gray-200 pt-4">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tóm tắt cấu hình</h4>
                            <div className="space-y-2">
                                <div className="flex items-start gap-2 text-xs text-gray-600">
                                    <Volume2 size={14} className="mt-0.5 text-orange-500"/>
                                    <div>
                                        <span className="font-bold">Chế độ:</span> {hasVoice ? "Voiceover (Có lời)" : "SFX Only (Không lời)"}
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-gray-600">
                                    <Sparkles size={14} className="mt-0.5 text-orange-500"/>
                                    <div>
                                        <span className="font-bold">Hiệu ứng:</span> {selectedSoundEffects.length > 0 ? selectedSoundEffects.map(k => soundEffects[k]?.label.split(" / ")[0]).join(", ") : "None"}
                                    </div>
                                </div>
                                {hasVoice && (
                                    <div className="flex items-start gap-2 text-xs text-gray-600">
                                        <User size={14} className="mt-0.5 text-orange-500"/>
                                        <div>
                                            <span className="font-bold">Giọng đọc:</span> {voiceGender === 'male' ? 'Nam' : 'Nữ'} ({
                                            voiceRegion === 'north' ? 'Bắc' : voiceRegion === 'central' ? 'Trung' : 'Nam'
                                            }) - {voiceAge}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">Chưa có nội dung</p>
                        <p className="text-xs">Điền thông tin và nhấn nút tạo để xem prompt mẫu cho Sora/Veo.</p>
                    </div>
                )}
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};