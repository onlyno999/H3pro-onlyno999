export interface GateDefinition {
  id: number;
  name: string;
  isHardBarrier: boolean;
  stageName: string;
  description: string;
  actionRequired: string;
  keyChecks: string[];
  stepIndex?: number;
  shortName?: string;
  phase?: string;
  reviewMode?: string;
}

export interface SixIronRule {
  code: string;
  title: string;
  rule: string;
}

export const SIX_IRON_RULES_LIST: SixIronRule[] = [
  { code: 'Rule A', title: '三卡同源，坚决去底', rule: '主角卡、配角卡、场景卡统一去摄影棚白底反光，生成地面接触阴影，残差距必须低于 1.5%。' },
  { code: 'Rule B', title: '口型节制，不过度咬合', rule: '口型占比控制在45%以内，非发声镜头强制嘴唇闭合，防止口型漂移。' },
  { code: 'Rule C', title: '17n+5 精确帧数对齐', rule: '严格遵守 H3 官方 17n+5 帧率对齐公式，15秒即362帧，绝不丢帧或重影。' },
  { code: 'Rule D', title: '零硬编码字幕', rule: '严禁在提示词中出现 no subtitles 等反向敏感词，负向词库强制压制字幕。' },
  { code: 'Rule E', title: '宽景全景防裁头', rule: '发声镜严禁使用贴面大特写，强制全景/宽景留足头顶空间，杜绝出画。' },
  { code: 'Rule F', title: '无台词纯画面+拟音', rule: '只要没有指定谁说的话，强制生成画面+动作拟音，绝对零背景BGM，彻底杜绝人声乱入。' }
];

export const GATES_DATA: GateDefinition[] = [
  { id: 1, name: '歌词与时间轴', isHardBarrier: false, stageName: '剧本期', description: '精确毫秒级对齐。', actionRequired: '核对台词节拍', keyChecks: ['时间无重叠', '节拍标记清晰'] },
  { id: 2, name: '故事板与景别', isHardBarrier: false, stageName: '分镜期', description: '镜头语言规划。', actionRequired: '景别合理分布', keyChecks: ['景别交替', '避免单调'] },
  { id: 3, name: '资产中台与定妆', isHardBarrier: true, stageName: '资产期', description: '1:1 切片与融光。', actionRequired: '上传三视图并切片', keyChecks: ['残差<1.5%', '去棚底白光'] },
  { id: 4, name: '音频音色锁', isHardBarrier: false, stageName: '音频期', description: '声线全局绑定。', actionRequired: '配置说话人ID', keyChecks: ['全片音色一致', '无跳声'] },
  { id: 5, name: '提示词硬门禁', isHardBarrier: true, stageName: '编译期', description: '六段式官方结构检测。', actionRequired: '通过11项机器检查', keyChecks: ['无字幕反向词', '防裁头安全'] },
  { id: 6, name: '时序与总长硬门禁', isHardBarrier: true, stageName: '排期期', description: '首尾闭环无断层。', actionRequired: '总长严格等于排期', keyChecks: ['15s无缝拼合', '首帧去重'] },
  { id: 7, name: 'RunningHub 调度', isHardBarrier: false, stageName: '渲染期', description: '云端节点分发。', actionRequired: '提交API任务', keyChecks: ['Node映射准确', '参数同步'] },
  { id: 8, name: '成片口型与防乱入', isHardBarrier: true, stageName: '质检期', description: '三验闸门与声学质检。', actionRequired: '逐段放行审核', keyChecks: ['滞后量<=80ms', '无声音乱入'] }
];

export interface StoryboardShot {
  id: string;
  index: number;
  start: number;
  end: number;
  duration: number;
  shotScale: string;
  prompt: string;
  negativePrompt: string;
  imageUrl?: string;
  seed?: number;
  costUsd: number;
  pool: 'free_quota' | 'priority_paid';
  fingerprint: string;
  lagMs?: number;
  correlation?: number;
  isLipSync: boolean;
  lyricsSnippet?: string;
  cameraMotion?: string;
  useUploadedBackground?: boolean;
  backgroundImageUrl?: string;
  backgroundImageName?: string;
  imageGenLogs?: string[];
  generatedKeyframeUrl?: string;
  imageGenStatus?: 'idle' | 'running' | 'success' | 'failed';
  imageGenPlugin?: string;
}

export interface LyricLine {
  id: string;
  start: number;
  end: number;
  text: string;
  speaker?: string;
  isInstrumental?: boolean;
  type: string;
  confidence: number;
}

export const DEMO_LYRICS: LyricLine[] = [
  { id: 'lyric_1', start: 0, end: 15.083, text: '雨水冲刷掉所有的诺言', speaker: 'S1', isInstrumental: false, type: 'vocal', confidence: 0.98 },
  { id: 'lyric_2', start: 15.083, end: 32.0, text: '唯独留下你转身的背影', speaker: 'S1', isInstrumental: false, type: 'vocal', confidence: 0.99 }
];

export const DEMO_STORYBOARD: StoryboardShot[] = [
  {
    id: 'shot_01',
    index: 1,
    start: 0,
    end: 15.083,
    duration: 15.083,
    shotScale: '9:16 (Portrait Widescreen)',
    prompt: `subject_definitions（主体定义）:
<Subject 1> 是 <Picture 1> 中的攀岩主角：身穿黑色短袖T恤、深色牛仔长裤与登山鞋，紧贴悬崖绝壁；
<Subject 2> 是 <Picture 2> 中的丹霞绝壁：高耸入云的红褐色陡峭岩壁，表面布满风化石窝，远处为苍翠群山。

声音设定：
本视频为无对白高空攀岩动作镜头，全片无说话人，无对白台词，无画外旁白，纯高空山风呼啸与脚步摩擦物理拟音。

detailed_description:
【Shot 1｜0–15.083秒｜全景拉远·绝壁攀爬】
【主体】<Subject 1> 紧贴陡峭巨岩表面，右臂伸展攀附岩壁孔洞。
【动作】<Subject 1> 单脚踩在岩壁浅坑微抬，右臂向外试探抓取更高石窝，身体平稳向上挪移。人物全程嘴唇自然紧闭，完全静止不发声（lips completely still and naturally closed, strictly no speaking, no vocalization, no voiceover, no singing, silent climber）。
【镜头】9:16 大全景缓缓向外拉远，凸显绝壁之高耸险峻与渺小人影的壮丽对比。
【音效】高空烈风呼啸声、鞋底与粗糙岩石颗粒摩擦沙沙声、细碎碎石滑落深渊回响；绝对无对白，无画外旁白，无人声呢喃。
【约束】五官面貌稳定，四肢抓握符合重力物理学，岩壁纹理无闪烁，画面纯净电影画质，严禁任何硬编码字幕与文字。`,
    negativePrompt: 'dialogue, speaking, talking, voiceover, narration, monologue, whispering, singing, screaming, female vocal, male vocal, phantom voices, muttering, human voice, mouth moving, parted lips, open mouth, vocalization, subtitles, text, watermark',
    imageUrl: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&auto=format&fit=crop&q=80',
    seed: 666,
    costUsd: 0.35,
    pool: 'priority_paid',
    fingerprint: 'rh_task_9021',
    lagMs: 0,
    correlation: 0.98,
    isLipSync: false,
    useUploadedBackground: false
  },
  {
    id: 'shot_02',
    index: 2,
    start: 15.083,
    end: 30.166,
    duration: 15.083,
    shotScale: '9:16 (Portrait Widescreen)',
    prompt: `subject_definitions（主体定义）:
<Subject 1> 是 <Picture 1> 中的攀岩主角；
<Subject 2> 是 <Picture 2> 中的丹霞绝壁峰顶。

声音设定：
本视频为纯环境音镜头，无说话人，无台词，无旁白。

detailed_description:
【Shot 2｜15.083–30.166秒｜近景跟拍·登顶俯瞰】
【主体】<Subject 1> 登上岩壁顶峰，迎风伫立。
【动作】主角双手撑膝大口喘气，随后直起身躯极目远眺。嘴唇自然闭合，嘴唇完全静止不讲话（lips naturally closed, completely still, no talking, no voiceover）。
【镜头】9:16 环绕旋转半身景，阳光洒在脸庞与肩膀。
【音效】狂风吹拂衣襟烈烈作响、沉重深呼吸换气声；绝无台词，无女声或男声杂音。
【约束】五官稳定一致，光影色调统一，无字幕无水印。`,
    negativePrompt: 'dialogue, speaking, talking, voiceover, narration, monologue, whispering, singing, screaming, female vocal, male vocal, phantom voices, muttering, human voice, mouth moving, parted lips, open mouth, vocalization, subtitles, text, watermark',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80',
    seed: 777,
    costUsd: 0.35,
    pool: 'priority_paid',
    fingerprint: 'rh_task_9022',
    lagMs: 0,
    correlation: 0.99,
    isLipSync: false,
    useUploadedBackground: false
  }
];
