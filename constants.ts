
import { OptionItem } from './types';

export const ASPECT_RATIOS: OptionItem[] = [
  { id: '1:1', label: 'Vuông (1:1)', desc: 'Instagram, Shopee, Lazada' },
  { id: '3:4', label: 'Dọc (3:4)', desc: 'Facebook, Instagram Post' },
  { id: '9:16', label: 'Full Dọc (9:16)', desc: 'TikTok, Reels, Shorts' },
  { id: '16:9', label: 'Ngang (16:9)', desc: 'YouTube, Web Banner' },
  { id: '4:3', label: 'Ngang (4:3)', desc: 'Ảnh thường, Slide' },
];

export const BODY_SHAPES: OptionItem[] = [
  { id: 'standard', label: 'Cân đối', desc: 'Dáng người chuẩn, cân đối' },
  { id: 'slim', label: 'Mảnh khảnh', desc: 'Dáng người gầy, thanh mảnh' },
  { id: 'athletic', label: 'Thể thao', desc: 'Dáng người săn chắc, cơ bắp' },
  { id: 'curvy', label: 'Đồng hồ cát', desc: 'Đường cong rõ rệt, quyến rũ' },
  { id: 'petite', label: 'Nhỏ nhắn', desc: 'Dáng người thấp bé, nhỏ nhắn' },
  { id: 'tall', label: 'Cao ráo', desc: 'Dáng người cao, chân dài' },
  { id: 'plus_size', label: 'Đầy đặn (Plus)', desc: 'Dáng người tròn trịa' },
];

export const CAMERA_ANGLES: OptionItem[] = [
  { 
    id: 'standard', 
    label: 'Ngang Tầm Mắt (Chuẩn)', 
    desc: 'Góc chụp thương mại tiêu chuẩn, rõ mặt và sản phẩm.' 
  },
  { 
    id: 'pov_hands', 
    label: 'POV (Trải nghiệm)', 
    desc: 'Góc nhìn từ mắt nhân vật xuống tay đang cầm sản phẩm (First-person view).',
    prompt: 'First-Person Point of View (POV) shot. The camera is positioned as if looking through the eyes of the character. We see the character\'s hands holding the product in the foreground. Focus on the interaction and the product.'
  },
  { 
    id: 'selfie_mirror', 
    label: 'Selfie Trước Gương', 
    desc: 'Nhân vật cầm sản phẩm tự chụp qua gương.',
    prompt: 'Mirror Selfie Shot. The character is taking a photo of themselves in a mirror, holding the product. Natural, user-generated content (UGC) vibe.'
  },
  { 
    id: 'low_angle', 
    label: 'Góc Thấp (Hất lên)', 
    desc: 'Tạo cảm giác quyền lực, sản phẩm nổi bật.',
    prompt: 'Low Angle Shot (Worm\'s-eye view). Camera looking up at the character and product. Makes the subject look heroic and dominant.'
  },
  { 
    id: 'close_up_macro', 
    label: 'Cận Cảnh (Close-up)', 
    desc: 'Zoom cực gần vào mặt và sản phẩm.',
    prompt: 'Extreme Close-up Shot. Tightly framed on the face and the product. Showing texture details and emotions clearly.'
  }
];

export const BACKDROPS: OptionItem[] = [
  { 
    id: 'original_bg', 
    label: 'Giữ Nguyên Bối Cảnh', 
    desc: 'Không thay đổi nền của ảnh gốc.',
    prompt: 'Keep original background' 
  },
  {
    id: 'custom_bg',
    label: 'Tự Tải Ảnh Nền',
    desc: 'Upload ảnh bối cảnh riêng của bạn.',
    prompt: 'Use the provided custom background image.'
  },
  
  // --- KITCHEN (CĂN BẾP) ---
  {
    id: 'kitchen_modern_white',
    label: 'Bếp Hiện Đại (Trắng)',
    desc: 'Sạch sẽ, tone trắng, thiết bị inox cao cấp.',
    prompt: 'A pristine, modern white kitchen background. Clean marble countertops, stainless steel appliances, bright natural lighting. Minimalist and high-end culinary vibe.'
  },
  {
    id: 'kitchen_luxury_island',
    label: 'Bếp Sang (Đảo Đá)',
    desc: 'Đảo bếp Marble rộng, đèn chùm, sang trọng.',
    prompt: 'A luxury kitchen with a large marble island centerpiece. Elegant pendant lights, premium cabinetry, warm ambient lighting. Sophisticated and expensive atmosphere.'
  },
  {
    id: 'kitchen_cozy_wooden',
    label: 'Bếp Gỗ Ấm Cúng',
    desc: 'Phong cách Rustic, tủ gỗ, ánh sáng vàng.',
    prompt: 'A cozy rustic kitchen with warm wooden cabinets and farmhouse details. Soft warm lighting, herbs in pots on shelves, homey and inviting atmosphere.'
  },
  {
    id: 'kitchen_cooking_messy',
    label: 'Bếp Đang Nấu Ăn (Chung)',
    desc: 'Sống động, có rau củ, hơi nước, tự nhiên.',
    prompt: 'A realistic, active kitchen setting where cooking is taking place. Steam rising from pots, fresh ingredients like vegetables and herbs scattered on the counter. Dynamic and authentic culinary atmosphere.'
  },
  {
    id: 'kitchen_baking_flour',
    label: 'Làm Bánh (Bột mì)',
    desc: 'Bàn đầy bột, trứng, dụng cụ làm bánh.',
    prompt: 'A messy baking scene on a wooden kitchen counter. Flour dusted on the surface, rolling pin, dough, eggs, and milk jug. Warm, cozy, and homey atmosphere.'
  },
  {
    id: 'kitchen_chopping_veg',
    label: 'Cắt Thái Rau Củ',
    desc: 'Thớt gỗ, rau tươi, dao, healthy.',
    prompt: 'Close-up of a kitchen counter with a wooden cutting board, fresh colorful vegetables (tomatoes, greens), and a knife. Bright natural light, healthy and organic cooking vibe.'
  },
  {
    id: 'kitchen_coffee_morning',
    label: 'Pha Cà Phê Sáng',
    desc: 'Máy pha cafe, khói bốc lên, nắng sớm.',
    prompt: 'A morning coffee preparation scene. Espresso machine or french press, steam rising from a cup, coffee beans scattered. Soft morning sunlight, relaxing and aromatic vibe.'
  },
  {
    id: 'kitchen_chef_fire',
    label: 'Bếp Lửa (Chef)',
    desc: 'Chảo trên bếp gas, ngọn lửa xanh, chuyên nghiệp.',
    prompt: 'A professional cooking scene. A pan on a gas stove with a visible blue flame, steam and heat distortion. Stainless steel background, dynamic and intense culinary atmosphere.'
  },
  {
    id: 'kitchen_fridge',
    label: 'Trước Tủ Lạnh',
    desc: 'Mở cửa tủ lạnh đầy ắp đồ ăn, tươi mát.',
    prompt: 'Standing in front of an open, well-stocked refrigerator. Bright cool lighting from the fridge, colorful fresh produce visible inside. Fresh and cool vibe.'
  },

  // --- LIVING ROOM (PHÒNG KHÁCH) ---
  {
    id: 'living_room_sunny',
    label: 'Phòng Khách Nắng Sớm',
    desc: 'Cửa sổ lớn, nắng ngập tràn, rèm trắng bay.',
    prompt: 'A bright and airy living room filled with natural morning sunlight. Light-colored fabric sofa, large windows with sheer white curtains blowing in wind. Fresh, energetic and clean.'
  },
  {
    id: 'living_room_luxury_night',
    label: 'Phòng Khách Luxury (Tối)',
    desc: 'Sofa da, đèn chùm, không gian tối quyền lực.',
    prompt: 'A luxurious living room at night. Dark leather furniture, crystal chandelier, warm accent lighting, dark elegant tones. High-class evening vibe.'
  },
  {
    id: 'living_room_scandi',
    label: 'Góc Decor Bắc Âu',
    desc: 'Tối giản, tinh tế, tranh tường, thảm lông.',
    prompt: 'A Scandinavian style living room corner. Grey minimalist sofa, geometric rugs, wooden legs, abstract art on walls. Clean, modern and cozy.'
  },
  {
    id: 'living_room_tv',
    label: 'Phòng Khách Gia Đình',
    desc: 'Ấm áp, gần gũi, kệ TV gỗ, cây xanh.',
    prompt: 'A cozy family living room. Soft rugs, plenty of throw pillows, warm lighting, wooden TV stand and indoor plants in background. Comfortable and lived-in feel.'
  },

  // --- OTHER SPACES ---
  { 
    id: 'bedroom_cozy', 
    label: 'Phòng Ngủ Chill', 
    desc: 'Giường nệm êm ái, ánh sáng dịu, thư giãn.',
    prompt: 'A cozy and relaxing bedroom setting. Soft white bedding, fluffy pillows, warm bedside lamp lighting. Peaceful and SLR photo of intimate atmosphere.'
  },
  { 
    id: 'bathroom_luxury', 
    label: 'Phòng Tắm Spa', 
    desc: 'Đá ốp sáng, gương lớn, khăn trắng, sang xịn.',
    prompt: 'A high-end luxury bathroom or spa setting. White marble walls, large mirror with LED backlight, rolled white towels, orchid flower. Clean and refreshing.'
  },

  // --- E-COMMERCE & OUTDOOR ---
  {
    id: 'livestream_studio',
    label: 'Studio Livestream',
    desc: 'Phòng live chuyên nghiệp, đèn Ringlight.',
    prompt: 'A professional livestream studio background. Blurred shelves with colorful products, vibrant LED lighting (purple/pink/blue accents), ring light reflection visible. Modern, energetic social media vibe.'
  },
  {
    id: 'cafe_outdoor', 
    label: 'Cafe Sân Vườn', 
    desc: 'Thoáng đãng, cây xanh, nắng đẹp.',
    prompt: 'An outdoor cafe patio or garden setting during the daytime. Natural sunlight, green foliage, blurred wooden tables and chairs in the background. Fresh and airy feel.'
  },
  {
    id: 'street_fashion',
    label: 'Phố Thời Trang',
    desc: 'Đường phố hiện đại, background cửa hàng.',
    prompt: 'A stylish urban street fashion background. Blurred city buildings, shop windows, modern pavement. Natural daylight, dynamic city vibe.'
  },
  {
    id: 'studio_solid',
    label: 'Studio Nền Màu',
    desc: 'Chuyên nghiệp, nền trơn làm nổi bật chủ thể.',
    prompt: 'A professional photo studio setting with a clean, solid color background (soft grey or white). High-quality studio lighting setup, softbox lighting effects on the subject. Minimalist and commercial.'
  },
  
  // --- SEASONS ---
  {
    id: 'tet_background',
    label: 'Tết Nguyên Đán',
    desc: 'Hoa mai, đào, đỏ rực rỡ.',
    prompt: 'A traditional Vietnamese Lunar New Year (Tet) background. Ochna (Mai) or Peach (Dao) blossoms, red lanterns, lucky money envelopes. Warm, festive, and joyful atmosphere.'
  },
  {
    id: 'summer_beach',
    label: 'Bãi Biển Mùa Hè',
    desc: 'Nắng vàng, biển xanh, cát trắng.',
    prompt: 'A beautiful sunny tropical beach background. Blue ocean, white sand, palm trees, and bright natural sunlight. Relaxing summer vacation vibe.'
  }
];

export const OUTFITS: OptionItem[] = [
  { id: 'keep', label: 'Giữ nguyên trang phục', desc: 'Không thay đổi quần áo gốc' },
  // --- BASIC ---
  { id: 'daily_home', label: 'Đồ Mặc Nhà', desc: 'Thoải mái, giản dị (Pyjama, đồ bộ)' },
  { id: 'white_shirt', label: 'Sơ Mi Trắng', desc: 'Lịch sự, tin cậy, công sở' },
  { id: 'business_suit', label: 'Vest Doanh Nhân', desc: 'Sang trọng, đẳng cấp' },
  // --- SEASONS ---
  { id: 'summer_vibes', label: 'Hè / Đi Biển', desc: 'Váy Maxi, áo 2 dây, đồ bơi kín đáo, mũ cói' },
  { id: 'winter_coat', label: 'Đông / Áo Khoác', desc: 'Áo khoác dạ, khăn len, ấm áp, layer nhiều lớp' },
  { id: 'autumn_style', label: 'Thu / Cardigan', desc: 'Áo len mỏng, màu nâu/be, nhẹ nhàng' },
  // --- FESTIVALS ---
  { id: 'ao_dai_tet', label: 'Áo Dài Tết', desc: 'Áo dài truyền thống hoặc cách tân, màu đỏ/vàng' },
  { id: 'christmas_outfit', label: 'Đồ Giáng Sinh', desc: 'Len đỏ/trắng, họa tiết tuần lộc/tuyết' },
  { id: 'party_dress', label: 'Dạ Hội / Party', desc: 'Váy lấp lánh, sang trọng, quyến rũ' },
  // --- SALES & WORK ---
  { id: 'livestream_host', label: 'Host Livestream', desc: 'Trang điểm nổi bật, trang phục trendy, thu hút' },
  { id: 'shopee_tshirt', label: 'Áo Thun Sale', desc: 'Áo phông năng động (Cam/Trắng), phong cách nhân viên sàn' },
  { id: 'uniform_polo', label: 'Áo Polo Đồng Phục', desc: 'Gọn gàng, chuyên nghiệp' },
  { id: 'casual_tshirt', label: 'Áo Thun Năng Động', desc: 'Đơn giản, quần jeans' },
];

export const POSES: OptionItem[] = [
  { id: 'natural', label: 'Cầm Tự Nhiên', desc: 'AI tự quyết định cách cầm hợp lý' },
  { id: 'one_hand_hold', label: 'Cầm 1 Tay', desc: 'Cầm sản phẩm chắc chắn một tay' },
  { id: 'two_hands_present', label: '2 Tay Nâng Niu', desc: 'Hai tay nâng sản phẩm trước ngực' },
  { id: 'offering', label: 'Đưa Về Phía Trước', desc: 'Động tác mời, đưa về phía camera' },
  { id: 'holding_up', label: 'Giơ Cao', desc: 'Giơ sản phẩm lên ngang vai/mặt' },
];

export const EXPRESSIONS: OptionItem[] = [
  { id: 'keep', label: 'Giữ Nguyên Biểu Cảm', desc: 'Giữ nguyên cảm xúc ảnh gốc' },
  { id: 'smile_gentle', label: 'Cười Mỉm', desc: 'Thân thiện, nhẹ nhàng, gần gũi', prompt: 'A gentle, warm, and natural smile.' },
  { id: 'smile_happy', label: 'Cười Vui Tươi', desc: 'Rạng rỡ, năng lượng tích cực', prompt: 'A happy, vibrant, and laughing expression showing teeth.' },
  { id: 'serious', label: 'Nghiêm Túc', desc: 'Chuyên nghiệp, đáng tin cậy', prompt: 'A serious, professional, and confident expression. Calm and focused.' },
  { id: 'surprised', label: 'Ngạc Nhiên / Hào Hứng', desc: 'Thích thú, "Wow"', prompt: 'An expression of excitement and pleasant surprise (Wow moment).' },
  { id: 'focused', label: 'Tập Trung', desc: 'Đang chú ý vào sản phẩm', prompt: 'A focused and attentive look, eyes looking towards the product.' },
];

// --- CONTENT GENERATOR TEMPLATES ---
export const CONTENT_TEMPLATES: Record<string, { post: string; comment: string }[]> = {
  boc_phot: [{ post: "BÓC PHỐT {productName}!!!\n\nKhông thể tin được là nó lại như vậy...\n\nSự thật ở dưới 👇", comment: "{productName} dùng đỉnh thật sự mọi người ơi. {benefit}.\n\nLink mua ở đây nè: {link}" }],
  canh_bao: [{ post: "CẢNH BÁO: ĐỪNG MUA {productName}!!!\n\nNếu bạn không muốn bị nghiện em nó...\n\nXem tại sao ở dưới 👇", comment: "Em {productName} này dùng thích lắm, {benefit}. Cẩn thận không là tốn tiền mua thêm đấy.\n\nLink: {link}" }],
  to_mo: [{ post: "BÍ MẬT TRONG CHIẾC HỘP NÀY...\n\nThứ giúp mình thay đổi hoàn toàn là đây.\n\nSự thật ở dưới 👇", comment: "Đó chính là {productName}! {benefit}. Mọi người tham khảo ở đây nha: {link}" }],
  hoi_han: [{ post: "HỐI HẬN VÌ KHÔNG BIẾT {productName} SỐM HƠN!\n\nBiết sớm là đã khác rồi...\n\nXem ở dưới 👇", comment: "Biết thế mua {productName} từ lâu. {benefit}. Quá rẻ mà xịn.\n\nLink: {link}" }],
  drama: [{ post: "DRAMA CĂNG ĐÉC LIÊN QUAN ĐẾN {productName}!\n\nChuyện là thế này...\n\nHóng ở dưới 👇", comment: "Chốt lại là {productName} vẫn đỉnh nhất. {benefit}. Mua ở đây uy tín: {link}" }],
  kinh_di: [{ post: "SỰ THẬT KINH HOÀNG VỀ {productName}!\n\nXem xong rùng mình luôn...\n\nChi tiết ở dưới 👇", comment: "{productName} giải quyết nỗi sợ {benefit} cực nhanh. Đáng đồng tiền bát gạo.\n\nLink: {link}" }],
  tam_linh: [{ post: "TÍN HIỆU VŨ TRỤ GỬI ĐẾN BẠN...\n\n{productName} chính là định mệnh.\n\nXem ngay 👇", comment: "Vía em {productName} này cực tốt. {benefit}. Link cho ai cần: {link}" }],
  chuyen_gia: [{ post: "GÓC NHÌN CHUYÊN GIA VỀ {productName}!\n\nPhân tích chi tiết nhất...\n\nXem kết quả dưới 👇", comment: "Đánh giá khách quan: {productName} đạt chuẩn. {benefit}. Link chính hãng: {link}" }],
  tinh_cam: [{ post: "CẢM ƠN {productName} ĐÃ XUẤT HIỆN!\n\nMón quà ý nghĩa nhất...\n\nXem ở dưới 👇", comment: "{productName} ngọt ngào và tinh tế. {benefit}. Link: {link}" }],
  hai_huoc: [{ post: "KHI BẠN CÓ {productName} TRONG TAY...\n\nCuộc sống bỗng nhiên vô tri hẳn.\n\nXem hài ở dưới 👇", comment: "Cười xỉu với em {productName} này. Vừa vui vừa xịn {benefit}.\n\nLink: {link}" }],
  san_sale: [{ post: "SĂN DEAL {productName} CHỈ 1K!\n\nCơ hội duy nhất trong ngày.\n\nLấy mã dưới 👇", comment: "Nhanh tay hốt em {productName} đang sale đậm. {benefit}.\n\nLink: {link}" }]
};

// --- KOL CONTENT GENERATOR TEMPLATES ---
export const KOL_TEMPLATES: Record<string, { post: string; comment: string }[]> = {
  kol_boc_phot: [{ post: "BÓC PHỐT {kolName} DÙNG ĐỒ GIẢ?\n\nSự thật đằng sau bức ảnh này là...\n\nXem ngay dưới 👇", comment: "Thực ra là {kolName} dùng {productName} xịn quá nên bị nghi ngờ thôi. {benefit}.\n\nLink: {link}" }],
  kol_canh_bao: [{ post: "CẢNH BÁO: ĐỪNG ĐU TREND THEO {kolName}!\n\nHậu quả cực kỳ nghiêm trọng...\n\nXem ở dưới 👇", comment: "Đu trend dùng {productName} giống {kolName} là bị đẹp quá mức đấy. {benefit}.\n\nLink: {link}" }],
  kol_to_mo: [{ post: "SOI CHI TIẾT TRÊN BÀN CỦA {kolName}!\n\nVật thể lạ xuất hiện là gì?\n\nGiải đáp ở dưới 👇", comment: "Đó là em {productName} thần thánh. {benefit}. Bảo sao {kolName} mê mẩn.\n\nLink: {link}" }],
  kol_hoi_han: [{ post: "HỐI HẬN VÌ KHÔNG NGHE LỜI {kolName}!\n\nĐã quá muộn để bắt đầu?\n\nXem ở dưới 👇", comment: "Đáng lẽ phải mua {productName} như {kolName} bảo từ lâu. {benefit}.\n\nLink: {link}" }],
  kol_tam_linh: [{ post: "BÍ MẬT THÀNH CÔNG CỦA {kolName}!\n\nVật phẩm phong thủy bí mật?\n\nLộ diện ở dưới 👇", comment: "{productName} chính là 'vía' may mắn của {kolName}. {benefit}.\n\nLink: {link}" }],
  kol_kinh_di: [{ post: "SỰ THAY ĐỔI RÙNG MÌNH CỦA {kolName}!\n\nTrước và sau khi dùng thứ này...\n\nXem ảnh dưới 👇", comment: "Chính là nhờ {productName} giúp {kolName} lột xác. {benefit}.\n\nLink: {link}" }],
  kol_hai_huoc: [{ post: "CÁI KẾT Ố DỀ CỦA {kolName}!\n\nKhi cố gắng dùng {productName}...\n\nXem ngay 👇", comment: "Dùng {productName} vừa cười vừa sướng. {kolName} review cực lầy. {benefit}.\n\nLink: {link}" }]
};
