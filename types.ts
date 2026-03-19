
export interface ProcessedImage {
  preview: string;
  base64: string;
  mimeType: string;
}

export interface OptionItem {
  id: string;
  label: string;
  desc: string;
  prompt?: string;
}

export interface GenerationRequest {
  personImage: ProcessedImage;
  productImage: ProcessedImage;
  customBackdrop?: ProcessedImage | null; // Added field for custom background
  outfit: OptionItem;
  pose: OptionItem;
  backdrop: OptionItem;
  expression: OptionItem;
  aspectRatio: OptionItem;
  camera: OptionItem; // Added camera angle option
}

export interface ImageAsset {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

// --- Content Generator Types ---
export type StyleKey = 'boc_phot' | 'canh_bao' | 'to_mo' | 'hoi_han' | 'drama' | 'kinh_di' | 'tam_linh' | 'chuyen_gia' | 'tinh_cam' | 'hai_huoc' | 'san_sale';

export interface InputState {
  productName: string;
  productDescription: string;
  benefit: string;
  link: string;
  style: StyleKey;
}

// --- KOL Content Generator Types ---
export type KolStyleKey = 'kol_boc_phot' | 'kol_canh_bao' | 'kol_to_mo' | 'kol_hoi_han' | 'kol_tam_linh' | 'kol_kin_di' | 'kol_hai_huoc';

export interface KolInputState {
  kolName: string;
  productName: string;
  productDescription: string;
  benefit: string;
  context: string;
  link: string;
  style: KolStyleKey;
}
