/**
 * MiniMax H3 Official Prompt Engine & Validator
 * Validates against:
 * 1. MiniMax H3 Ref2VA Official Specification (6-section mandatory architecture)
 * 2. V2/V3/V4 Battle-Tested Consistency Locks:
 *    - Anti-Head Cutoff (Wide shots, feet inside frame, no clothing keywords in wide shot body)
 *    - Anti-Subtitle Trap (No negative text words like 'no subtitles', H3 is reverse-sensitive)
 *    - Single-Scene Ancestor Card & Anti-Hallway Grid
 *    - Clean Subject Definition Syntax (no standalone <Picture N> rows)
 *    - Speaker Mapping (Sx) and <d>[Language] ... </d> format
 *    - Exact Duration-to-Frames formula: 17n+5 (15s = 362 frames, 0.4MP = 480x864)
 */

export interface H3ValidationItem {
  id: string;
  name: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  tip?: string;
}

export interface H3ValidationResult {
  passed: boolean;
  score: number; // 0 to 100
  items: H3ValidationItem[];
  detectedSections: string[];
  missingSections: string[];
  headCutoffRisk: 'low' | 'moderate' | 'high';
  subtitleTrapDetected: boolean;
  hallwayPerspectiveRisk: boolean;
  calculatedFrames: number;
}

export const H3_MANDATORY_SECTIONS = [
  'subject_definitions',
  'summary',
  'retention_analysis',
  'detailed_description',
  'overall_soundscape',
  'non_diegetic_music'
];

/**
 * Calculates H3 exact frame count:
 * Official formula: max(5, round(a*24)) + (5 - (max(5, round(a*24)) % 17)) % 17
 * Satisfies 17n + 5 (e.g. 5s = 124 frames, 15s = 362 frames)
 */
export function calculateH3Frames(durationSeconds: number): { frames: number; exactDuration: number } {
  const rounded = Math.round(durationSeconds * 24);
  const base = Math.max(5, rounded);
  const remainder = base % 17;
  const offset = (5 - remainder + 17) % 17;
  const frames = base + offset;
  const exactDuration = Number((frames / 24).toFixed(4));
  return { frames, exactDuration };
}

/**
 * Validates a prompt against H3 Ref2VA Official Rules & Battle-Tested Locks
 */
export function validateH3Prompt(promptText: string, options?: { duration?: number; shotScale?: string }): H3ValidationResult {
  const items: H3ValidationItem[] = [];
  const text = promptText || '';
  const lowerText = text.toLowerCase();

  // 1. Check Mandatory Sections (supports both [section] and Chinese Whitelist format)
  const isChineseWhitelistFormat = /subject_definitions/i.test(text) && /detailed_description/i.test(text) && /【Shot/i.test(text);
  const detectedSections: string[] = [];
  const missingSections: string[] = [];

  if (isChineseWhitelistFormat) {
    detectedSections.push('subject_definitions', '声音设定', 'detailed_description', '【约束】');
  } else {
    for (const sec of H3_MANDATORY_SECTIONS) {
      const regex = new RegExp(`\\[${sec}\\]`, 'i');
      if (regex.test(text)) {
        detectedSections.push(sec);
      } else {
        missingSections.push(sec);
      }
    }
  }

  const sectionsPassed = isChineseWhitelistFormat || missingSections.length === 0;
  items.push({
    id: 'six_sections',
    name: 'H3 结构规范度 (Ref2VA / 动作语气台词细化)',
    passed: sectionsPassed,
    severity: sectionsPassed ? 'info' : 'error',
    message: sectionsPassed
      ? (isChineseWhitelistFormat ? '检测到符合烨哥 2026-09-22 官方中文白名单 + 【约束】实战规范' : '检测到全部 6 个官方标准段落（subject_definitions 至 non_diegetic_music）')
      : `缺少关键段落：${missingSections.map(s => `[${s}]`).join(', ')}`,
    tip: 'MiniMax H3 官方规范要求主体定义、分镜动作与约束严格按序出现。'
  });

  // 2. Check Anti-Subtitle Trap (Crucial battle-tested finding!)
  // In H3, writing "no subtitles", "no text", "no burned-in text" makes H3 draw MORE subtitles!
  const forbiddenAntiText = [
    'no subtitle',
    'no subtitles',
    'no text',
    'no words',
    'no caption',
    'no captions',
    'no burned-in',
    'no watermark'
  ];
  const foundAntiTextWords = forbiddenAntiText.filter(w => lowerText.includes(w));
  const subtitleTrapDetected = foundAntiTextWords.length > 0;

  items.push({
    id: 'anti_subtitle_trap',
    name: '规避 H3 烧入字幕反向敏感陷阱',
    passed: !subtitleTrapDetected,
    severity: subtitleTrapDetected ? 'error' : 'info',
    message: subtitleTrapDetected
      ? `检测到反向敏感词：${foundAntiTextWords.join(', ')}！H3 越点名越画字幕，绝对不要写这类负面词！`
      : '未触发反向字幕敏感词，台词将作为原生字幕正常处理或由后期覆盖。',
    tip: '实测证明：H3 对 "no subtitles" 类负面词反向敏感，点名 1 个可能出 2 条字幕。连风格块里也应彻底删除此类字眼。'
  });

  // 3. Check Head Cutoff Trap & Wide Shot Safety
  let headCutoffRisk: 'low' | 'moderate' | 'high' = 'low';
  const hasDialogue = /<d>.*?<\/d>/i.test(text) || /<d>\[.*?\]/i.test(text);
  const hasTightCloseup = /tight close-up|extreme close-up|tight closeup/i.test(lowerText);
  const hasWideShot = /wide shot|wide view|whole of .*? head to feet|stands small/i.test(lowerText);
  const mentionsClothingInBody = /gown|suit|velvet|earrings|bangle|wine glass|bare shoulders/i.test(lowerText);

  if (hasDialogue && hasTightCloseup) {
    headCutoffRisk = 'high';
    items.push({
      id: 'head_cutoff_tight',
      name: '发声镜防裁头安全检测',
      passed: false,
      severity: 'error',
      message: '在高潮或核心台词镜使用了紧特写 (Tight Close-Up)！实测 H3 近景裁头率高达 50%，角色发声时头顶极易出画！',
      tip: '改用宽景 (wide shot) 并写明 "whole of both of them from head to feet inside the picture"，相机远离保持全景入画。'
    });
  } else if (hasWideShot && mentionsClothingInBody && /detailed_description/i.test(text)) {
    headCutoffRisk = 'moderate';
    items.push({
      id: 'head_cutoff_clothing',
      name: '宽景文案防拽取特写检测 (机制 4)',
      passed: false,
      severity: 'warning',
      message: '宽景镜头描述中点名了具体衣着或配件（如 gown, velvet, earrings）！H3 可能会被拽过去做衣物特写导致裁头！',
      tip: '衣着已在 subject_definitions 中锁定，宽景镜文中不要再复述人物衣服和首饰，直接写角色代号并强调人物很小、头脚齐全。'
    });
  } else {
    items.push({
      id: 'head_cutoff_safe',
      name: '防裁头取景架构检测',
      passed: true,
      severity: 'info',
      message: '取景策略安全，未发现易导致头顶裁切的危险特写诱因。'
    });
  }

  // 4. Check Hallway Perspective Trap (Scene Scale)
  const describesSingleSideTables = /only on one side|left side of the aisle|tables on the left/i.test(lowerText) &&
    !/both sides of the central aisle|spread all the way/i.test(lowerText);

  items.push({
    id: 'hallway_perspective',
    name: '场景构图大气度检测 (防长走廊化)',
    passed: !describesSingleSideTables,
    severity: describesSingleSideTables ? 'warning' : 'info',
    message: describesSingleSideTables
      ? '餐桌或宾客仅描写在单侧，模型易生成一点透视狭窄走廊！'
      : '走道两侧皆布设圆桌与宾客，构图开阔大气。',
    tip: '写明 "twenty round tables standing on BOTH sides of the central aisle, spreading from left edge to right edge"。'
  });

  // 5. Check Subject Definitions Syntax: No Standalone <Picture N> Entries
  const hasStandalonePictureDef = /<picture\s+\d+>\s+is\s+the\s+reference\s+image/i.test(text) ||
    /\[retention_analysis\][\s\S]*?<picture\s+\d+>/i.test(text);

  items.push({
    id: 'subject_picture_syntax',
    name: '官方参考图引用语法 (<Subject N> 绑定)',
    passed: !hasStandalonePictureDef,
    severity: hasStandalonePictureDef ? 'error' : 'info',
    message: hasStandalonePictureDef
      ? '发现独立 <Picture N> 定义条目！官方规范要求将来源写进 <Subject N> 中，禁止把 Picture 单独成行！'
      : '参考图正确绑定在 <Subject N> 定义中，retention_analysis 仅列角色代号。',
    tip: '正确写法：<Subject 1> is the male lead. His face ... comes from <Picture 1>.'
  });

  // 6. Check Foley & Sound Effects Coverage (Prevents silent/dead moments!)
  const hasFoleyTag = /【音效】|overall_soundscape|sound effects|foley|ambient|clink|rustl|footstep|breath|murmur|whisper|底噪|摩擦|敲|雨声|风声/i.test(text);
  const hasEmptyFoley = /【音效】\s*无|【音效】\s*N\/A|【音效】\s*$/im.test(text);

  items.push({
    id: 'foley_coverage',
    name: '镜头级拟音与现场音效全覆盖检测 (Foley Coverage)',
    passed: hasFoleyTag && !hasEmptyFoley,
    severity: (hasFoleyTag && !hasEmptyFoley) ? 'info' : 'warning',
    message: (hasFoleyTag && !hasEmptyFoley)
      ? '已检测到精细现场拟音（敲击/摩擦/换气/环境底噪），杜绝画面出现无声死寂。'
      : '检测到部分镜头缺少具体【音效】描写！H3 将只会渲染对白而丢失环境拟音，导致画面干瘪寂静。',
    tip: '每个【Shot】都必须详写动作拟音（如：指节敲桌、搓烟纸、衣服摩擦、脚步声、呼吸叹气、环境底噪），以支撑电影级空间质感。'
  });

  // 7. Check Dialogue & Speaker ID Syntax
  if (hasDialogue) {
    const hasLanguageTag = /<d>\[[a-zA-Z\s]+\]/i.test(text);
    const hasSpeakerId = /\(S\d\)/i.test(text);
    const hasMouthMovementLock = /mouth moves only while/i.test(lowerText);

    items.push({
      id: 'dialogue_syntax',
      name: '台词标签与说话人 (Sx) 映射规范',
      passed: hasLanguageTag && hasSpeakerId,
      severity: hasLanguageTag && hasSpeakerId ? 'info' : 'warning',
      message: (hasLanguageTag && hasSpeakerId)
        ? `台词格式合规 (<d>[Language]</d> + 说话人全局编号)，${hasMouthMovementLock ? '含口型动静锁定' : '建议补充 mouth moves only while speaking'}`
        : '台词需用 <d>[Chinese] 台词</d> 并标注说话人 (S1)/(S2)/(S3) 以固定音色。',
      tip: '说话人编号全局固定（S1男主/S2女主/S3女配），跨段复用以保证音色一致。'
    });
  } else {
    // 8. Non-Dialogue Voice Leakage Trap Check (严防无台词时模型脑溢幽灵人声/旁白乱入)
    const hasExplicitMouthLock = /mouth naturally closed|lips completely still|silent character|no singing or talking|no voiceover|嘴唇紧闭|不发声|无对白/i.test(text);
    items.push({
      id: 'voice_leakage_guard',
      name: '无对白镜头声音乱入死锁检测 (Phantom Voice Guard)',
      passed: hasExplicitMouthLock,
      severity: hasExplicitMouthLock ? 'info' : 'error',
      message: hasExplicitMouthLock
        ? '已激活声音防乱入硬锁：已显式声明嘴唇自然紧闭且无画外音/对白，H3 音画模型不会随机脑补旁白。'
        : '危险！本分镜未安排台词，但未显式写入【嘴唇紧闭、不发声、无对白】声明！H3 是音画一体模型，极易自动脑补生成杂乱女声哭喊、画外音或旁白乱入！',
      tip: '无台词分镜必须在【动作】注入 "mouth naturally closed, lips completely still, strictly no voiceover, no dialogue"，彻底杜绝声音乱入。'
    });

    // 9. Ironclad Rule Check: Whenever no speaker is designated, generate ONLY Visuals + Foley, NO Background BGM!
    const hasZeroBgmDeclaration = /\[non_diegetic_music\]\s*(None|none|无|绝对静止|zero bgm|Zero BGM)/i.test(text) ||
      /无背景音乐|零bgm|zero background music|no non-diegetic|absolute silence on the music channel/i.test(text);
    const compliesIronLaw = hasFoleyTag && !hasEmptyFoley && hasZeroBgmDeclaration && hasExplicitMouthLock;

    items.push({
      id: 'iron_law_foley_zero_bgm',
      name: '铁律门禁：未指定说话人【画面+拟音·零BGM】核查 (Iron Law Guard)',
      passed: compliesIronLaw,
      severity: compliesIronLaw ? 'info' : 'error',
      message: compliesIronLaw
        ? '【铁律达标】未指定说话人时，已严格生成【画面+高精物理拟音】，背景BGM彻底归零（None），严禁任何对白旁白声音乱入！'
        : '【违反铁律】未指定说话人时，必须生成【画面+物理拟音】，且绝对没有背景BGM！当前缺少具体动作拟音、嘴唇未锁死，或未将 [non_diegetic_music] 锁死为 None！',
      tip: '铁律：只要没有指定谁说的话，生成画面+拟音。没有背景BGM。必须详写物理动作音效（脚步/呼吸/摩擦/碰撞），并将 [non_diegetic_music] 设为 None。'
    });
  }

  // Calculate Frames
  const duration = options?.duration || 15.083;
  const { frames } = calculateH3Frames(duration);

  // Score calculation
  const errorCount = items.filter(i => i.severity === 'error' && !i.passed).length;
  const warningCount = items.filter(i => i.severity === 'warning' && !i.passed).length;
  const score = Math.max(0, 100 - errorCount * 30 - warningCount * 15);
  const passed = errorCount === 0;

  return {
    passed,
    score,
    items,
    detectedSections,
    missingSections,
    headCutoffRisk,
    subtitleTrapDetected,
    hallwayPerspectiveRisk: describesSingleSideTables,
    calculatedFrames: frames
  };
}

import { AspectRatioType, ASPECT_RATIO_CONFIGS } from '../data/h3PipelineData';

export interface ConvertOptions {
  genre: 'cinematic' | 'short_drama' | 'commercial';
  aspectRatio?: AspectRatioType;
  shotScale?: string;
  speakerId?: string;
  dialogue?: string;
  subjectCount?: number;
  suppressBgm?: boolean;
  enforceLipsStill?: boolean;
}

export interface StoryArchetype {
  id: string;
  title: string;
  genre: 'short_drama' | 'cinematic' | 'commercial';
  aspectRatio: AspectRatioType;
  speakerId?: 'S1' | 'S2' | 'S3' | 'NONE';
  seedanceProse: string;
  dialogue: string;
  whySeedanceFailsInH3: string;
}

export const STORY_ARCHETYPES: StoryArchetype[] = [
  {
    id: 'iron_law_silent_action',
    title: '铁律标杆：未指定说话人 (纯画面 + 物理拟音 + 零BGM)',
    genre: 'short_drama',
    aspectRatio: '9:16',
    speakerId: 'NONE',
    seedanceProse: '暴雨倾盆的废弃机械厂区，特工身穿黑色防雨风衣潜行。雨水顺着战术风衣下摆滑落，皮靴踩碎积水水洼，发出清脆的踩水溅射声。特工停在集装箱后方，指节轻碰冰冷生锈的铁皮，呼吸深沉平缓，警惕环顾四周。全片无指定说话人，无台词，无旁白，无背景音乐；唯有密集雨声、水滴撞击铁桶声、脚步踏水拟音与深沉呼吸贯穿。',
    dialogue: '',
    whySeedanceFailsInH3: '【铁律硬门禁】：未指定说话人且未写台词时，若不进行硬锁定，H3 会脑溢出杂乱女声喘息、呻吟、旁白或廉价合成器BGM！本模板严格执行铁律：未指定说话人时，全量输出画面与具体物理拟音，嘴唇静止闭合，非剧情音乐设为 None，负向死锁 20 项声音乱入词与 BGM！'
  },
  {
    id: 'tiedan_cow_safety',
    title: '乡村喜剧：机器人铁蛋放牛 (大白话安全脱敏实战)',
    genre: 'short_drama',
    aspectRatio: '9:16',
    speakerId: 'S1',
    seedanceProse: '阳光明媚的梯田山坡，银色机器人铁蛋（银色机身、胸口"铁蛋"二字、蓝色发光屏幕脸）手拿小柳条悠闲放牛。铁蛋开口说："老牛们乖乖吃草啊"；突然一头大黄牛刨蹄子喘粗气被激怒，向前猛冲顶起，铁蛋被牛撞飞，夸张滑稽地腾空翻转两周半坐落在松软草垛上，激起一圈金黄色草屑。乡村喜剧，结尾亮场。',
    dialogue: '老牛们乖乖吃草啊，谁不听话我可要扣草料啦！',
    whySeedanceFailsInH3: '大白话里的"被牛撞飞"、"重重撞击"等词极易触发安全内容网关的 integrity_check_failed 暴力拦截！第 1 步智能安全转译器会自动将其转化为"卡通物理滑稽弹跳 + 松软草垛缓冲 + 金黄草屑特效"，视觉张力更强且 100% 秒过安全审核！'
  },
  {
    id: 'drama_dining_room',
    title: '深夜餐桌：女人开口要校车费 (烨哥 2026-09-22 实战标准)',
    genre: 'short_drama',
    aspectRatio: '16:9',
    speakerId: 'S1',
    seedanceProse: '夜晚家用餐厅，木桌居中，一盏暖黄吊灯。女人（约38岁，扎马尾，灰色居家睡衣）不看对面的男人，指节轻敲桌面，压着情绪开口要校车费；男人（约40岁，深色旧短袖T恤，胡茬）在吊灯阴影里缩在椅中，手指搓着没点的烟，声音低沉发闷挤出一句"我没钱"，喉结滚动，选了沉默不抬眼。电影感写实，中景双人，无夸张表情。',
    dialogue: '这个月小孩校车费，还有午餐费，你交一下',
    whySeedanceFailsInH3: '1. 传统写法容易用"悲伤/压抑"等形容词导致 AI 无法具象化表演；2. 缺少【约束】与中文白名单导致餐桌上饭菜与烟灰缸在换镜后消失或漂移；3. 动作未与台词精确嵌入导致口型错位。本案例已完全采用中文白名单+【约束】双保险防漂移标准！'
  },
  {
    id: 'fight_cqc_warehouse',
    title: '仓库格斗：近身肉搏与侧闪重拳 (Fight-FX 动作戏标准)',
    genre: 'short_drama',
    aspectRatio: '9:16',
    speakerId: 'S1',
    seedanceProse: '昏暗废弃仓库，两根斑驳水泥立柱之间，地面有浅积水。身穿贴身战术背心的特工主角与手持铁棍的魁梧打手近身厮杀。打手怒吼着双手横抡铁棍砸来，主角后仰下潜避开带风的铁棍，随即拧腰蹬地，一记爆发力极强的右勾拳重重轰在打手左肋；打手被击中瞬间肌肉剧烈凹陷，唾液横飞，失控横撞向后方水泥立柱。打斗动作极速硬朗，击中瞬间微慢动作定格，伴随金属与沉重肉体击打拟音，无血腥致死，电影级动作特技。',
    dialogue: '动我的人，你还没这个资格。',
    whySeedanceFailsInH3: '1. 传统打斗描述写"两人激烈打斗在一起"，AI 会自由乱晃、肢体粘连变形；2. 缺少击打落点与反作用力位移锚定，导致打击无力量感；3. 未配置镜头级肉体与金属拟音导致打斗死寂；4. 暴力词汇极易触发风控。调用 fight-fx-anchor-prompter 即可自动完成三段式动作矢量与变速齿轮拆解！'
  },
  {
    id: 'drama_ballroom',
    title: '豪门夜宴：真假千金当场摊牌',
    genre: 'short_drama',
    aspectRatio: '9:16',
    speakerId: 'S1',
    seedanceProse: 'A luxurious crystal grand ballroom packed with elite guests in black-tie suits. The cold brooding male CEO in a sharp black bespoke tuxedo strides down the marble aisle with long steps, holding the hand of the falsely accused female lead in a wine-red velvet gown. The arrogant antagonist heiress with sharp eyebrows smirks and holds a glass of red wine, asking angrily: "Who gave you permission to step into this banquet?" The male CEO steps firmly in front of the female lead with piercing eyes, declaring coldly: "Touching her is touching me." High quality 8k photorealistic, close-up on male CEO face, no text, no subtitles, cinematic lighting.',
    dialogue: '见她如见我。谁敢动她分毫，就是跟我顾沉过不去。',
    whySeedanceFailsInH3: '1. 特写 close-up 导致 50% 概率头顶裁切；2. "no subtitles" 诱发 H3 反向敏感烧出两道乱码假字幕；3. 散文描述缺少 [subject_definitions] 导致换镜头男主变脸；4. 模型自带 BGM 导致每段接缝出现爆音断层。'
  },
  {
    id: 'cinematic_cyber_rain',
    title: '影视短片：雨夜赛博与霓虹叙事',
    genre: 'cinematic',
    aspectRatio: '16:9',
    speakerId: 'S2',
    seedanceProse: 'A futuristic rainy cyberpunk skybridge illuminated by saturated teal and amber neon lights reflecting on wet asphalt puddles. The melancholic female character in a shimmering holographic trench coat stands pensively by the highway railing with intense emotional expressions. The camera moves in a smooth circular tracking orbit around her as glowing hovercars speed past in the background. Ultra realistic 8k, masterpiece, cinematic dialogue, intimate close-up framing, no watermark, no text.',
    dialogue: '雨水冲刷掉所有的诺言，唯独留下你转身的背影。',
    whySeedanceFailsInH3: '1. 缺少对白时间戳对齐与 45% 发声率控制，全程张嘴会导致口型油腻崩解；2. 16:9 横屏未做黄金三分法防裁边声明；3. 特写镜头在第 3 秒向斜上方漂移导致下巴出画；4. "no watermark" 触发字符生成。'
  },
  {
    id: 'commercial_watch',
    title: '极速先锋：微距钛金智能腕表',
    genre: 'commercial',
    aspectRatio: '1:1',
    speakerId: 'S1',
    seedanceProse: 'Minimalist pitch-black exhibition chamber with dramatic rim lighting. A luxury flagship smartwatch made of brushed aerospace-grade titanium and sapphire crystal rotates smoothly on a magnetic anti-gravity pedestal. Extreme macro close-up sweeps across micro-gear escapement and pulsing luminescent display, then pulls back to reveal the muscular wrist of an athlete grasping carbon handlebars in morning fog. An authoritative narrator voiceover speaks. Photorealistic, 8k render, cinematic 24fps motion blur, no text, no logo.',
    dialogue: '卓越非凡，每一瞬皆由意志铸就。',
    whySeedanceFailsInH3: '1. 1:1 方形画幅缺少对称锚定；2. 正向写 "no logo, no text" 会反向生成无意义扭曲字符；3. 画外音未声明 off-screen 导致模型试图在表盘上长出嘴巴做口型；4. 产品材质细节缺少 <Picture 1> 同源锁。'
  },
  {
    id: 'cinema_mist_dock',
    title: '雾港谍影：旧码头的一场密会',
    genre: 'short_drama',
    aspectRatio: '21:9',
    speakerId: 'S1',
    seedanceProse: 'Heavy cold sea fog rolling over a 1940s Victorian industrial dockyard with towering rusty gantry cranes fading into misty grey skies. Two men in heavy charcoal wool overcoats stand five meters apart on opposite sides of weathered wooden crates. Cold wind whips their collars as one lights a pipe, red ember glowing in the shadows. Suspenseful standoff atmosphere, cinematic widescreen 21:9, close-up two shot, dialogue exchange, no subtitles, masterpiece, film grain.',
    dialogue: '今晚最后一班货轮开走前，我要看到那封电报。',
    whySeedanceFailsInH3: '1. 21:9 宽银幕使用近景两 shot 会导致两人头顶与肩膀双重出画；2. 缺少同源场景卡导致码头背景在下一个分镜变成现代集装箱码头；3. 烟雾与光斑若无锁定会引发帧间闪烁。'
  }
];

/**
 * Safety & Content Policy Sanitizer (大白话安全转译与喜剧脱敏引擎)
 * Solves: 'integrity_check_failed' / '违反安全策略' / '暴力拦截'
 * Automatically converts raw colloquial violent/crash words into safe cinematic motion, slapstick comedy, and physics VFX in Step 1!
 */
export interface SafetySubstitution {
  original: string;
  replaced: string;
  reason: string;
}

export const SAFETY_PARAPHRASING_RULES = [
  {
    regex: /(被\S*?撞飞|被牛撞飞|撞飞出去|撞飞|撞翻|顶飞)/gi,
    replacement: '向前猛冲顶起，身形夸张滑稽地轻盈腾空翻转两周半，平稳坐落在松软草垛上，激起一圈金黄色草屑（滑稽喜剧动作，卡通物理弹跳，无真实物理伤害）',
    reason: '避免物理人身伤害/暴力撞击敏感词，转译为高张力滑稽动作喜剧与草垛缓冲'
  },
  {
    regex: /(打架|互殴|殴打|暴打|痛揍|按在地上打)/gi,
    replacement: '发生戏剧性肢体推搡与拉扯争执，镜头伴随震动微倾，一人踉跄后退数步撞倒木椅（动作喜剧编排，无真实血腥暴力）',
    reason: '将互殴暴力转译为戏剧推搡与摄影机震颤'
  },
  {
    regex: /(流血|吐血|见血|砍伤|鲜血淋漓)/gi,
    replacement: '脸颊与衣服沾染深色泥浆与暗红酱汁污渍，神情戏剧化发愣',
    reason: '杜绝血腥词汇，转译为影视级污渍与戏剧化停顿'
  },
  {
    regex: /(摔死|砸死|杀死|刺死|击毙|枪杀)/gi,
    replacement: '受剧烈气浪与烟幕推动退入两侧阴影，镜头快速切为全景空镜定格',
    reason: '杜绝致死/杀戮词汇，转译为视效烟幕与景别切换'
  },
  {
    regex: /(撞车|翻车|车祸)/gi,
    replacement: '车身做出极速漂移甩尾避让，轮胎擦出刺耳摩擦音与白色烟雾，平稳停在路肩',
    reason: '将恶性车祸转译为特技漂移避险'
  },
  {
    regex: /(爆炸|炸毁|粉身碎骨)/gi,
    replacement: '绚丽的金色火花与浓厚白色烟雾特效在背景爆开，产生戏剧性强光与气浪冲击',
    reason: '将毁灭性爆炸转译为舞台级火花与气浪光效'
  }
];

export function sanitizeSafetyPrompt(rawText: string): { sanitized: string; substitutions: SafetySubstitution[] } {
  let text = rawText || '';
  const substitutions: SafetySubstitution[] = [];

  for (const rule of SAFETY_PARAPHRASING_RULES) {
    if (rule.regex.test(text)) {
      rule.regex.lastIndex = 0;
      const matches = text.match(rule.regex) || [];
      for (const m of matches) {
        substitutions.push({
          original: m,
          replaced: rule.replacement,
          reason: rule.reason
        });
      }
      text = text.replace(rule.regex, rule.replacement);
    }
  }

  return { sanitized: text, substitutions };
}

/**
 * Intelligent Converter: Converts messy / awesome-seedance prompts into
 * compliant MiniMax-H3 Ref2VA Six-Section Prompts
 */
export function convertAwesomeSeedanceToH3(
  rawPrompt: string,
  options: ConvertOptions
): string {
  const {
    genre,
    aspectRatio = '9:16',
    speakerId = 'S1',
    dialogue = '',
    suppressBgm = true,
    enforceLipsStill = false
  } = options;

  const arConfig = ASPECT_RATIO_CONFIGS[aspectRatio] || ASPECT_RATIO_CONFIGS['9:16'];

  // Step 1: Run Safety & Content Policy Sanitization (Anti-integrity_check_failed)
  const { sanitized: safetyCleaned } = sanitizeSafetyPrompt(rawPrompt);

  // Clean raw prompt: remove harmful anti-subtitle words
  let cleaned = safetyCleaned
    .replace(/no\s+(subtitles?|words?|texts?|captions?|watermarks?|logos?|burned-in)/gi, '')
    .replace(/masterpiece|8k|4k|photorealistic|high\s+quality|ultra\s+realistic/gi, '')
    .trim();

  // Determine if a dialogue is genuinely specified
  const hasValidSpeaker = Boolean(speakerId && speakerId !== 'NONE');
  const isDialogueSpecified = Boolean(dialogue && dialogue.trim().length > 0);
  let extractedDialogue = dialogue;
  if (!extractedDialogue && hasValidSpeaker) {
    const quoteMatch = rawPrompt.match(/["“](.*?)["”]/);
    if (quoteMatch) {
      extractedDialogue = quoteMatch[1];
    }
  }

  // 核心铁律：只要没有指定谁说的话，或没有对白，强制开启纯动作+拟音，绝无BGM
  const isSilentActionOnly = !hasValidSpeaker || !isDialogueSpecified || !extractedDialogue;
  if (isSilentActionOnly) {
    extractedDialogue = '';
  }
  const effectiveLipsStill = enforceLipsStill || isSilentActionOnly;
  const effectiveSuppressBgm = true; // 铁律：永远压制非剧情 BGM，为纯物理拟音与后期铺底让路

  // Framing text tailored by Aspect Ratio to prevent Head Cutoff & Edge Clipping
  let framingRule = '';
  if (arConfig.orientation === 'portrait') {
    framingRule = `The camera framing maintains strict vertical safety: head is positioned at 6% below top border, feet are at 92% above bottom border with generous floor space visible under shoes. The whole body from head to feet remains completely inside the ${arConfig.label} picture with wide clearance. The camera stays far back and never pushes in.`;
  } else if (arConfig.orientation === 'landscape') {
    framingRule = `The camera framing utilizes wide cinematic horizontal scope (${arConfig.label}): subjects are composed across horizontal golden thirds with generous side room. Full figures remain completely inside the frame from head to toe with zero edge cropping. The camera holds a steady wide perspective.`;
  } else {
    framingRule = `The camera framing utilizes balanced square symmetry (${arConfig.label}): central visual anchor with equal margins on all four borders. The whole subject remains fully within frame boundaries.`;
  }

  const musicDirective = FORBIDDEN_WORDS_LEXICON.bgmSuppressionPositivePhrase;

  if (genre === 'short_drama') {
    if (rawPrompt.includes('铁蛋') || rawPrompt.includes('机器人') || rawPrompt.includes('放牛') || rawPrompt.includes('tiedan')) {
      const tiedanVoiceSetting = isSilentActionOnly
        ? `声音设定（铁律：未指定说话人，严禁对白与声音乱入，纯画面+现场拟音，零BGM）：\n全片未指定说话人，严禁生成任何人物对白、台词、画外旁白或幽灵人声；铁蛋黑色屏幕保持萌系表情，全程人物与角色嘴唇自然紧闭完全静止不发声。声音通道仅保留现场物理动作拟音与环境底噪，绝无背景音乐（Zero BGM）。`
        : `声音设定：\n<Subject 1> 铁蛋使用 (${speakerId || 'S1'}) 标记，小孩般清脆稚嫩的机械童声，全片保持一致。`;

      const tiedanAction = isSilentActionOnly
        ? `【动作】<Subject 1> 蹲在菜地里拔起一颗翠绿大白菜，面部黑色屏幕上蓝色 Emoji 笑脸微微闪烁眨眼，全程保持安静不发声（strictly silent character, no dialogue, no voiceover）。`
        : `【动作】<Subject 1> (${speakerId || 'S1'}) 蹲在菜地里拔起一颗翠绿大白菜，面部黑色屏幕上蓝色 Emoji 笑脸微微闪烁眨眼，语调欢快地说：\n<d>[中文] ${extractedDialogue || '老牛们乖乖吃草啊，今晚铁蛋加餐！'}</d>`;

      return `subject_definitions（主体定义）:
<Subject 1> 是 <Picture 1> 中的银色机器人铁蛋：圆润可爱的智能机器人，银色机身，头盔圆滑。
【面部死锁】：面部必须是纯平光滑的黑色椭圆显示屏，上面仅显示极简蓝色 2D 扁平 Emoji 发光线条表情（弯月眼睛与笑脸嘴角）。
⛔ 绝对严禁（STRICTLY FORBIDDEN）：严禁出现任何写实人类五官、严禁出现人类鼻子、严禁出现人类嘴唇轮廓与肌肉骨骼、严禁出现写实人形赛博格或猛男脸部雕塑轮廓！
【文字与位置死锁】：黑色宋体"铁蛋"二字仅固定印在胸口正中央，后背为纯银色光滑装甲，后背绝对无字！
【服饰与部位死锁】：双腿大腿部位固定为红色护腿套，双臂为纯银色金属装甲！⛔ 绝对严禁将红色标识转移到双臂袖口或肩部！
【跨段人物连贯性】：自动锁定上段（Shot 1）结尾关键帧 <Picture 1> 的人物细节，爬出水面或奔跑时服饰部位 100% 吻合！
<Subject 2> 是 <Picture 2> 中的大黄牛：健壮温顺的成年黄牛，毛色姜黄，牛角微微弯曲。
<Subject 3> 是 <Picture 3> 中的乡村菜地与水塘山坡场景母本：红砖田垄，嫩绿白菜，远处竹篱笆与池塘，日光晴朗。
<Subject 4> 是 <Picture 4> 作为起始画面参考图，控制开场构图与人物位置。

${tiedanVoiceSetting}

detailed_description:
【Shot 1｜0–5秒｜宽景全景·铁蛋收菜放牛】
【主体】<Subject 1> 铁蛋位于画面正中偏左，身旁放着麻布袋，<Subject 2> 大黄牛在右侧田垄旁低头吃草。
${tiedanAction}
【镜头】${arConfig.label} 宽景全景安全框，头顶留空 6%，脚底留地 10%，镜头保持平稳宽画幅，绝不向前推近特写。
【音效】微风吹拂菜叶沙沙声、拔菜清脆断根声、泥土摩擦声、远处牛吃草咀嚼声（纯现场物理拟音；绝无对白台词，绝无画外音，无背景音乐BGM）。
【约束】严格锁定黑色屏幕与蓝色 2D Emoji 萌系表情，绝无写实人脸五官；"铁蛋"二字仅在胸前；动作幅度平稳自然。

[non_diegetic_music]
${musicDirective}`;
    }

    if (rawPrompt.includes('格斗') || rawPrompt.includes('打斗') || rawPrompt.includes('厮杀') || rawPrompt.includes('铁棍') || rawPrompt.includes('肉搏') || rawPrompt.includes('fight') || rawPrompt.includes('拳击') || rawPrompt.includes('武打')) {
      const fightVoiceSetting = isSilentActionOnly
        ? `声音设定（铁律：未指定说话人，严禁对白与声音乱入，纯画面+现场格斗拟音，无背景BGM）：\n全片未指定说话人，严禁生成任何人物对白、台词、画外旁白或幽灵人声；全片人物嘴唇自然紧闭全程完全静止不发声。声音通道仅保留现场物理格斗动作拟音（钢管破空、肉体闷响、撞击、骨骼受压）与空间底噪，绝无背景音乐（Zero BGM）。`
        : `声音设定：\n<Picture 1> 是说话人用 (${speakerId || 'S1'}) 标记，参考音频 1，冷冽低沉青年音，全片保持一致。\n<Picture 2> 仅在受击与挥击时发出闷哼咆哮，非对白镜头嘴唇保持完全紧闭静止。`;

      const fightDialogueAction = isSilentActionOnly
        ? `<Subject 1> 眼神冷峻如冰，全程嘴唇自然紧闭完全静止不发声（lips completely still and naturally closed, silent character, strictly no speaking, no dialogue, no voiceover）；其余人物全程嘴唇完全紧闭静止。`
        : `说完眼神冰冷，语气低沉短促说：\n<d>[中文] ${extractedDialogue}</d>\n说完嘴唇立即闭拢并抿成一条线，保持冷酷沉默；其余人物全程嘴唇紧闭（mouths completely still）。`;

      return `[fight_fx_skill_active]
MiniMax H3 动作打斗戏与特效锚定规范 (Fight FX Anchor) 已激活：启用物理轨迹三段式拆解、变速齿轮与镜头拟音！

subject_definitions（主体定义）:
<Subject 1> 是 <Picture 1> 中的特工主角：身穿黑色战术紧身背心与工装裤，身形精悍，动作敏捷凌厉；
<Subject 2> 是 <Picture 2> 中的魁梧打手：身形高大彪悍，手持黑色实心铁棍，面目狰狞；
<Subject 3> 是 <Picture 3> 中的废弃仓库：昏暗空间，两根斑驳水泥立柱居中，地面散落碎砖与浅积水；
<Subject 4> 是 <Picture 4> 作为起始画面参考图，控制开场对峙站位与空间纵深。

${fightVoiceSetting}

detailed_description:
【Shot 1｜0–4秒｜近景动态跟拍·侧闪下潜与重拳击肋】
【主体】<Subject 1> 居画面中心，<Subject 2> 自右侧逼近，双手高举铁棍。
【动作】<Subject 2> 怒吼着双手横抡铁棍横扫头部，破空呼啸凌厉；<Subject 1> 瞬间后仰下潜闪避，铁棍裹挟劲风贴着鼻尖呼啸擦过；紧接着 <Subject 1> 左脚蹬地拧腰转胯，右勾拳如出膛炮弹般自下而上重重轰中 <Subject 2> 左肋软骨。<Subject 2> 肋部肌肉受击瞬间剧烈凹陷，唾液与汗水向后爆散飞溅，整个人被横向巨力击得失控滑退两米，重重撞在水泥立柱上，激起一圈墙灰散落。${fightDialogueAction}
【镜头】${arConfig.label} 动态手持低角度跟拍，击中瞬间微慢动作 (0.3x speed ramping) 放大冲击力，伴随 0.2 秒轻微震屏 (camera shake amplitude 3px)。
【音效】铁棍破空呼啸声 (whooshing air drag)、沉重肉体闷击沉音 (heavy flesh impact thud)、肋骨受压迫闷响、受击者肺部剧烈换气闷哼、身体重重撞击水泥立柱崩裂声；绝无人物对白台词，绝无画外旁白，绝无BGM背景音乐。
【约束】五官面部稳定无走样，关节弯折完全符合人体运动学物理定律，击打点与受力反馈精确咬合，绝无多余肢体生成；光影色调稳定，严禁任何硬编码字幕与文字。

[overall_soundscape]
Pure kinetic fight sound effects and heavy breathing; strictly zero human speech, zero voiceover, zero phantom vocal.

[non_diegetic_music]
${musicDirective}`;
    }

    if (rawPrompt.includes('校车费') || rawPrompt.includes('餐桌') || rawPrompt.includes('dining_room')) {
      return `subject_definitions（主体定义）:
<Subject 1> 是 <Picture 1> 中的餐厅：夜晚的家用餐厅，木桌居中、两侧各一把木餐椅；桌上方一盏暖黄吊灯；后窗深色窗帘半掩、窗外夜色暗；素色肌理墙、木地板。桌上有几盘没动过的饭菜（汤碗上结一层薄油）、两双木筷、一个圆形透明玻璃烟灰缸（里面已有几个烟头）。是餐厅场景，环境和空间结构参考；桌上物品以上述为准，全程不得添加、移动或碰触其他物件。
<Subject 2> 是 <Picture 2> 中的男人：约40岁，东亚面孔，深色短发略凌乱、面部有胡茬，深色旧短袖T恤、灰长裤、拖鞋；脸大半易陷吊灯阴影。
<Subject 3> 是 <Picture 3> 中的女人：约38岁，东亚面孔，黑长发扎马尾、两侧碎发，灰色长袖居家睡衣套装。
<Subject 4> 是 <Picture 4> 作为起始画面参考图，控制开场构图、人物位置和场景状态。
声音设定：
<Picture 2> 是说话人用 (S2) 标记，参考音频 2，并在全片保持一致
<Picture 3> 是说话人用 (S1) 标记，参考音频 1，并在全片保持一致
detailed_description:
【Shot 1｜0–4秒｜中景双人·女人开口】
【主体】<Subject 3> 画面左侧居主体，<Subject 2> 画面右侧虚化入镜。
【动作】<Subject 3> (S1) 视线落在桌上一盘凉透的青菜上，不看对面；右手指节轻敲桌面，前三下慢、后两下快，像在心里算账；说完停半秒，指尖停在桌面没抬起，尾音微微拖长、像例行公事却藏着试探，等他接话。音量中等、语速平稳、压着情绪说：
<d>[中文] ${extractedDialogue || '这个月小孩校车费，还有午餐费，你交一下'}</d>
【镜头】${arConfig.label} 中景双人，餐桌侧面固定镜头，暖黄吊灯从上方打下、画面偏暗；左脸受光右脸暗。
【音效】暖吊灯底噪、冰箱嗡鸣；指节敲桌细微声响；无筷子声。
【约束】五官稳定，面部不扭曲，口型与台词同步，画面无跳变；人物外观与服装前后一致，暖黄偏暗光线一致。

【Shot 2｜4–7秒｜中景双人·男人回应】
【主体】<Subject 2> 画面右侧居主体，<Subject 3> 画面左侧边缘、视线仍落菜上。
【动作】<Subject 2> 先听见、没动，脸大部在吊灯阴影里，肩垮着缩在椅中；手指夹着没点的烟，指腹来回搓烟纸，发出细微沙沙声——没抬头、没接话。随后闷声从胸腔挤出，声音低沉发闷、像憋着气说：
<d>[中文] 我没钱</d>
说完嘴唇抿成一条线，喉结滚一下，把更多话咽回去；不再接话，烟仍在指间搓着，选了沉默不抬眼。
【镜头】${arConfig.label} 中景双人，餐桌侧面固定镜头，与 Shot 1 机位一致。
【音效】搓烟纸细微沙沙声贯穿；说完后的换气与吞咽声；底噪贯穿；无对白外的言语。
【约束】五官稳定，面部不扭曲，口型与台词同步，画面无跳变；人物外观与服装前后一致，暖黄偏暗光线一致；人物机体与衣物表面严格保持纯净一致，严禁出现任何额外贴纸、腰部徽标Logo、身体涂鸦、大腿挂件或杂质印花；画面纯净电影画质，画面严禁任何硬编码字幕与文字覆盖，无台词条，无水印；排除表情夸张、动作幅度过大或任何笑容轻松表情。

[non_diegetic_music]
${musicDirective}`;
    }

    const voiceSettingBlock = isSilentActionOnly
      ? `声音设定（铁律：未指定说话人，严禁对白与声音乱入，纯画面+现场拟音，零BGM）：\n全片未指定说话人，严禁生成任何人物对白、台词、画外旁白或幽灵人声；全片人物嘴唇自然紧闭全程完全静止不发声。声音通道仅生成高保真现场物理动作拟音与空间环境底噪，绝无非剧情背景音乐（Zero BGM）。`
      : `声音设定：\n<Subject 1> (${speakerId}) 始终使用一种固定的声音：约30岁成熟青年男性，中低音，声线磁性沉稳，常态语速有力，句尾利落收束。禁止播音腔与夹子音。\n<Subject 2> (S2) 始终使用一种固定的声音：青年女性，中高音，清柔坚韧。`;

    const speechAction = isSilentActionOnly
      ? `<Subject 1> 眼神冷峻平视前方，全程嘴唇自然紧闭完全静止不发声（lips completely still and naturally closed, silent character, strictly no speaking, no dialogue, no voiceover, no singing）。`
      : `<Subject 1> (${speakerId}) 眼神坚定平视前方，语气低沉有力、句尾利落收束说：<d>[Chinese] ${extractedDialogue}</d>。说完嘴唇立即闭拢并抿成一条线，不再接话，保持完全沉默闭唇；其余人物全程嘴唇完全紧闭静止（mouths completely still）。`;

    return `## P01｜15.083秒 (362帧)｜豪门宴会冲突

[aspect_ratio]
${arConfig.label} (${arConfig.name}) | ComfyUI Node 456: ${arConfig.comfyValue} | Node 529: 15.083s (362 frames)

[subject_definitions]
<Subject 1> is the male lead. His face, tall stature, dark bespoke suit and spread-collar white dress shirt come from <Picture 1>, and <Picture 1> also carries the ballroom he stands in. Smooth clean-shaven cheeks with no stubble.
<Subject 2> is the female lead. Her face, slender frame, wine-red velvet gown, and straight black hair hanging clearly well past her chest come from <Picture 2>.
<Subject 3> is the wealthy antagonist woman from <Picture 3>.
<Subject 4> is the grand banquet ballroom with five tiered crystal chandeliers and twenty round tables spread across both sides of the central aisle from <Picture 1>.

${voiceSettingBlock}

[summary]
Inside the opulent ballroom, a tense confrontation unfolds along the marble aisle as characters exchange decisive words. (Total duration: 15.083s / 362 frames).

[retention_analysis]
<Subject 1>, <Subject 2>, <Subject 3> and <Subject 4> are preserved from <Picture 1>, <Picture 2> and <Picture 3>. All character surfaces, clothing, and chassis maintain pure texture consistency from reference images: strictly zero extra stickers, zero waist emblems, zero painted decals, zero dangling accessories.

[detailed_description]
The grade is locked and identical in every shot: the same exposure, warm amber highlights, and contrast curve from the first shot to the last. No two shots repeat the same framing. ${FORBIDDEN_WORDS_LEXICON.characterPurityPositivePhrase}
${framingRule}
[Shot 1｜0–5秒] The shot opens on a wide shot of <Subject 4> taken from the far side of the room at chest height, the ivory-draped tables spread across both sides of the frame. <Subject 1> stands small in the aisle, the whole of his body from head to feet completely inside the picture. ${speechAction}
【音效】皮鞋踏在光滑大理石上的沉稳脚步声、衣料轻微摩擦沙沙声、宴会远端空间底噪（现场纯物理拟音；绝无对白台词，绝无画外旁白，绝无BGM）。

[Shot 2｜5–10秒] The shot cuts to a medium two-shot showing listeners reacting across the aisle as the antagonist grips her glass. All subjects keep lips closed and completely still.
【音效】红酒杯轻微晃动声、倒吸一口凉气的抽气声、大厅吊灯电流微鸣（绝无人物言语，绝无背景音乐）。

[Shot 3｜10–15.083秒] The shot cuts to a wide cinematic tableau. <Subject 1> steps forward shielding <Subject 2>. Final frame holds steady with character postures locked for seamless continuation.
【音效】布料摩擦声、沉稳有力的呼吸换气声、远端低频回响；严格零BGM。

[overall_soundscape]
Muffled murmur of background ballroom guests, subtle clink of champagne flutes on distant tables, quiet room tone; strictly zero dialogue, zero voiceover, zero phantom vocal.

[non_diegetic_music]
${musicDirective}`;
  }

  if (genre === 'commercial') {
    return `[aspect_ratio]
${arConfig.label} (${arConfig.name}) | ComfyUI Node 61: ${arConfig.comfyValue} | T2I Res: ${arConfig.image1MpRes} | H3 Video Res: ${arConfig.video04MpRes}

[subject_definitions]
<Subject 1> is the premium product featuring brushed titanium facets, crystal accents, and micro-engineered precision coming from <Picture 1>.
<Subject 2> is the modern minimalist setting with dramatic architectural rim lighting from <Picture 1>.

[summary]
A dynamic cinematic showcase revealing the core precision and luxurious texture of the flagship product.

[retention_analysis]
<Subject 1> and <Subject 2> are preserved from <Picture 1>.

[detailed_description]
The grade is locked and identical in every shot: rich filmic contrast with pristine specular highlights on metallic textures.
${framingRule}
[Shot 1] Macro tracking shot sweeping over precision mechanical facets, light glinting smoothly across the surface.
[Shot 2] Smooth lateral slide revealing the product in its architectural environment.
[Shot 3] Authoritative hero angle: the product bathed in dramatic rim lighting. ${isDialogueSpecified ? `An off-screen narrator voiceover speaks: <d>[Chinese] ${dialogue}</d>.` : 'All subjects remain completely silent, strictly zero voiceover, zero narration, zero dialogue.'} The camera stays locked and pristine.

[overall_soundscape]
Subtle ambient reverberation, crisp mechanical click of precision components, quiet room tone; strictly no voiceover, no background music.

[non_diegetic_music]
${musicDirective}`;
  }

  // Default MV
  const mvSingingAction = effectiveLipsStill
    ? FORBIDDEN_WORDS_LEXICON.mouthStillPositivePhrase
    : (isDialogueSpecified ? `Singing vocals: "${dialogue}" with measured articulation` : FORBIDDEN_WORDS_LEXICON.mouthStillPositivePhrase);

  return `[aspect_ratio]
${arConfig.label} (${arConfig.name}) | ComfyUI Node 61: ${arConfig.comfyValue} | T2I Res: ${arConfig.image1MpRes} | H3 Video Res: ${arConfig.video04MpRes}

[subject_definitions]
<Subject 1> is the visual artist. Her face, expressive emotional posture, reflective modern streetwear jacket, and dark flowing hair come from <Picture 1>, and <Picture 1> also carries the rain-slicked city bridge setting.

[summary]
Under rain-soaked city lights, cinematic visual tableau against streaming highway light trails.

[retention_analysis]
<Subject 1> is preserved from <Picture 1>.

[detailed_description]
The visual atmosphere maintains moody teal and warm sodium amber contrast with wet asphalt reflections.
${framingRule}
[Shot 1] Fluid circular tracking orbit around <Subject 1> (${speakerId || 'S1'}). ${mvSingingAction}.
[Shot 2] Reaction tableau looking upward toward the neon sky with mouth naturally closed and lips completely still.

[overall_soundscape]
Gentle falling rain patter on metal handrails, distant city ambient hum, splashing puddle footsteps; strictly no dialogue, no voiceover, no phantom vocal.

[non_diegetic_music]
${musicDirective}`;
}

/**
 * MV-standard Forbidden Words Lexicon & Suppression Definitions:
 * 1. Screen Text & Subtitles Suppression (杜绝画面出现文字、乱码、字幕、水印)
 * 2. Mouth Still / Non-Lip-Sync Suppression (非发声段强力静止声明与负向开口压制)
 * 3. Background Music Suppression (静止/禁止模型生成混杂 BGM，为后期无损全曲 Master BGM 铺底让路)
 */
export const FORBIDDEN_WORDS_LEXICON = {
  // 1. 画面文字与字幕禁止词 (Negative Prompt 强制注入项，100% 杜绝画面出现硬字幕、台词条、乱码文字)
  screenTextAndSubtitles: [
    'subtitles', 'closed captions', 'captions', 'lyrics', 'burned-in text',
    'on-screen text', 'overlaid words', 'lower third', 'subtitles bar',
    'dialogue box', 'karaoke subtitles', 'chinese subtitles', 'english subtitles',
    'text', 'words', 'watermark', 'logo', 'typography', 'letters', 'signature',
    'username', 'font', 'credits', 'timestamps',
    '字幕', '中文字幕', '双语字幕', '台词条', '压屏文字', '歌词字幕', '卡拉OK字幕', '滚动字幕', '黑底字幕条', '水印'
  ],
  // 2. 嘴唇静止 / 禁止开口与声音乱入词 (非发声段负向压制，彻底杜绝无对白时模型脑溢旁白或对话)
  mouthStillSuppression: [
    'singing', 'mouth open', 'lip-sync', 'talking', 'speaking', 'vocalizing',
    'open lips', 'moving mouth', 'dialogue', 'chatting', 'parted lips',
    'voiceover', 'narration', 'whispering', 'screaming', 'female vocal',
    'male vocal', 'muttering', 'phantom voices', 'human voice', 'babbling',
    'speech', 'chatter', 'yelling', 'crying sounds', 'moaning', 'grunting vocal',
    '旁白', '画外音', '对白', '说话', '自言自语', '有人说话', '女声旁白', '男声独白', '乱入声音'
  ],
  // 嘴唇正向静止声明标准句 (必须注入分镜正面 Action 或 Detailed Description)
  mouthStillPositivePhrase: 'mouth naturally closed, lips completely still, not moving along with vocals, no singing or talking, strictly no voiceover, no dialogue, no narration, silent character',
  // 3. 背景音乐禁止生成声明 (当不需要模型自己生成配乐、为后期无损全曲 Master BGM 让路时)
  bgmSuppressionPositivePhrase: 'None. There is no non-diegetic background music in this video track, absolute silence on the music channel to allow clean external master score mixing.',
  bgmNegativeSuppression: [
    'background music', 'noisy score', 'discordant soundtrack', 'distorted audio',
    'bgm', 'humming', 'audio clipping', 'clashing instruments', 'cacophony'
  ],
  // 4. 彻底杜绝幽灵人声与乱入声音专用矩阵 (严禁声音乱入硬死锁)
  phantomVoiceSuppression: [
    'voiceover', 'narration', 'spoken dialogue', 'speech', 'talking',
    'female voice', 'male voice', 'child voice', 'whisper', 'conversations',
    'phantom voice', 'audio leakage', 'unintended vocal', 'singing voice',
    'monologue', 'chatter', 'vocalization', 'talking head', 'lip movement'
  ],
  // 5. 角色表面不可变性与防杂质涂鸦挂件禁令 (彻底杜绝环境注意力外溢导致的腰部Logo、大腿挂件、乱码贴纸、衣服印花)
  characterSurfacePurityAndDecals: [
    'stickers', 'decals', 'body graffiti', 'painted emblems', 'waist logo',
    'hanging charms', 'dangling ornaments', 'hanging accessories', 'cartoon decals',
    'body art', 'scratches', 'messy armor', 'decorated chassis', 'clothing patches',
    'brooches', 'badges on clothes', 'printed brand logo', 'unwanted tattoos',
    'decorative stickers', 'body stamps', 'pins', 'keychain', 'random accessories',
    '贴纸', '涂鸦', '徽标', '印花', '挂件', '腰部Logo', '大腿挂饰', '乱码标贴', '车贴'
  ],
  characterPurityPositivePhrase:
    'The character chassis, body armor, and clothing surfaces remain 100% pristine, solid finish identical to reference: strictly zero extra stickers, zero decals, zero waist emblems, zero painted graffiti, zero dangling trinkets on thighs or belt, unadorned and solid texture.'
};

/**
 * Builds compliant Negative Prompt using MV & H3 Suppression rules
 */
export function buildCompliantNegativePrompt(options?: {
  isLipSync?: boolean;
  suppressBgm?: boolean;
  suppressDecalsAndGraffiti?: boolean;
  extraNegatives?: string;
}): string {
  const isLip = options?.isLipSync ?? false;
  const suppressBgm = options?.suppressBgm ?? true;
  const suppressDecals = options?.suppressDecalsAndGraffiti ?? true; // 默认永久锁死角色防涂鸦锁

  const tags: string[] = [...FORBIDDEN_WORDS_LEXICON.screenTextAndSubtitles];

  if (!isLip) {
    tags.push(...FORBIDDEN_WORDS_LEXICON.mouthStillSuppression);
    tags.push(...FORBIDDEN_WORDS_LEXICON.phantomVoiceSuppression);
  }
  if (suppressBgm) {
    tags.push(...FORBIDDEN_WORDS_LEXICON.bgmNegativeSuppression);
  }
  if (suppressDecals) {
    tags.push(...FORBIDDEN_WORDS_LEXICON.characterSurfacePurityAndDecals);
  }

  tags.push('cartoon', '3d render', 'distorted anatomy', 'jitter', 'flicker', 'lowres');
  if (options?.extraNegatives) {
    tags.push(options.extraNegatives);
  }

  return Array.from(new Set(tags)).join(', ');
}

/**
 * Applies suppression directives:
 * - Silence background music (for post-production Master BGM replacement)
 * - Enforce mouth naturally closed & completely still
 * - Enforce screen text and subtitle suppression in negative prompt
 */
export function applySuppressionToPrompt(
  prompt: string,
  options: {
    suppressBgm: boolean;
    enforceLipsStill: boolean;
  }
): { modifiedPrompt: string; modifiedNegative: string } {
  let text = prompt;

  if (options.suppressBgm) {
    if (/\[non_diegetic_music\][\s\S]*?$/i.test(text)) {
      text = text.replace(
        /\[non_diegetic_music\][\s\S]*?$/i,
        `[non_diegetic_music]\n${FORBIDDEN_WORDS_LEXICON.bgmSuppressionPositivePhrase}`
      );
    } else {
      text += `\n\n[non_diegetic_music]\n${FORBIDDEN_WORDS_LEXICON.bgmSuppressionPositivePhrase}`;
    }
  }

  if (options.enforceLipsStill) {
    text = text.replace(/<d>.*?<\/d>/gi, '');
    text = text.replace(/Singing vocals:\s*".*?"/gi, '');
    text = text.replace(/her mouth moves only while she speaks:?/gi, '');
    text = text.replace(/his mouth moves only while he speaks:?/gi, '');
    if (!/mouth naturally closed/i.test(text)) {
      if (/\[detailed_description\]/i.test(text)) {
        text = text.replace(/\[detailed_description\]/i, `[detailed_description]\nAll characters maintain ${FORBIDDEN_WORDS_LEXICON.mouthStillPositivePhrase}.`);
      } else if (/\[ACTION\]/i.test(text)) {
        text = text.replace(/\[ACTION\]/i, `[ACTION]\n${FORBIDDEN_WORDS_LEXICON.mouthStillPositivePhrase}.`);
      }
    }
  }

  const negative = buildCompliantNegativePrompt({
    isLipSync: !options.enforceLipsStill,
    suppressBgm: options.suppressBgm
  });

  return { modifiedPrompt: text, modifiedNegative: negative };
}

