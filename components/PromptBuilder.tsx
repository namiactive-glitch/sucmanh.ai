
import React, { useState, useEffect } from 'react';
import { Copy, Check, Sparkles, RefreshCw, Video, Clapperboard, Film, User, Banana, Upload, Wand2, X, Lightbulb, ClipboardList, Smartphone, Monitor, Square, LayoutTemplate, Edit3, MessageSquare, ScanEye, Quote, Layers, MonitorPlay, BookOpen, Mic, ListChecks, GitCompare, Layout, Bot, Ratio, CheckCircle2, SplitSquareHorizontal, ListOrdered, FileJson, ArrowRightLeft, FileCheck, GitMerge, Footprints, Palette } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ensureApiKeySelected } from '../services/geminiService';
import { UploadBox } from './UploadBox';
import { ImageAsset } from '../types';
import { fileToBase64 } from '../utils';

const QUOTES_DATA = [
    { text: "Cách duy nhất để làm nên sự nghiệp vĩ đại là yêu lấy những gì bạn đang làm.", author: "Steve Jobs", category: "success", tag: "Thành công" },
    { text: "Cuộc sống là 10% những gì xảy ra với bạn và 90% cách bạn phản ứng với nó.", author: "Charles R. Swindoll", category: "life", tag: "Cuộc sống" },
    { text: "Hãy quay về phía mặt trời và bạn sẽ không thấy bóng tối.", author: "Helen Keller", category: "positive", tag: "Tích cực" },
    { text: "Không có áp lực, không có kim cương.", author: "Thomas Carlyle", category: "motivation", tag: "Động lực" },
    { text: "Hành trình vạn dặm bắt đầu từ một bước chân.", author: "Lão Tử", category: "wisdom", tag: "Triết lý" },
    { text: "Hạnh phúc không phải là đích đến, mà là hành trình chúng ta đang đi.", author: "Souza", category: "happiness", tag: "Hạnh phúc" }
];

const PROMPT_TOPICS = [
    "Sức khỏe & Y tế", "Kinh doanh & Sale", "Marketing & Content", 
    "Phát triển bản thân", "Công nghệ AI", "Tài chính đầu tư", 
    "Làm đẹp & Skincare", "Mẹ và Bé", "Ẩm thực & Nấu ăn",
    "Bất động sản", "Giáo dục & Du học", "Du lịch & Trải nghiệm",
    "Thú cưng", "Nội thất & Decor", "Thời trang"
];

const STYLES = [
    { id: 'viral', name: 'Viral & Sốc (YouTube Thumb)' }, 
    { id: 'realistic', name: 'Chụp ảnh thật (Photorealistic)' }, 
    { id: 'cinematic', name: 'Điện ảnh (Cinematic)' }, 
    { id: 'cartoon', name: 'Hoạt hình 3D (Pixar)' }, 
    { id: 'anime', name: 'Anime Nhật Bản' },
    { id: 'minimalist', name: 'Tối giản (Minimalist)' },
    { id: 'neon', name: 'Cyberpunk / Neon' },
    { id: 'macro', name: 'Cận cảnh (Macro)' },
    { id: 'vintage', name: 'Cổ điển (Vintage)' }
];

const RATIOS = [
    { id: '--ar 16:9', name: '16:9 (Ngang - YouTube)', icon: <Monitor size={14}/> },
    { id: '--ar 9:16', name: '9:16 (Dọc - TikTok)', icon: <Smartphone size={14}/> },
    { id: '--ar 1:1', name: '1:1 (Vuông - Insta)', icon: <Square size={14}/> },
    { id: '--ar 4:5', name: '4:5 (Dọc - Facebook)', icon: <LayoutTemplate size={14}/> },
    { id: '--ar 21:9', name: '21:9 (Điện ảnh)', icon: <Clapperboard size={14}/> }
];

// --- INFO GRAPHIC DATA (UPDATED) ---
const INFO_STYLES = [
    { id: 'viral', name: 'Viral & Sốc', desc: 'Gây chú ý mạnh, tương phản cao, Youtube Thumbnail' },
    { id: 'professional', name: 'Chuyên nghiệp', desc: 'Y tế, Kỹ thuật, Chính xác, Sạch sẽ' },
    { id: '3d', name: 'Hoạt hình 3D', desc: 'Thân thiện, Minh họa nghệ thuật' },
    { id: 'minimalist', name: 'Tối giản', desc: 'Hiện đại, Ít chi tiết, Phẳng' },
    { id: 'vintage', name: 'Vintage (Cổ điển)', desc: 'Hoài cổ, giấy cũ, màu trầm' },
    { id: 'neon', name: 'Neon / Cyberpunk', desc: 'Phát sáng, công nghệ cao, tương lai' },
    { id: 'sketch', name: 'Vẽ phác thảo (Sketch)', desc: 'Nét chì, bảng phấn, giáo dục' }
];

const INFO_LAYOUTS = [
    { id: 'freestyle', name: 'Tự do (Freestyle)', desc: 'AI tự chọn bố cục tối ưu nhất', icon: <Layout size={16}/> },
    { id: 'compare', name: 'So sánh (Compare)', desc: 'Trái/Phải hoặc Trước/Sau', icon: <ArrowRightLeft size={16}/> },
    { id: 'checklist', name: 'Danh sách (Check)', desc: 'Các ý chính + Icon tích xanh', icon: <FileCheck size={16}/> },
    { id: 'steps', name: 'Quy trình (Steps)', desc: 'Các bước 1, 2, 3...', icon: <ListOrdered size={16}/> },
    { id: 'anatomy', name: 'Cấu tạo (Anatomy)', desc: 'Vật thể chính + Chú thích', icon: <SplitSquareHorizontal size={16}/> },
    { id: 'mindmap', name: 'Sơ đồ tư duy', desc: 'Trung tâm tỏa ra các nhánh', icon: <GitMerge size={16}/> }
];

const INFO_RATIOS = [
    { id: '9:16', name: '9:16', desc: 'Dọc', icon: <Smartphone size={16}/> },
    { id: '16:9', name: '16:9', desc: 'Ngang', icon: <Monitor size={16}/> },
    { id: '1:1', name: '1:1', desc: 'Vuông', icon: <Square size={16}/> },
    { id: '4:5', name: '4:5', desc: 'Chân', icon: <LayoutTemplate size={16}/> }
];

// --- VIDEO ACTION STYLES ---
const VIDEO_ACTION_STYLES = [
    { id: 'fashion_runway', name: 'Trình diễn Thời trang (Runway)', prompt: 'walking confidently on a high-fashion runway, camera flashing, audience blurred in background, professional model strut, elegant and powerful' },
    { id: 'street_walk', name: 'Dạo phố (Street Walk)', prompt: 'walking naturally on a sunny modern city street, confident smile, wind blowing through hair, casual lifestyle vibe, street photography style' },
    { id: 'playful', name: 'Vui đùa / Nhảy múa', prompt: 'dancing joyfully or playing around, laughing, dynamic movement, spinning, happy and energetic atmosphere' },
    { id: 'coffee_chill', name: 'Cafe / Thư giãn', prompt: 'sitting at a cozy coffee shop window, sipping coffee, looking outside thoughtfully, soft lighting, relaxed and peaceful' },
    { id: 'working', name: 'Làm việc chuyên nghiệp', prompt: 'working focused on a laptop in a modern glass office, typing, professional business attire, confident leader vibe' },
    { id: 'beauty_shot', name: 'Cận cảnh Beauty (Glamour)', prompt: 'extreme close-up on face, slow motion head turn, beauty lighting, flawless skin texture, hair moving in slow motion, mesmerizing look' },
    { id: 'travel_checkin', name: 'Du lịch / Check-in', prompt: 'standing in front of a beautiful scenic landscape (beach or mountain), holding a camera or phone, looking around in awe, travel vlog style' }
];

const TABS = [
  { id: 'prompts', label: 'Bộ Prompt Ảnh', icon: Layers, colorClass: 'text-orange-600' },
  { id: 'video', label: 'Video Nhân Vật (Veo)', icon: User, colorClass: 'text-amber-600' },
  { id: 'grok_ad', label: 'Grok Ad Speaker', icon: Bot, colorClass: 'text-cyan-600' },
  { id: 'sora_sequence', label: 'Chuỗi Video (Sora Seq)', icon: MonitorPlay, colorClass: 'text-orange-500' },
  { id: 'banana', label: 'Nano Banana Prompter', icon: Banana, colorClass: 'text-yellow-500' },
  { id: 'philosophy', label: 'Triết lý (Philosophy)', icon: BookOpen, colorClass: 'text-amber-700' },
];

interface PromptCardProps { item: any; topic: string; }

const PromptCard: React.FC<PromptCardProps> = ({ item, topic }) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [caption, setCaption] = useState('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [promptContent, setPromptContent] = useState(item.prompt);

  useEffect(() => { setPromptContent(item.prompt); setCaption(''); setCopiedPrompt(false); }, [item.prompt]);

  const generateCaption = async () => {
    setIsGeneratingCaption(true);
    try {
        await ensureApiKeySelected();
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Viết một caption TikTok ngắn, viral cho hình ảnh về chủ đề "${topic}". Nội dung ảnh: ${item.title}. Caption phải thu hút, có call-to-action và hashtag.`;
        // Use gemini-3-flash-preview for text generation
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        setCaption(response.text || "Không thể tạo caption.");
    } catch (e) {
        setCaption("Chia sẻ kiến thức bổ ích... #kienthuc #chiase");
    } finally { setIsGeneratingCaption(false); }
  };

  const handleCopyText = (text: string, type: 'prompt' | 'caption') => {
    navigator.clipboard.writeText(text);
    if (type === 'prompt') { setCopiedPrompt(true); setTimeout(() => setCopiedPrompt(false), 2000); } 
    else { setCopiedCaption(true); setTimeout(() => setCopiedCaption(false), 2000); }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden flex flex-col h-full group hover:border-orange-300">
      <div className="p-4-grow flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold font-display text-orange-600 bg-orange-50 px-2 py-1 rounded uppercase tracking-wider">Phần {item.id}</span>
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1"><Edit3 size={10} /> Sửa nội dung</span>
        </div>
        <h3 className="font-bold font-display text-slate-800 text-sm mb-2 leading-tight">{item.title}</h3>
        {item.posting_advice && (
            <div className="mb-2 bg-amber-50 border border-amber-100 rounded-lg p-2">
                <div className="flex items-start gap-2">
                    <ScanEye size={12} className="text-amber-600 mt-0.5 shrink-0" />
                    <div><span className="text-[9px] font-bold text-amber-700 uppercase block mb-0.5">Lưu ý Safe-Zone:</span><p className="text-[10px] font-body text-amber-800 leading-snug line-clamp-2 hover:line-clamp-none">{item.posting_advice}</p></div>
                </div>
            </div>
        )}
        <div className="mb-2">
          <label className="text-[9px] uppercase font-bold text-slate-400 mb-1 block">Prompt tạo ảnh:</label>
          <textarea value={promptContent} onChange={(e) => setPromptContent(e.target.value)} className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-600 leading-relaxed h-16 overflow-y-auto custom-scrollbar focus:ring-2 focus:ring-orange-200 outline-none resize-none transition-all hover:bg-white" />
          <button onClick={() => handleCopyText(promptContent, 'prompt')} className={`mt-1 w-full py-1 rounded text-[10px] font-medium border flex items-center justify-center gap-1 transition-all ${copiedPrompt ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{copiedPrompt ? <Check size={10}/> : <Copy size={10}/>} {copiedPrompt ? 'Đã copy' : 'Copy'}</button>
        </div>
        {(caption || isGeneratingCaption) && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
             <div className="flex items-center gap-2 mb-1"><label className="text-[9px] uppercase font-bold text-orange-500 block">Caption:</label>{isGeneratingCaption && <RefreshCw size={10} className="animate-spin text-orange-500"/>}</div>
             <textarea value={caption} readOnly className="w-full bg-orange-50/50 p-2 rounded-lg border border-orange-100 font-body text-[11px] text-slate-700 leading-relaxed h-20 overflow-y-auto custom-scrollbar focus:ring-2 focus:ring-orange-200 outline-none resize-none" placeholder="Đang viết caption..." />
             <button onClick={() => handleCopyText(caption, 'caption')} disabled={!caption} className={`mt-1 w-full py-1 rounded text-[10px] font-medium border flex items-center justify-center gap-1 transition-all ${copiedCaption ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50'}`}>{copiedCaption ? <Check size={10}/> : <Copy size={10}/>} {copiedCaption ? 'Đã copy' : 'Copy'}</button>
          </div>
        )}
      </div>
      <div className="p-2 bg-slate-50 border-t border-slate-100">
        <button onClick={generateCaption} className="w-full py-2 rounded-lg font-bold font-display text-xs flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0">{isGeneratingCaption ? <RefreshCw className="animate-spin" size={14} /> : <MessageSquare size={14} />} {caption ? 'Viết lại Caption' : 'Gợi ý Caption'}</button>
      </div>
    </div>
  );
};

export const PromptBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('prompts');
  const [showResultModal, setShowResultModal] = useState(false);
  
  // Prompts Tab
  const [inputText, setInputText] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('viral');
  const [selectedRatio, setSelectedRatio] = useState('--ar 16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<any[]>([]);
  const [isSuggestingIdea, setIsSuggestingIdea] = useState(false);
  const [podcastScript, setPodcastScript] = useState('');
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);

  // Video Tab
  const [videoProductDesc, setVideoProductDesc] = useState('');
  const [videoTotalDuration, setVideoTotalDuration] = useState('30s');
  const [videoStyle, setVideoStyle] = useState('Cinematic');
  const [videoActionStyle, setVideoActionStyle] = useState(VIDEO_ACTION_STYLES[0].id);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoPrompts, setVideoPrompts] = useState<any[]>([]);
  const [veoReferenceImage, setVeoReferenceImage] = useState<ImageAsset | null>(null);
  const [isVeoDescGenerating, setIsVeoDescGenerating] = useState(false);

  // Grok Ad Tab
  const [grokProductName, setGrokProductName] = useState('');
  const [grokProductDesc, setGrokProductDesc] = useState('');
  const [grokPersona, setGrokPersona] = useState('Gen Z "Sành điệu"');
  const [grokTone, setGrokTone] = useState('Hài hước & Bắt trend');
  const [grokResult, setGrokResult] = useState('');
  const [isGrokGenerating, setIsGrokGenerating] = useState(false);

  // Banana Tab
  const [charImage, setCharImage] = useState<string | null>(null); // preview url
  const [prodImage, setProdImage] = useState<string | null>(null); // preview url
  const [isBananaGenerating, setIsBananaGenerating] = useState(false);
  const [generatedBananaPrompt, setGeneratedBananaPrompt] = useState("");
  const [bananaError, setBananaError] = useState("");
  const [bananaStylePreset, setBananaStylePreset] = useState("realistic");
  const [bananaTriggerWord, setBananaTriggerWord] = useState("");
  const [bananaAspectRatio, setBananaAspectRatio] = useState("--ar 2:3");

  // Philosophy (Infographic) Tab
  const [currentQuote, setCurrentQuote] = useState<any>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [philosophyConfig, setPhilosophyConfig] = useState({style: 'viral', layout: 'freestyle', ratio: '9:16'});
  const [generatedQuotePrompt, setGeneratedQuotePrompt] = useState('');
  const [isQuotePromptGenerating, setIsQuotePromptGenerating] = useState(false);

  // Sora Tab
  const [soraSeqImage, setSoraSeqImage] = useState<ImageAsset | null>(null);
  const [isSoraSeqAnalyzing, setIsSoraSeqAnalyzing] = useState(false);
  const [soraSeqDescription, setSoraSeqDescription] = useState("");
  const [soraSeqClipDuration, setSoraSeqClipDuration] = useState("8s");
  const [soraSeqVideoStyle, setSoraSeqVideoStyle] = useState("cinematic");
  const [soraSeqPlatform, setSoraSeqPlatform] = useState("tiktok");
  const [soraSeqPromptsList, setSoraSeqPromptsList] = useState<any[]>([]);
  const [isSoraSeqGeneratingPrompts, setIsSoraSeqGeneratingPrompts] = useState(false);

  // Constants for Veo/Grok (Local)
  const videoStyles = ["Review chân thực", "TVC", "Cinematic", "Hoạt hình 3D", "Documentary", "Vlog Handheld"];
  const veoClipDurations = ["15s", "30s", "45s", "60s"];
  const grokPersonas = [
      "Gen Z 'Sành điệu' (Ngôn ngữ TikTok)",
      "Chuyên gia uy tín (Bác sĩ/Kỹ sư)",
      "Người bạn thân thiện (Tâm sự)",
      "CEO Khởi nghiệp (Truyền cảm hứng)",
      "Bà hàng xóm (Hài hước/Bình dân)"
  ];
  const grokTones = [
      "Hài hước & Bắt trend",
      "Nghiêm túc & Tin cậy",
      "Sôi nổi & Năng lượng",
      "Nhẹ nhàng & Chữa lành",
      "Gay gắt & Drama"
  ];

  // --- Logic Functions ---
  const generatePrompts = async () => {
      if (!inputText.trim()) return;
      setIsGenerating(true);
      setGeneratedPrompts([]);
      try {
          await ensureApiKeySelected();
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          const selectedStyleObj = STYLES.find(s => s.id === selectedStyle);
          const selectedRatioObj = RATIOS.find(r => r.id === selectedRatio);

          const prompt = `
          Đóng vai chuyên gia Prompt Engineering (Midjourney/Flux).
          Nhiệm vụ: Viết 4 prompt tạo ảnh khác nhau cho chủ đề: "${inputText}".
          Mô tả chi tiết bổ sung: ${description}.
          Phong cách nghệ thuật: ${selectedStyleObj?.name || 'Chuyên nghiệp'}.
          Tỉ lệ khung hình (Aspect Ratio): ${selectedRatioObj?.id || '--ar 16:9'}.

          Yêu cầu Output:
          - Trả về kết quả dưới dạng JSON Array thuần túy (Không dùng Markdown, không code block).
          - Cấu trúc JSON: 
            [
              { 
                "id": 1, 
                "title": "Tiêu đề ngắn gọn cho ảnh 1", 
                "prompt": "Prompt tiếng Anh chi tiết, bao gồm subject, lighting, style, camera angle, và tham số ${selectedRatioObj?.id || '--ar 16:9'} ở cuối", 
                "posting_advice": "Lời khuyên ngắn về bố cục text (safe zone) khi thiết kế trên ảnh này" 
              },
              ... (tương tự cho 3 ảnh còn lại)
            ]
          `;
          
          // Use gemini-3-flash-preview for text tasks
          const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
          
          try {
             let text = response.text || "";
             // Clean up markdown if present
             text = text.replace(/```json/g, '').replace(/```/g, '').trim();
             
             const jsonMatch = text.match(/\[.*\]/s);
             if (jsonMatch) {
                 setGeneratedPrompts(JSON.parse(jsonMatch[0]));
             } else {
                 // Fallback parsing or error
                 console.warn("Raw text not JSON array:", text);
                 setGeneratedPrompts([{id:1, title:'Kết quả (Raw)', prompt: text, posting_advice: 'Kiểm tra lại format'}]);
             }
          } catch(e) {
             console.error("JSON Parse Error", e);
             setGeneratedPrompts([{id:1, title:'Lỗi xử lý', prompt: response.text || "Không thể phân tích phản hồi từ AI.", posting_advice: ''}]);
          }
          setShowResultModal(true);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleSuggestIdea = async () => {
      setIsSuggestingIdea(true);
      try {
        await ensureApiKeySelected();
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // Use gemini-3-flash-preview for text tasks
        const res = await ai.models.generateContent({model:'gemini-3-flash-preview', contents: "Gợi ý 1 chủ đề hot trend TikTok hôm nay để làm infographic. Chỉ trả về tên chủ đề ngắn gọn, không dấu ngoặc kép."});
        setInputText(res.text?.trim() || "Chủ đề Hot");
      } catch(e) {}
      setIsSuggestingIdea(false);
  };

  const generatePodcastScript = async () => {
      setIsGeneratingPodcast(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        // Use gemini-3-flash-preview for text tasks
        const res = await ai.models.generateContent({model:'gemini-3-flash-preview', contents: `Viết kịch bản podcast ngắn 30s về chủ đề: ${inputText}. Giọng văn thân thiện, chia sẻ.`});
        setPodcastScript(res.text || "");
      } catch(e) {}
      setIsGeneratingPodcast(false);
  };

  const handleVeoImageUpload = async (file: File) => {
      try {
          const base64 = await fileToBase64(file);
          setVeoReferenceImage({
              id: 'veo-ref', file, previewUrl: URL.createObjectURL(file), base64: base64.split(',')[1], mimeType: file.type
          });
      } catch (e) { console.error(e); }
  };

  const generateVeoDescriptionFromImage = async () => {
      if(!veoReferenceImage) return;
      setIsVeoDescGenerating(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const parts = [{text: "Mô tả chi tiết ngoại hình nhân vật trong ảnh này để làm prompt video. Tập trung vào khuôn mặt, tóc, quần áo."}, {inlineData: {data: veoReferenceImage.base64, mimeType: veoReferenceImage.mimeType}}];
        // For vision tasks (image input, text output), use gemini-3-flash-preview
        const res = await ai.models.generateContent({model:'gemini-3-flash-preview', contents: {parts}});
        setVideoProductDesc(res.text || "");
      } catch(e) {}
      setIsVeoDescGenerating(false);
  };

  const generateVideoPrompts = async () => {
      setIsVideoGenerating(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const selectedAction = VIDEO_ACTION_STYLES.find(s => s.id === videoActionStyle);
        const actionContext = selectedAction ? `${selectedAction.name} - ${selectedAction.prompt}` : "General movement";
        
        const prompt = `Viết kịch bản 3 phân cảnh video ngắn cho Veo/Sora. 
        Mô tả nhân vật: ${videoProductDesc}.
        Hành động cụ thể (Action Context): ${actionContext}.
        Phong cách quay (Camera Style): ${videoStyle}. 
        Thời lượng: ${videoTotalDuration}.
        Yêu cầu: Các phân cảnh phải mô tả nhân vật thực hiện hành động "${selectedAction?.name}" một cách tự nhiên.
        Output JSON only: [{scene_name, description, prompt}]`;
        
        // Use gemini-3-flash-preview for text tasks
        const res = await ai.models.generateContent({model:'gemini-3-flash-preview', contents: prompt});
        const jsonMatch = res.text?.match(/\[.*\]/s);
        setVideoPrompts(jsonMatch ? JSON.parse(jsonMatch[0]) : []);
        setShowResultModal(true);
      } catch(e) {}
      setIsVideoGenerating(false);
  };

  const handleBananaImageUpload = async (file: File, type: 'char' | 'prod') => {
      const url = URL.createObjectURL(file);
      if (type === 'char') setCharImage(url);
      else setProdImage(url);
  };

  const generateBananaPrompt = async () => {
      setIsBananaGenerating(true);
      setBananaError("");
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `Create a stable diffusion prompt using trigger word "${bananaTriggerWord}".
          Style: ${bananaStylePreset}. Aspect Ratio: ${bananaAspectRatio}.
          Combine a character and a product context.`;
          // Use gemini-3-flash-preview for text tasks
          const res = await ai.models.generateContent({model:'gemini-3-flash-preview', contents: prompt});
          setGeneratedBananaPrompt(res.text || "");
          setShowResultModal(true);
      } catch(e) { setBananaError("Lỗi tạo prompt"); }
      setIsBananaGenerating(false);
  };

  const generateQuote = async () => {
      setIsQuoteLoading(true);
      const random = QUOTES_DATA[Math.floor(Math.random() * QUOTES_DATA.length)];
      setTimeout(() => { setCurrentQuote(random); setIsQuoteLoading(false); }, 500);
  };

  const handleGenerateQuotePrompt = async () => {
      if (!currentQuote) {
          alert("Vui lòng chọn một câu trích dẫn trước.");
          return;
      }
      setIsQuotePromptGenerating(true);
      setGeneratedQuotePrompt('');
      try {
          const selectedStyle = INFO_STYLES.find(s => s.id === philosophyConfig.style);
          const selectedLayout = INFO_LAYOUTS.find(l => l.id === philosophyConfig.layout);
          const selectedRatio = INFO_RATIOS.find(r => r.id === philosophyConfig.ratio);

          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `
          Đóng vai chuyên gia Graphic Designer & Prompt Engineer (cho các mô hình như Ideogram, Imagen 3, Midjourney v6).
          
          NHIỆM VỤ: Viết 1 PROMPT TIẾNG ANH chi tiết để tạo hình ảnh INFOGRAPHIC/TYPOGRAPHY ART chất lượng cao.
          
          DỮ LIỆU ĐẦU VÀO:
          - Nội dung chữ (Text Content): "${currentQuote.text}"
          - Phong cách Visual (Style): ${selectedStyle?.name} (${selectedStyle?.desc})
          - Bố cục (Concept/Layout): ${selectedLayout?.name} (${selectedLayout?.desc})
          - Tỉ lệ: ${selectedRatio?.id}
          
          YÊU CẦU QUAN TRỌNG VỀ TEXT (CHỮ TRÊN ẢNH):
          1. BẮT BUỘC: Prompt phải yêu cầu AI render chính xác dòng chữ tiếng Việt: "${currentQuote.text}".
          2. VIETNAMESE CHARACTERS: Nhấn mạnh rằng text phải là "Tiếng Việt chuẩn có dấu" (Accurate Vietnamese with correct diacritics/accents).
          3. NO AUTHOR/ALIAS: Tuyệt đối KHÔNG yêu cầu AI ghi tên tác giả (${currentQuote.author}) hay bất kỳ bí danh nào lên ảnh. Chỉ hiển thị nội dung trích dẫn.
          4. TYPOGRAPHY: Mô tả font chữ to, rõ ràng, dễ đọc, nghệ thuật, phù hợp với phong cách "${selectedStyle?.name}". Text phải là tâm điểm (focal point).
          5. SPELLING: Yêu cầu "Correct spelling, no typos".
          
          YÊU CẦU VỀ HÌNH ẢNH & BỐ CỤC:
          - Layout: Thiết kế theo dạng ${selectedLayout?.name}. Ví dụ: Nếu là "So sánh" thì chia đôi màn hình. Nếu là "Danh sách" thì có các gạch đầu dòng.
          - Visuals: Hình ảnh minh họa ẩn dụ, tinh tế, hỗ trợ cho ý nghĩa câu nói.
          - Quality: High resolution, professional graphic design, 8k, vector art style or photorealistic (tùy style).
          
          OUTPUT: Chỉ trả về nội dung PROMPT tiếng Anh (bao gồm cả phần text instruction). Không thêm lời dẫn.
          `;
          
          // Use gemini-3-flash-preview for text tasks
          const res = await ai.models.generateContent({model:'gemini-3-flash-preview', contents: prompt});
          setGeneratedQuotePrompt(res.text || "Lỗi tạo prompt.");
          setShowResultModal(true);
      } catch (e) {
          console.error(e);
          alert("Lỗi khi gọi AI.");
      } finally {
          setIsQuotePromptGenerating(false);
      }
  };

  const handleSoraSeqImageUpload = async (file: File) => {
    try {
        const base64 = await fileToBase64(file);
        setSoraSeqImage({
            id: 'sora-ref', file, previewUrl: URL.createObjectURL(file), base64: base64.split(',')[1], mimeType: file.type
        });
    } catch (e) { console.error(e); }
  };

  const handleSoraSeqGeneratePrompt = async () => {
      if(!soraSeqDescription) return;
      setIsSoraSeqGeneratingPrompts(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Tạo chuỗi 3 prompt video liên tiếp (Sequence) cho Sora/Kling.
        Cốt truyện: ${soraSeqDescription}.
        Platform: ${soraSeqPlatform}. Style: ${soraSeqVideoStyle}.
        Output JSON: [{title, script_segment, visual_prompt}]`;
        // Use gemini-3-flash-preview for text tasks
        const res = await ai.models.generateContent({model:'gemini-3-flash-preview', contents: prompt});
        const jsonMatch = res.text?.match(/\[.*\]/s);
        setSoraSeqPromptsList(jsonMatch ? JSON.parse(jsonMatch[0]) : []);
        setShowResultModal(true);
      } catch(e) {}
      setIsSoraSeqGeneratingPrompts(false);
  };

  const handleGenerateGrokPrompt = async () => {
      if (!grokProductName) return;
      setIsGrokGenerating(true);
      setGrokResult("");
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const prompt = `
          Đóng vai chuyên gia Prompt Engineering.
          Hãy viết một PROMPT (câu lệnh) chi tiết và tối ưu nhất để người dùng nhập vào AI (như Grok, ChatGPT, Claude) nhằm tạo ra một kịch bản video ngắn.
          
          Thông tin đầu vào cho Prompt này:
          - Sản phẩm: ${grokProductName}
          - Mô tả sản phẩm: ${grokProductDesc}
          - Nhân vật đóng vai: ${grokPersona}
          - Giọng điệu/Tone: ${grokTone}
          
          Yêu cầu đối với PROMPT bạn viết ra:
          1. Phải hướng dẫn AI đích (Grok) đóng vai nhân vật cực kỳ nhập tâm.
          2. Yêu cầu AI đích viết lời thoại độc thoại (monologue) bằng TIẾNG VIỆT tự nhiên, đời thường, không văn mẫu.
          3. Kịch bản phải ngắn gọn (30-60s), có mở đầu thu hút và kết thúc kêu gọi hành động.
          4. Chỉ trả về nội dung của Prompt đó (để người dùng copy).
          `;
          // Use gemini-3-flash-preview for text tasks
          const res = await ai.models.generateContent({model:'gemini-3-flash-preview', contents: prompt});
          setGrokResult(res.text || "Lỗi tạo prompt.");
      } catch (e) {
          console.error(e);
          setGrokResult("Không thể tạo prompt lúc này.");
      } finally {
          setIsGrokGenerating(false);
      }
  };
  const renderPromptsTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-100">
              <Layers className="text-white" size={20} />
            </div>
            Thiết kế Bộ Prompt Ảnh (Midjourney/Flux)
          </h2>
          <span className="text-[10px] bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-black uppercase border border-orange-200">Pro Version</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chủ đề chính (Topic)</label>
                <button 
                  onClick={handleSuggestIdea}
                  disabled={isSuggestingIdea}
                  className="text-[10px] font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 disabled:opacity-30"
                >
                  {isSuggestingIdea ? <RefreshCw size={10} className="animate-spin" /> : <Wand2 size={10} />} Gợi ý chủ đề
                </button>
              </div>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="VD: Cô gái Việt Nam mặc áo dài, Robot tương lai..." 
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-50 focus:border-orange-400 outline-none text-sm font-bold transition-all" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả chi tiết bổ sung (Optional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: Ánh sáng hoàng hôn, phong cách nghệ thuật, chi tiết trang phục..." 
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-50 focus:border-orange-400 outline-none text-sm font-medium transition-all h-24 resize-none" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phong cách nghệ thuật</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button 
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={`px-3 py-2.5 rounded-xl border-2 text-left transition-all ${selectedStyle === s.id ? 'border-orange-500 bg-orange-50' : 'border-slate-50 hover:border-orange-200'}`}
                  >
                    <div className="text-[10px] font-black uppercase leading-tight text-slate-700">{s.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tỉ lệ khung hình</label>
              <div className="grid grid-cols-3 gap-2">
                {RATIOS.map((r) => (
                  <button 
                    key={r.id}
                    onClick={() => setSelectedRatio(r.id)}
                    className={`px-3 py-2 rounded-xl border-2 text-left transition-all flex flex-col items-center justify-center gap-1 ${selectedRatio === r.id ? 'border-orange-500 bg-orange-50' : 'border-slate-50 hover:border-orange-200'}`}
                  >
                    <div className="text-orange-500">{r.icon}</div>
                    <div className="text-[9px] font-black uppercase text-slate-700">{r.id.replace('--ar ', '')}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={generatePrompts}
          disabled={isGenerating || !inputText}
          className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-100 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
          {isGenerating ? 'Đang thiết kế bộ prompt...' : 'Tạo Bộ 4 Prompt Chuyên Nghiệp'}
        </button>
      </div>

      {generatedPrompts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {generatedPrompts.map((item) => (
            <PromptCard key={item.id} item={item} topic={inputText} />
          ))}
        </div>
      )}
    </div>
  );

  const renderVideoTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-100">
              <User className="text-white" size={20} />
            </div>
            Tạo Video Nhân Vật (Veo/Sora)
          </h2>
          <span className="text-[10px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-black uppercase border border-amber-200">Video AI</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ảnh nhân vật tham chiếu (Optional)</label>
              <UploadBox onUpload={handleVeoImageUpload} />
              {veoReferenceImage && (
                <div className="mt-2 flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <img src={veoReferenceImage.previewUrl} className="w-12 h-12 rounded-lg object-cover" alt="Ref" />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-600 truncate">{veoReferenceImage.file.name}</p>
                    <button onClick={generateVeoDescriptionFromImage} disabled={isVeoDescGenerating} className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-1 hover:underline">
                      {isVeoDescGenerating ? <RefreshCw size={10} className="animate-spin" /> : <ScanEye size={10} />} Phân tích ảnh
                    </button>
                  </div>
                  <button onClick={() => setVeoReferenceImage(null)} className="p-1 text-slate-400 hover:text-red-500"><X size={14}/></button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả nhân vật & Bối cảnh</label>
              <textarea 
                value={videoProductDesc}
                onChange={(e) => setVideoProductDesc(e.target.value)}
                placeholder="Mô tả chi tiết nhân vật, trang phục, gương mặt..." 
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-amber-50 focus:border-amber-400 outline-none text-sm font-medium transition-all h-32 resize-none" 
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thời lượng</label>
                <select value={videoTotalDuration} onChange={(e) => setVideoTotalDuration(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-amber-400">
                  {veoClipDurations.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phong cách quay</label>
                <select value={videoStyle} onChange={(e) => setVideoStyle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-amber-400">
                  {videoStyles.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hành động của nhân vật</label>
              <div className="grid grid-cols-1 gap-2">
                {VIDEO_ACTION_STYLES.map((s) => (
                  <button 
                    key={s.id}
                    onClick={() => setVideoActionStyle(s.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${videoActionStyle === s.id ? 'border-amber-500 bg-amber-50' : 'border-slate-50 hover:border-amber-200'}`}
                  >
                    <span className="text-[11px] font-black uppercase text-slate-700">{s.name}</span>
                    {videoActionStyle === s.id && <CheckCircle2 size={14} className="text-amber-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={generateVideoPrompts}
          disabled={isVideoGenerating || !videoProductDesc}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-100 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isVideoGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Clapperboard size={20} />}
          {isVideoGenerating ? 'Đang lên kịch bản...' : 'Tạo Kịch Bản Video Veo/Sora'}
        </button>
      </div>

      {videoPrompts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videoPrompts.map((scene, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-4 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Cảnh {i+1}: {scene.scene_name}</span>
                <button onClick={() => navigator.clipboard.writeText(scene.prompt)} className="p-1.5 text-amber-600 hover:bg-white rounded-lg transition-all"><Copy size={14}/></button>
              </div>
              <div className="p-5 flex-1 space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Nội dung cảnh:</label>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{scene.description}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Video Prompt:</label>
                  <div className="bg-slate-900 rounded-xl p-3 font-mono text-[10px] text-amber-400 leading-relaxed">
                    {scene.prompt}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderGrokTab = () => (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-cyan-100 p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <div className="bg-cyan-500 p-2 rounded-xl shadow-lg shadow-cyan-100">
              <Bot className="text-white" size={20} />
            </div>
            Grok Ad Speaker Prompt
          </h2>
          <span className="text-[10px] bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full font-black uppercase border border-cyan-200">AI Scripting</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên Sản Phẩm</label>
              <input 
                type="text" 
                value={grokProductName}
                onChange={(e) => setGrokProductName(e.target.value)}
                placeholder="VD: Kem chống nắng, Khóa học AI..." 
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-cyan-50 focus:border-cyan-400 outline-none text-sm font-bold transition-all" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả / Key Selling Points</label>
              <textarea 
                value={grokProductDesc}
                onChange={(e) => setGrokProductDesc(e.target.value)}
                placeholder="VD: Chống nước, nâng tone, giá rẻ..." 
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-cyan-50 focus:border-cyan-400 outline-none text-sm font-medium transition-all h-32 resize-none" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nhân vật đóng vai (Persona)</label>
              <select value={grokPersona} onChange={(e) => setGrokPersona(e.target.value)} className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-bold outline-none focus:border-cyan-400">
                {grokPersonas.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Giọng điệu (Tone)</label>
              <select value={grokTone} onChange={(e) => setGrokTone(e.target.value)} className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-sm font-bold outline-none focus:border-cyan-400">
                {grokTones.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button 
          onClick={handleGenerateGrokPrompt}
          disabled={isGrokGenerating || !grokProductName}
          className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-cyan-100 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGrokGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
          {isGrokGenerating ? 'Đang tạo prompt...' : 'Tạo Prompt Cho Grok'}
        </button>

        {grokResult && (
          <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kết quả Prompt (Copy vào Grok/ChatGPT)</h3>
              <button onClick={() => navigator.clipboard.writeText(grokResult)} className="text-[10px] font-black text-cyan-600 uppercase flex items-center gap-1 hover:underline"><Copy size={12}/> Sao chép</button>
            </div>
            <div className="bg-slate-900 rounded-[2rem] p-8 font-mono text-sm text-cyan-400 leading-relaxed shadow-2xl border border-cyan-900/50">
              {grokResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderBananaTab = () => (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-yellow-100 p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <div className="bg-yellow-500 p-2 rounded-xl shadow-lg shadow-yellow-100">
              <Banana className="text-white" size={20} />
            </div>
            Nano Banana Prompter
          </h2>
          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-black uppercase border border-yellow-200">Stable Diffusion</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ảnh Nhân Vật & Sản Phẩm</label>
            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => document.getElementById('char-upload')?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 transition-all overflow-hidden">
                {charImage ? <img src={charImage} className="w-full h-full object-cover" alt="Char" /> : <div className="text-center"><User className="mx-auto text-slate-300 mb-1" size={24}/><p className="text-[9px] font-black text-slate-400 uppercase">Nhân vật</p></div>}
                <input id="char-upload" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleBananaImageUpload(e.target.files[0], 'char')} />
              </div>
              <div onClick={() => document.getElementById('prod-upload')?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 transition-all overflow-hidden">
                {prodImage ? <img src={prodImage} className="w-full h-full object-cover" alt="Prod" /> : <div className="text-center"><Smartphone className="mx-auto text-slate-300 mb-1" size={24}/><p className="text-[9px] font-black text-slate-400 uppercase">Sản phẩm</p></div>}
                <input id="prod-upload" type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleBananaImageUpload(e.target.files[0], 'prod')} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trigger Word (Từ khóa kích hoạt)</label>
              <input type="text" value={bananaTriggerWord} onChange={(e) => setBananaTriggerWord(e.target.value)} placeholder="VD: v3_style, lora_name..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-yellow-400" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Style Preset</label>
              <select value={bananaStylePreset} onChange={(e) => setBananaStylePreset(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-yellow-400">
                <option value="realistic">Realistic (Ảnh thật)</option>
                <option value="anime">Anime / Manga</option>
                <option value="3d_render">3D Render (Octane)</option>
                <option value="oil_painting">Sơn dầu (Oil Painting)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tỉ lệ (Aspect Ratio)</label>
              <select value={bananaAspectRatio} onChange={(e) => setBananaAspectRatio(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:border-yellow-400">
                <option value="--ar 2:3">2:3 (Chân dung)</option>
                <option value="--ar 3:2">3:2 (Ngang)</option>
                <option value="--ar 1:1">1:1 (Vuông)</option>
                <option value="--ar 9:16">9:16 (TikTok)</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          onClick={generateBananaPrompt}
          disabled={isBananaGenerating || !bananaTriggerWord}
          className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-yellow-100 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isBananaGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Wand2 size={20} />}
          {isBananaGenerating ? 'Đang phân tích...' : 'Tạo Prompt Banana'}
        </button>
      </div>
    </div>
  );

  const renderPhilosophyTab = () => (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-amber-100 overflow-hidden">
        <div className="p-8 bg-gradient-to-r from-amber-700 to-amber-900 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
              <BookOpen className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black uppercase tracking-tight">Triết Lý & Infographic AI</h2>
              <p className="text-xs text-amber-200 font-bold uppercase tracking-widest mt-1">Biến câu nói hay thành tác phẩm nghệ thuật</p>
            </div>
          </div>
          <button 
            onClick={generateQuote}
            disabled={isQuoteLoading}
            className="px-8 py-4 bg-white text-amber-900 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-amber-50 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            {isQuoteLoading ? <RefreshCw className="animate-spin" size={18} /> : <Quote size={18} />} Lấy câu trích dẫn mới
          </button>
        </div>

        <div className="p-8 lg:p-12">
          {currentQuote ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7 space-y-8">
                <div className="relative">
                  <Quote className="absolute -top-6 -left-6 text-amber-100" size={80} />
                  <div className="relative z-10 space-y-6">
                    <p className="text-3xl font-display font-black text-slate-800 leading-tight italic">
                      "{currentQuote.text}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="h-px w-12 bg-amber-300"></div>
                      <span className="text-lg font-bold text-amber-700">{currentQuote.author}</span>
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase border border-amber-100">{currentQuote.tag}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Palette size={14} /> Cấu hình Infographic
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phong cách</label>
                      <div className="space-y-2">
                        {INFO_STYLES.map(s => (
                          <button 
                            key={s.id}
                            onClick={() => setPhilosophyConfig({...philosophyConfig, style: s.id})}
                            className={`w-full p-3 rounded-xl border-2 text-left transition-all ${philosophyConfig.style === s.id ? 'border-amber-500 bg-white shadow-md' : 'border-transparent hover:bg-white'}`}
                          >
                            <div className="text-[11px] font-black text-slate-800 uppercase">{s.name}</div>
                            <div className="text-[9px] text-slate-400 font-medium leading-tight">{s.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bố cục (Layout)</label>
                      <div className="space-y-2">
                        {INFO_LAYOUTS.map(l => (
                          <button 
                            key={l.id}
                            onClick={() => setPhilosophyConfig({...philosophyConfig, layout: l.id})}
                            className={`w-full p-3 rounded-xl border-2 text-left transition-all ${philosophyConfig.layout === l.id ? 'border-amber-500 bg-white shadow-md' : 'border-transparent hover:bg-white'}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-amber-600">{l.icon}</span>
                              <span className="text-[11px] font-black text-slate-800 uppercase">{l.name}</span>
                            </div>
                            <div className="text-[9px] text-slate-400 font-medium leading-tight">{l.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tỉ lệ</label>
                      <div className="space-y-2">
                        {INFO_RATIOS.map(r => (
                          <button 
                            key={r.id}
                            onClick={() => setPhilosophyConfig({...philosophyConfig, ratio: r.id})}
                            className={`w-full p-3 rounded-xl border-2 text-left transition-all ${philosophyConfig.ratio === r.id ? 'border-amber-500 bg-white shadow-md' : 'border-transparent hover:bg-white'}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-amber-600">{r.icon}</span>
                              <span className="text-[11px] font-black text-slate-800 uppercase">{r.name}</span>
                            </div>
                            <div className="text-[9px] text-slate-400 font-medium leading-tight">{r.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleGenerateQuotePrompt}
                    disabled={isQuotePromptGenerating}
                    className="w-full py-5 bg-gradient-to-r from-amber-700 to-amber-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isQuotePromptGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {isQuotePromptGenerating ? 'Đang thiết kế prompt...' : 'Tạo Prompt Infographic Nghệ Thuật'}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-800 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">AI Prompt Result</span>
                    {generatedQuotePrompt && (
                      <button 
                        onClick={() => navigator.clipboard.writeText(generatedQuotePrompt)}
                        className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                      >
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    {generatedQuotePrompt ? (
                      <div className="space-y-6">
                        <div className="font-mono text-sm text-slate-300 leading-relaxed">
                          {generatedQuotePrompt}
                        </div>
                        <div className="pt-6 border-t border-white/10 space-y-4">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Gợi ý sử dụng:</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                              <p className="text-[10px] font-black text-amber-500 uppercase mb-1">Ideogram</p>
                              <p className="text-[9px] text-slate-400 leading-tight">Tốt nhất cho việc render chữ chính xác.</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                              <p className="text-[10px] font-black text-orange-500 uppercase mb-1">Midjourney</p>
                              <p className="text-[9px] text-slate-400 leading-tight">Tốt nhất cho phong cách nghệ thuật, trừu tượng.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-4 opacity-30">
                        <Sparkles size={48} className="text-white mx-auto" />
                        <p className="text-xs font-black text-white uppercase tracking-widest">Chưa có prompt</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center">
                <Quote className="text-amber-200" size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-display font-black text-slate-300 uppercase tracking-tight">Cảm hứng đang chờ bạn</h3>
                <p className="text-sm text-slate-400 max-w-xs">Nhấn nút "Lấy câu trích dẫn mới" để bắt đầu hành trình sáng tạo.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSoraSeqTab = () => (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-display font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-100">
              <MonitorPlay className="text-white" size={20} />
            </div>
            Sora Sequence (Chuỗi Video)
          </h2>
          <span className="text-[10px] bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-black uppercase border border-orange-200">Video Storytelling</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ảnh tham chiếu phong cách (Optional)</label>
              <UploadBox onUpload={handleSoraSeqImageUpload} />
              {soraSeqImage && (
                <div className="mt-2 flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <img src={soraSeqImage.previewUrl} className="w-12 h-12 rounded-lg object-cover" alt="Ref" />
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-600 truncate">{soraSeqImage.file.name}</p>
                  </div>
                  <button onClick={() => setSoraSeqImage(null)} className="p-1 text-slate-400 hover:text-red-500"><X size={14}/></button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cốt truyện / Ý tưởng video</label>
              <textarea 
                value={soraSeqDescription}
                onChange={(e) => setSoraSeqDescription(e.target.value)}
                placeholder="VD: Một phi hành gia lạc trên hành tinh kẹo ngọt, khám phá những ngọn núi socola..." 
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-orange-50 focus:border-orange-400 outline-none text-sm font-medium transition-all h-32 resize-none" 
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thời lượng mỗi clip</label>
                <select value={soraSeqClipDuration} onChange={(e) => setSoraSeqClipDuration(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold outline-none">
                  <option value="5s">5 giây</option>
                  <option value="8s">8 giây</option>
                  <option value="10s">10 giây</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nền tảng</label>
                <select value={soraSeqPlatform} onChange={(e) => setSoraSeqPlatform(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold outline-none">
                  <option value="tiktok">TikTok / Reels</option>
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phong cách video</label>
              <div className="grid grid-cols-2 gap-2">
                {['cinematic', 'anime', '3d_animation', 'vintage', 'realistic', 'cyberpunk'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSoraSeqVideoStyle(s)}
                    className={`px-3 py-2 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${soraSeqVideoStyle === s ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-50 text-slate-400 hover:border-orange-200'}`}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSoraSeqGeneratePrompt}
          disabled={isSoraSeqGeneratingPrompts || !soraSeqDescription}
          className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-100 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSoraSeqGeneratingPrompts ? <RefreshCw className="animate-spin" size={20} /> : <MonitorPlay size={20} />}
          {isSoraSeqGeneratingPrompts ? 'Đang lên kịch bản chuỗi...' : 'Tạo Chuỗi 3 Prompt Video Sora'}
        </button>
      </div>

      {soraSeqPromptsList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {soraSeqPromptsList.map((scene, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
                <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest">Phân đoạn {i+1}: {scene.title}</span>
                <button onClick={() => navigator.clipboard.writeText(scene.visual_prompt)} className="p-1.5 text-orange-600 hover:bg-white rounded-lg transition-all"><Copy size={14}/></button>
              </div>
              <div className="p-5 flex-1 space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Lời dẫn/Kịch bản:</label>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{scene.script_segment}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">Sora Prompt:</label>
                  <div className="bg-slate-900 rounded-xl p-3 font-mono text-[10px] text-orange-400 leading-relaxed">
                    {scene.visual_prompt}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex-none p-3 lg:p-4 bg-white border-b border-slate-200 flex justify-center overflow-x-auto no-scrollbar">
        <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex gap-1">
          {TABS.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <tab.icon size={14} className={tab.colorClass} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 relative overflow-y-auto overscroll-contain custom-scrollbar p-4 lg:p-8">
        {activeTab === 'prompts' && renderPromptsTab()}
        {activeTab === 'video' && renderVideoTab()}
        {activeTab === 'grok_ad' && renderGrokTab()}
        {activeTab === 'sora_sequence' && renderSoraSeqTab()}
        {activeTab === 'banana' && renderBananaTab()}
        {activeTab === 'philosophy' && renderPhilosophyTab()}
      </div>

      {/* Result Modal (Optional for some tabs) */}
      {showResultModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="text-green-500" size={18} /> Kết quả sáng tạo AI
              </h3>
              <button onClick={() => setShowResultModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"><X size={20}/></button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {activeTab === 'banana' && (
                <div className="space-y-4">
                   <div className="bg-slate-900 rounded-2xl p-6 font-mono text-sm text-yellow-400 leading-relaxed shadow-inner">
                    {generatedBananaPrompt}
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(generatedBananaPrompt)} className="w-full py-3 bg-yellow-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-600 transition-all"><Copy size={14}/> Sao chép prompt</button>
                </div>
              )}
              {activeTab === 'philosophy' && (
                <div className="space-y-4">
                   <div className="bg-slate-900 rounded-2xl p-6 font-mono text-sm text-amber-400 leading-relaxed shadow-inner">
                    {generatedQuotePrompt}
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(generatedQuotePrompt)} className="w-full py-3 bg-amber-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-800 transition-all"><Copy size={14}/> Sao chép prompt</button>
                </div>
              )}
              {/* Add other result types if needed */}
              <div className="mt-6 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sử dụng prompt này trong các công cụ tạo ảnh/video tương ứng</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
