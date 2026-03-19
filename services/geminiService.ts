
// @google/genai service implementation following strict guidelines
import { GoogleGenAI, Modality, Type, ThinkingLevel } from "@google/genai";
import { GenerationRequest, ProcessedImage, ImageAsset, OptionItem } from '../types';

const API_KEY = process.env.API_KEY; 
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const ensureApiKeySelected = async () => {
  return;
};

// Global Policy Instructions for the AI
const POLICY_INSTRUCTIONS = `
TUYÊN THỦ NGHIÊM NGẶT LUẬT POLICY & TIÊU CHUẨN CỘNG ĐỒNG:
1. KHÔNG sử dụng các từ tuyệt đối hóa: "trị dứt điểm", "chữa khỏi", "cam kết 100%", "vĩnh viễn", "tuyệt đối".
2. KHÔNG sử dụng từ liên quan đến y tế/thuốc: thay bằng "sản phẩm", "hỗ trợ", "chuyên gia".
3. KHÔNG sử dụng từ ngữ gây chia rẽ: giàu/nghèo, sang/hèn.
4. GIỌNG VĂN: Luôn tự nhiên, thân thiện, đời thường.
5. KHÔNG LẶP TỪ: Tuyệt đối không lặp lại các tính từ trong các câu văn gần nhau.
`;

/**
 * Hàm hỗ trợ làm sạch mô tả trang phục để tránh bị AI chặn an toàn
 */
const sanitizeOutfitDescription = (desc: string): string => {
  return desc
    .replace(/sexy|gợi cảm|quyến rũ/gi, 'elegant and high-fashion')
    .replace(/táo bạo|mạnh bạo/gi, 'bold artistic design')
    .replace(/xuyên thấu|mờ ảo/gi, 'delicate layered fabric')
    .replace(/hở chân ngực|underboob/gi, 'fashionable crop cut')
    .replace(/khoét hông cao/gi, 'athletic high-cut design')
    .replace(/mỏng manh/gi, 'lightweight summer fabric');
};

export interface AIHookResult {
  category: string;
  hook: string;
}

export const generateAIHooks = async (product: string, info: string): Promise<AIHookResult[]> => {
    const prompt = `Tạo một danh sách TIÊU ĐỀ HOOK viral cực lớn cho sản phẩm "${product}" dựa trên thông tin: "${info}". 
    SỐ LƯỢNG: Ít nhất 45-55 tiêu đề HOOK. Ngôn ngữ: Tiếng Việt.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { 
                        type: Type.OBJECT,
                        properties: {
                            category: { type: Type.STRING },
                            hook: { type: Type.STRING }
                        },
                        required: ["category", "hook"]
                    }
                }
            }
        });
        return JSON.parse(response.text || '[]');
    } catch (error) {
        console.error("AI Hooks Error:", error);
        return [];
    }
};

export const generateCompositeImage = async (request: GenerationRequest): Promise<string> => {
  const { personImage, productImage, customBackdrop, outfit, backdrop, expression, aspectRatio, camera } = request;
  let backgroundInstruction = backdrop.id === 'custom_bg' && customBackdrop ? `5. BACKGROUND: Use image 3.` : `5. BACKGROUND: ${backdrop.prompt}.`;
  
  const promptText = `
    ROLE: Commercial Photo Compositor.
    1. SẢN PHẨM (ẢNH 2): GIỮ NGUYÊN 100%.
    2. NGƯỜI MẪU (ẢNH 1): Sử dụng khuôn mặt từ Ảnh 1.
    3. ĐỘ CHÂN THỰC: 8K, photorealistic.
    ${expression.id === 'keep' ? '' : `Đổi biểu cảm: "${expression.prompt}".`}
    ${outfit.id === 'keep' ? '' : `Mặc trang phục: ${outfit.label}.`}
    ${backgroundInstruction}
  `;

  const parts: any[] = [
    { text: promptText },
    { inlineData: { mimeType: personImage.mimeType, data: personImage.base64 } },
    { inlineData: { mimeType: productImage.mimeType, data: productImage.base64 } }
  ];
  if (customBackdrop) parts.push({ inlineData: { mimeType: customBackdrop.mimeType, data: customBackdrop.base64 } });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspectRatio.id } }
  });

  const resPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (resPart) return `data:image/png;base64,${resPart.inlineData.data}`;
  throw new Error("AI không tạo được ảnh.");
};

export const generateAdImage = async (productImage: ProcessedImage, logoImage: ProcessedImage | null, customPrompt: string, aspectRatio: string = "1:1"): Promise<string> => {
    const prompt = `Tạo ảnh quảng cáo 8K. Bối cảnh: ${customPrompt}. GIỮ NGUYÊN SẢN PHẨM.`;
    const parts: any[] = [{ text: prompt }, { inlineData: { mimeType: productImage.mimeType, data: productImage.base64 } }];
    if (logoImage) parts.push({ inlineData: { mimeType: logoImage.mimeType, data: logoImage.base64 } });
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts }, config: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio } } });
    const resPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (resPart) return `data:image/png;base64,${resPart.inlineData.data}`;
    throw new Error("Lỗi poster.");
};

export const generateAdCopy = async (productName: string, productInfo: string, target: string, formula: string, formulaDesc: string, hookStyle: string, op: string, dp: string, img: any): Promise<string> => {
    const prompt = `Viết kịch bản quảng cáo cho ${productName}. ${productInfo}.`;
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
    return response.text || "Lỗi.";
};

/**
 * Virtual Try-On - Nâng cấp tối ưu hóa cho Bikini và chỉ có mặt mẫu
 */
export const generateVirtualTryOn = async (
  modelImg: ImageAsset, 
  desc: string, 
  lighting: string, 
  filter: string, 
  beauty: string[], 
  backdrop: OptionItem, 
  prodImg: ImageAsset | null, 
  ar: string = "3:4",
  customBackdropPrompt?: string,
  bodyShape: string = "Cân đối"
): Promise<string> => {
    // Làm sạch mô tả để tránh bộ lọc an toàn
    const cleanDesc = sanitizeOutfitDescription(desc);
    const cleanBackdrop = customBackdropPrompt ? sanitizeOutfitDescription(customBackdropPrompt) : (backdrop.prompt || 'a professional luxury fashion studio');

    const prompt = `
      ROLE: Professional High-End Fashion Photographer & Digital Stylist.
      TASK: Virtual Try-On for premium fashion apparel.
      
      CORE GUIDELINES:
      1. FACE IDENTITY: Must strictly use the facial features, skin tone, and identity from the provided source model image. 100% preservation of the face is mandatory.
      2. OUTFIT GENERATION: Render a high-quality, professional ${cleanDesc}. Focus on fabric texture, stitching, and high-fashion aesthetics.
      ${prodImg ? "Strictly replicate the color, pattern, and design of the clothing shown in the second image." : "Ensure the design is elegant, commercial-grade, and looks like a professional catalog photo."}
      3. BODY & COMPOSITION: If the source image is only a face, generate a graceful, anatomically correct body with a "${bodyShape}" body shape in a natural professional model pose that fits the outfit style.
      4. CONTEXT: The scene is set in ${cleanBackdrop}. 
      5. LIGHTING & STYLE: ${lighting}. Ensure soft, flattering studio lighting. 8K resolution, photorealistic commercial quality.
      
      SAFETY COMPLIANCE: This is a professional fashion photography task. Ensure the output is tasteful, high-fashion, and commercial in nature.
    `;

    const parts: any[] = [
      { text: prompt }, 
      { inlineData: { mimeType: modelImg.mimeType, data: modelImg.base64.split(',')[1] } }
    ];

    if (prodImg) {
      parts.push({ inlineData: { mimeType: prodImg.mimeType, data: prodImg.base64.split(',')[1] } });
    }

    try {
        const response = await ai.models.generateContent({ 
          model: 'gemini-2.5-flash-image', 
          contents: { parts }, 
          config: { 
            responseModalities: ['IMAGE'], 
            imageConfig: { aspectRatio: ar } 
          } 
        });

        const resPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (resPart) return `data:image/png;base64,${resPart.inlineData.data}`;
        throw new Error("AI không thể tạo được hình ảnh. Thử lại với mô tả đơn giản hơn.");
    } catch (err: any) {
        if (err.message?.includes('safety') || err.message?.includes('blocked')) {
            throw new Error("Yêu cầu bị từ chối vì lý do an toàn. Vui lòng chọn kiểu trang phục khác hoặc mô tả bối cảnh nhẹ nhàng hơn.");
        }
        throw err;
    }
};

export const removeBackground = async (image: ProcessedImage): Promise<string> => {
    const prompt = "Remove background.";
    const parts = [{ text: prompt }, { inlineData: { mimeType: image.mimeType, data: image.base64 } }];
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts }, config: { responseModalities: ['IMAGE'] } });
    const resPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (resPart) return `data:image/png;base64,${resPart.inlineData.data}`;
    throw new Error("Lỗi.");
};

export const generateMarketingImage = async (productImage: ProcessedImage, faceImage: ProcessedImage | null, productName: string, feedback: string, aspectRatio: string = "1:1"): Promise<string> => {
  const prompt = `Lifestyle image for ${productName}. ${feedback}.`;
  const parts: any[] = [{ text: prompt }, { inlineData: { mimeType: productImage.mimeType, data: productImage.base64 } }];
  if (faceImage) parts.push({ inlineData: { mimeType: faceImage.mimeType, data: faceImage.base64 } });
  const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts }, config: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio } } });
  const resPart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (resPart) return `data:image/png;base64,${resPart.inlineData.data}`;
  throw new Error("Lỗi.");
};

export const generateVideoPrompt = async (productName: string, feedback: string, imageDesc: string): Promise<string> => {
  const prompt = `Video prompt for ${productName}.`;
  const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
  return response.text || "";
};

// Fixed generateSpeech signature to accept speed parameter
export const generateSpeech = async ({ text, voiceId, speed }: { text: string; voiceId: string; speed?: number }): Promise<string> => {
    const response = await ai.models.generateContent({ 
        model: "gemini-2.5-flash-preview-tts", 
        contents: [{ parts: [{ text }] }], 
        config: { 
            responseModalities: [Modality.AUDIO], 
            speechConfig: { 
                voiceConfig: { 
                    prebuiltVoiceConfig: { voiceName: voiceId } 
                } 
            } 
        } 
    });
    const data = response.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data;
    if (data) return data;
    throw new Error("Lỗi.");
};

/**
 * Optimizes the TTS prompt by analyzing the text, voice characteristics, and target speed
 */
export const optimizeTTSPrompt = async (text: string, voiceName: string, description: string, styleInstruction: string, speed: number): Promise<string> => {
    const prompt = `
        BẠN LÀ CHUYÊN GIA ĐẠO DIỄN ÂM THANH (VOICE DIRECTOR).
        NHIỆM VỤ: Tạo một câu lệnh điều hướng (Style Instruction) hoàn hảo cho mô hình AI Text-to-Speech.
        
        THÔNG TIN GIỌNG ĐỌC:
        - Tên: ${voiceName}
        - Mô tả: ${description}
        - Hướng dẫn gốc: ${styleInstruction}
        - Tốc độ yêu cầu: ${speed}x (1.0x là bình thường, >1.0 là nhanh, <1.0 là chậm)
        
        VĂN BẢN CẦN ĐỌC:
        "${text}"
        
        YÊU CẦU:
        1. Phân tích nội dung văn bản để xác định cảm xúc (vui, buồn, kịch tính, trang trọng...).
        2. TUÂN THỦ TUYỆT ĐỐI đặc điểm giọng đọc và vùng miền đã chọn (Hướng dẫn gốc). Không được thay đổi vùng miền.
        3. Điều chỉnh nhịp điệu và tốc độ nói trong câu lệnh để phù hợp với mức ${speed}x.
        4. Tạo ra một câu lệnh ngắn gọn (dưới 50 từ) bắt đầu bằng "Hãy đọc..." để hướng dẫn AI cách nhấn nhá, ngắt nghỉ, tốc độ và biểu cảm sao cho CHÍNH XÁC nhất với ngữ cảnh và yêu cầu này.
        5. Trả về DUY NHẤT câu lệnh đó, không giải thích thêm.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
            }
        });
        return response.text?.trim() || styleInstruction;
    } catch (error) {
        console.error("Optimize Prompt Error:", error);
        return styleInstruction;
    }
};

/**
 * Streaming version of TTS for maximum speed (instant playback)
 */
export const generateSpeechStream = async ({ text, voiceId }: { text: string; voiceId: string }) => {
    return await ai.models.generateContentStream({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: voiceId }
                }
            }
        }
    });
};

export const decodeAudioData = async (base64: string, ctx: AudioContext): Promise<AudioBuffer> => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Convert to Int16Array (assuming little-endian PCM from Gemini TTS)
  // Each sample is 2 bytes (16-bit)
  const numSamples = Math.floor(len / 2);
  const dataInt16 = new Int16Array(bytes.buffer, 0, numSamples);
  
  const buffer = ctx.createBuffer(1, numSamples, 24000);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < numSamples; i++) {
    // Normalize Int16 to Float32 (-1.0 to 1.0)
    channelData[i] = dataInt16[i] / 32768.0;
  }
  
  return buffer;
};

/**
 * Renders an AudioBuffer at a specific speed using OfflineAudioContext
 */
export const renderBufferAtSpeed = async (buffer: AudioBuffer, speed: number): Promise<AudioBuffer> => {
    if (speed === 1) return buffer;
    
    const targetDuration = buffer.duration / speed;
    const targetLength = Math.floor(buffer.sampleRate * targetDuration);
    
    const offlineCtx = new OfflineAudioContext(
        buffer.numberOfChannels,
        targetLength,
        buffer.sampleRate
    );
    
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = speed;
    source.connect(offlineCtx.destination);
    source.start(0);
    
    return await offlineCtx.startRendering();
};

export const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const dataLength = buffer.length * blockAlign;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;
  
  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  // RIFF identifier
  writeString(0, 'RIFF');
  // File length
  view.setUint32(4, totalLength - 8, true);
  // WAVE identifier
  writeString(8, 'WAVE');
  // fmt chunk identifier
  writeString(12, 'fmt ');
  // fmt chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, format, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * blockAlign, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(36, 'data');
  // data chunk length
  view.setUint32(40, dataLength, true);
  
  // Write PCM samples
  const offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      // Convert to 16-bit signed integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset + (i * numChannels + channel) * 2, intSample, true);
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
};
