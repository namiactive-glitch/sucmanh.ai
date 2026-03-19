import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Shirt, Megaphone, Camera, PenTool, Mic, Lightbulb, ChevronDown, ChevronUp, Video, Bolt } from 'lucide-react';

const GUIDE_DATA: Record<string, { title: string, icon: any, content: string[] }> = {
  'studio': {
    title: 'Fashion Studio (Ghép Ảnh & Thử Đồ)',
    icon: Shirt,
    content: [
      "CHẾ ĐỘ: GHÉP MẶT & BỐI CẢNH (Layers)",
      "1. Tải lên ảnh khuôn mặt người mẫu (rõ nét) và ảnh sản phẩm.",
      "2. Chọn cấu hình: Trang phục, Dáng tay, Biểu cảm.",
      "3. Chọn Bối cảnh có sẵn hoặc tải ảnh nền riêng.",
      "4. Nhấn 'GHÉP ẢNH NGAY' để AI tạo ảnh ghép chuyên nghiệp.",
      "---",
      "CHẾ ĐỘ: PHÒNG THỬ ĐỒ ẢO (Wand)",
      "1. Tải ảnh người mẫu toàn thân hoặc nửa người.",
      "2. Tab 'Chọn Mẫu Có Sẵn': Chọn loại trang phục và mô tả.",
      "3. Tab 'Tải Ảnh Đồ Mới': Tải ảnh quần áo bạn muốn thử (trải phẳng hoặc trên manocanh).",
      "4. Nhấn 'Thử Đồ Ngay' để AI thay trang phục cho người mẫu."
    ]
  },
  'ai_image_generator': {
    title: 'Tạo Ảnh AI (Poster & Lifestyle)',
    icon: Camera,
    content: [
      "Tab 'Poster Quảng Cáo': Tạo ảnh quảng cáo sản phẩm sạch, chuyên nghiệp. Tải ảnh sản phẩm và (tùy chọn) logo. Mô tả phong cách (Neon, Luxury, Minimalist...).",
      "Tab 'Ảnh Lifestyle & Video': Tạo ảnh sản phẩm trong bối cảnh đời thực và có người mẫu. Tải ảnh sản phẩm và (tùy chọn) ảnh mặt mẫu. Mô tả bối cảnh muốn tạo (ví dụ: trên bãi biển, trong phòng khách).",
      "Tính năng Video Prompt: Sau khi tạo ảnh Lifestyle thành công, nhấn nút 'Tạo Prompt Video' để lấy kịch bản làm video chuyển động (dùng cho Veo, Sora)."
    ]
  },
  'content_genius': {
    title: 'Viết Content (Content Genius)',
    icon: PenTool,
    content: [
      "Bước 1: Tải ảnh sản phẩm để AI 'nhìn' và hiểu sản phẩm.",
      "Bước 2: Nhập tên sản phẩm và các thông tin chính (USP).",
      "Bước 3: Chọn công thức viết (AIDA, PAS, Storytelling...).",
      "Bước 4: Nhấn tạo để nhận bài viết quảng cáo hoàn chỉnh, kèm icon và hashtag."
    ]
  },
  'hook_generator': {
    title: 'Tạo Hook Video Viral',
    icon: Bolt,
    content: [
      "Bước 1: Nhập Tên Sản Phẩm và Mô Tả (Công dụng, lợi ích).",
      "Bước 2: Chọn Phong Cách Hook (Bất ngờ, Hài hước, Drama...).",
      "Bước 3: Nhấn 'Hỏi AI Viết Hook' để tạo tiêu đề thu hút.",
      "Bước 4: Sau khi có Hook, có thể nhấn 'Viết Lời Bình' để tạo kịch bản Voiceover hoặc 'Tạo Ảnh Có Chữ' để vẽ Infographic (9:16) chứa Hook."
    ]
  },
  'text_to_speech': {
    title: 'Giọng Đọc AI (Text to Speech)',
    icon: Mic,
    content: [
      "Chọn ngôn ngữ và giọng đọc (Nam/Nữ, Vùng miền, Cảm xúc).",
      "Nhập văn bản cần đọc vào ô trống.",
      "Điều chỉnh tốc độ đọc.",
      "Nhấn 'Đọc Ngay' để nghe thử và tải về file âm thanh (WAV)."
    ]
  },
  'prompt_builder': {
    title: 'Xây dựng Prompt (Prompt AI)',
    icon: Lightbulb,
    content: [
      "Tab 'Bộ Prompt Ảnh': Nhập chủ đề, AI sẽ tạo ra 4 prompt chi tiết cho 4 góc độ (Tiêu đề, Dấu hiệu, Nguyên nhân, Giải pháp) để làm Infographic.",
      "Tab 'Video Nhân Vật': Tải ảnh mẫu, AI sẽ viết kịch bản prompt video giữ nguyên nhân vật đó qua nhiều cảnh.",
      "Tab 'Nano Banana': Công cụ ghép mặt chuyên sâu bằng prompt.",
      "Tab 'Sora Sequence': Tạo chuỗi video liên tục kể chuyện."
    ]
  },
  'sora_prompt_gen': {
    title: 'Sora Video Prompt Gen',
    icon: Video,
    content: [
      "Bước 1: Nhập tên và mô tả chi tiết sản phẩm.",
      "Bước 2: Chọn kịch bản (ví dụ: Mở hộp quà) và cài đặt âm thanh (giọng đọc, hiệu ứng ASMR, nhạc nền).",
      "Bước 3: Chọn phong cách hình ảnh (Tech, Cute, Cozy...) và góc máy.",
      "Bước 4: Nhấn 'Tạo Prompt Hoàn Chỉnh' để nhận prompt tối ưu cho Sora/Veo, bao gồm cả mô tả hình ảnh và âm thanh."
    ]
  }
};

interface UserGuideProps {
  activeTab: string;
}

export const UserGuide: React.FC<UserGuideProps> = ({ activeTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const data = GUIDE_DATA[activeTab];

  // Auto-close when tab changes, or maybe keep it closed by default to save space
  useEffect(() => {
    setIsOpen(false);
  }, [activeTab]);

  if (!data) return null;

  const Icon = data.icon;

  return (
    <div className="flex-none border-t border-gray-200 bg-white z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 px-6 bg-orange-50/50 hover:bg-orange-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="bg-orange-100 p-1.5 rounded-lg text-orange-600">
            <BookOpen size={16} />
          </div>
          <span className="text-sm font-display font-bold text-gray-700">
            Hướng Dẫn: {data.title}
          </span>
        </div>
        {isOpen ? <ChevronDown className="text-gray-400" size={20} /> : <ChevronUp className="text-gray-400" size={20} />}
      </button>

      {isOpen && (
        <div className="px-6 py-4 bg-white animate-in slide-in-from-bottom-2 fade-in duration-200 border-t border-orange-100 max-h-60 overflow-y-auto custom-scrollbar">
           <ul className="space-y-3 font-body text-sm text-gray-600">
              {data.content.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 relative group">
                  <span className="flex-none w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center border border-orange-200 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-center text-gray-400 font-body">
               Cần hỗ trợ thêm? Hotline/Zalo: 098.102.8794
            </div>
        </div>
      )}
    </div>
  );
};