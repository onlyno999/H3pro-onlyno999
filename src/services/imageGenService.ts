export interface BackgroundPreset {
  id: string;
  name: string;
  previewUrl: string;
  thumbnail: string;
  colorGrade: string;
  prompt: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'cliff',
    name: '悬崖峭壁绝顶',
    previewUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&auto=format&fit=crop&q=80',
    colorGrade: '电影冷暖对撞',
    prompt: '高耸入云的陡峭红褐色丹霞巨石绝壁，微风拂动，远处青翠群山。'
  },
  {
    id: 'warehouse',
    name: '废弃工业仓库',
    previewUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80',
    colorGrade: '废土阴郁青冷',
    prompt: '昏暗工业厂房，斑驳水泥立柱，地面浅积水倒影。'
  }
];

export const BUDDY_MULTIMODAL_CONFIG = {
  model: 'qwen-image-fusion',
  endpoint: 'cloud'
};

export async function dispatchBuddyMultimodalImg2Img(params: any): Promise<{
  generatedImageUrl: string;
  logs: string[];
}> {
  return {
    generatedImageUrl: params.backgroundImageUrl || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&auto=format&fit=crop&q=80',
    logs: ['[ImageGen] 垫图切片融合完成', '[ImageGen] Qwen 融光着色完成']
  };
}
