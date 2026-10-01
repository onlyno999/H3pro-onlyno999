export type ProductionGenre = 'short_drama' | 'mv' | 'commercial';

export interface GenreMeta {
  id: ProductionGenre;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  defaultDuration: number;
  segmentCount: number;
  keyFeature: string;
}

export const PRODUCTION_GENRES: Record<ProductionGenre, GenreMeta> = {
  short_drama: {
    id: 'short_drama',
    name: '竖屏微短剧',
    badge: '4段式接力',
    tagline: '15秒362帧标准 · 跨段尾帧垫图',
    defaultDuration: 60.33,
    segmentCount: 4,
    keyFeature: '1:1 锁颜定妆 + 15s尾帧无缝拼合',
    description: '4段×15.08秒 (362帧/段) 竖屏连续叙事，严格锁定角色长相与环境光影。'
  },
  mv: {
    id: 'mv',
    name: '音乐 MV',
    badge: '音频锁+节拍',
    tagline: '节奏节拍对齐 · 音频音色锁',
    defaultDuration: 32.0,
    segmentCount: 2,
    keyFeature: '纯现场拟音 + Master BGM 外部铺底',
    description: '精准音画同步，非发声段嘴唇自然闭合，零杂音无缝拼剪。'
  },
  commercial: {
    id: 'commercial',
    name: '电影广告片',
    badge: '3D 质感锁',
    tagline: '单段高精渲染 · 3D 产品材质',
    defaultDuration: 15.08,
    segmentCount: 1,
    keyFeature: '金属与高光反光质感 · 零杂音',
    description: '单段高精渲染，金属微距与环境光泽严密咬合，画质纯净。'
  }
};

export type AspectRatioType = '9:16' | '16:9' | '1:1' | '4:3' | '3:4' | '21:9';

export interface AspectRatioConfig {
  key: AspectRatioType;
  label: string;
  name: string;
  comfyValue: string;
  orientation: 'portrait' | 'landscape' | 'square';
  image1MpRes: string;
  video04MpRes: string;
}

export const ASPECT_RATIO_CONFIGS: Record<AspectRatioType, AspectRatioConfig> = {
  '9:16': {
    key: '9:16',
    label: '9:16 (竖屏短剧/短视频)',
    name: '竖屏 Portrait Widescreen',
    comfyValue: '9:16 (Portrait Widescreen)',
    orientation: 'portrait',
    image1MpRes: '768x1344',
    video04MpRes: '480x864 (0.4MP)'
  },
  '16:9': {
    key: '16:9',
    label: '16:9 (横屏电影/宽银幕)',
    name: '横屏 Landscape Widescreen',
    comfyValue: '16:9 (Landscape)',
    orientation: 'landscape',
    image1MpRes: '1344x768',
    video04MpRes: '864x480 (0.4MP)'
  },
  '1:1': {
    key: '1:1',
    label: '1:1 (正方形社交媒体)',
    name: '正方形 Square',
    comfyValue: '1:1 (Square)',
    orientation: 'square',
    image1MpRes: '1024x1024',
    video04MpRes: '640x640 (0.4MP)'
  },
  '4:3': {
    key: '4:3',
    label: '4:3 (复古影视/胶片画幅)',
    name: '传统胶片 Standard',
    comfyValue: '4:3 (Standard)',
    orientation: 'landscape',
    image1MpRes: '1152x864',
    video04MpRes: '720x540 (0.4MP)'
  },
  '3:4': {
    key: '3:4',
    label: '3:4 (竖版肖像画幅)',
    name: '肖像画幅 Portrait Standard',
    comfyValue: '3:4 (Portrait Standard)',
    orientation: 'portrait',
    image1MpRes: '864x1152',
    video04MpRes: '540x720 (0.4MP)'
  },
  '21:9': {
    key: '21:9',
    label: '21:9 (电影超宽银幕)',
    name: '超宽银幕 CinemaScope',
    comfyValue: '21:9 (CinemaScope)',
    orientation: 'landscape',
    image1MpRes: '1536x656',
    video04MpRes: '960x410 (0.4MP)'
  }
};

export interface AssetCard {
  id: string;
  title: string;
  role: string;
  previewUrl: string;
  pixelAudit: {
    greyPercent: number;
    euclideanDistance: number;
    bottomFloorBandPct: number;
  };
}

export const DRAMA_ASSET_CARDS: AssetCard[] = [
  {
    id: 'asset_scene',
    title: '80年代红砖老宅客厅母本',
    role: '场景环境卡',
    previewUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    pixelAudit: { greyPercent: 0.8, euclideanDistance: 8.5, bottomFloorBandPct: 12.0 }
  },
  {
    id: 'asset_male_lead',
    title: '男主角 1:1 融光定妆卡',
    role: '主角角色卡',
    previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    pixelAudit: { greyPercent: 1.2, euclideanDistance: 6.2, bottomFloorBandPct: 9.5 }
  }
];

export interface DramaSegmentShot {
  segmentIndex: number;
  shotIndex: number;
  shotScale: string;
  duration: number;
  prompt: string;
}

export interface DramaSegment {
  id: string;
  segmentIndex: number;
  title: string;
  start: number;
  end: number;
  duration: number;
  framesCount: number;
  speakerLabel: string;
  dialogueSnippet: string;
  shotScale: string;
  headCutoffCheck: { passed: boolean };
  lines: string[];
}

export const DEMO_DRAMA_SEGMENTS: DramaSegment[] = [
  {
    id: 'seg_1',
    segmentIndex: 1,
    title: '第 1 段 (0~15s) 开门对峙',
    start: 0,
    end: 15.083,
    duration: 15.083,
    framesCount: 362,
    speakerLabel: '顾沉 (S1)',
    dialogueSnippet: '见她如见我。谁敢动她分毫，就是跟我顾沉过不去。',
    shotScale: '9:16 (Portrait)',
    headCutoffCheck: { passed: true },
    lines: ['见她如见我。谁敢动她分毫，就是跟我顾沉过不去。']
  },
  {
    id: 'seg_2',
    segmentIndex: 2,
    title: '第 2 段 (15~30s) 桌前质问',
    start: 15.083,
    end: 30.166,
    duration: 15.083,
    framesCount: 362,
    speakerLabel: '女反派 (S2)',
    dialogueSnippet: '顾沉，你别以为仗着顾家撑腰就能为所欲为！',
    shotScale: '9:16 (Portrait)',
    headCutoffCheck: { passed: true },
    lines: ['顾沉，你别以为仗着顾家撑腰就能为所欲为！']
  }
];
