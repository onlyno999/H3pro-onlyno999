---
name: fight-fx-anchor-prompter
description: 动作打斗与特效锚定提示词专家规范 (Fight FX Anchor Prompter)。专用于影视动作打斗戏、近身搏击格斗、武术对决、兵器交锋、冲击波特效、爆破受击、力道拟音与镜头冲击力刻画。当用户需要打斗戏、格斗动作、武打场面、击打受击反馈时，必须自动激活此 Skill，生成物理级动作轨迹、击打点位、受力反作用力与声学拟音提示词。
version: 1.0.0
---

# 动作打斗与特效锚定提示词专家规范 (Fight FX Anchor Prompter)

## 1. 适用场景与调用触发机制
当用户在与 Agent 交互时出现以下需求或关键词时，**必须自动调用本 Skill**：
- **动作戏 / 打斗戏 / 格斗 / 搏击 / 武打 / 动作大片**
- **近身肉搏 (CQC) / 挥拳 / 侧踢 / 过肩摔 / 锁喉 / 闪避 / 格挡**
- **冷兵器交锋 (刀剑、长枪、棍棒火花碰撞)**
- **超能力 / 气劲 / 冲击波 / 爆破 / 魔法光效 (FX Anchor)**
- **受击反馈 (钝击凹陷、倒飞撞碎、吐血震颤、慢动作定格冲击)**

---

## 2. 核心架构：动作打斗四大锚定法则 (The 4 Fight-FX Anchors)

### 2.1 物理轨迹与受力闭环锚定 (Kinetic Vector & Reaction Lock)
- **拒绝抽象描述**：严禁写“两人激烈打斗在一起”或“他凶狠地打倒了对手”。
- **三段式动作矢量拆解**：
  1. **发起动能 (Wind-up / Kinetic Drive)**：脚步蹬地、重心转移、腰胯扭转带动拳锋/刀刃，写清身体发力部位与轨迹角度；
  2. **击打落点与微碰撞 (Impact Anchor)**：精确到具体受击点（如“右拳重重砸在下颚偏右侧 3 厘米处”、“剑尖精准擦过护腕带出火星”）；
  3. **受力反馈与惯性位移 (Reaction Displacement)**：受击者下颚剧烈偏转、唾液与汗水因离心力甩出、身体横向失控滑退 2 米、脚跟在地面犁出深沟。

### 2.2 特效物理融合锚定 (FX Anchor Formula)
当涉及特效、气劲或火花时，必须与物理环境材质锚定：
- **光效类型**：冷白电弧、赤红气浪、幽蓝剑芒、炽热金属火花；
- **环境交互**：气浪震飞落叶与地面积水、刀光照亮对手面部高光、爆破冲击波使背景玻璃瞬间蛛网状碎裂；
- **粒子生灭周期**：碰撞瞬间迸发 ➔ 0.2秒向外喷射扩散 ➔ 空气中残留轻微白烟与灼烧余烬。

### 2.3 镜头运镜冲击力控制 (Dynamic Cinematic Camera)
- **镜头跟随**：采用快速推移镜头 (Whip Pan / Tracking Shot)、低角度仰拍 (Low-Angle Hero Shot) 增强力量感；
- **打斗速度铁律 (1.5x Fight Speed Iron Law，用户2026-10-02定)**：
  - 所有打斗戏的人物动作统一按 **1.5 倍速的迅猛节奏**设计：出招快如闪电、攻防转换目不暇接、剑影重重；
  - **绝无慢动作、绝无定格、绝无停顿**——碰撞瞬间也不许慢放；
  - 此处的 1.5x 指的是**人物打斗动作本身的速度感**（在提示词里写出迅猛的打斗节奏），**不是**后期对片子做变速——成片时长保持原速不变；
  - 旧版"碰撞瞬间0.3x微慢动作"写法已作废，不许再用；
- **震屏与快门速度**：微抖动 (Camera Shake, amplitude: 3-5px)，高快门角度消灭拖影粘连。

### 2.4 打斗声效与拟音锚定 (Fight Soundscape & Foley Matrix)
MiniMax H3 音画一体生成，音效直接决定打击感：
- **重击沉闷声**：沉闷钝击肉体声 (`dull, heavy flesh impact sound`)；
- **金属脆响**：刺耳高频金铁交鸣声 (`sharp metallic clashing with sparks sound`)；
- **风声与破空**：拳风呼啸破空音 (`whooshing air drag from high-speed punch`)；
- **受击闷哼**：肺部受压迫的急促吐气声 (`short breath knocked out, groaning grunt`)；
- **环境破裂**：木板碎裂爆裂声、石块崩落杂音 (`wood splintering, rubble crumbling`)。

---

## 3. MiniMax H3 标准打斗分镜模板 (H3 Fight Prompt Specification)

```text
subject_definitions（主体定义）:
<Subject 1> 是 <Picture 1> 中的主角：动作利落、身穿战术贴身服；
<Subject 2> 是 <Picture 2> 中的反派打手：身形魁梧、手持黑色钢管；
<Subject 3> 是 <Picture 3> 中的废弃仓库：昏暗空间、水泥立柱、地面有积水与散落木箱；

声音设定（铁律：未指定说话人，严禁对白与声音乱入，纯画面+现场格斗拟音，无背景BGM）：
全片未指定说话人，严禁生成任何人物对白、台词、画外旁白或幽灵人声；全片人物嘴唇自然紧闭全程完全静止不发声。声音通道仅保留现场物理格斗动作拟音（钢管破空、肉体闷响、撞击、骨骼受压）与空间底噪，绝无背景音乐（Zero BGM）。

detailed_description:
【Shot 1｜0–4秒｜近景跟拍·侧闪重拳击肋】
【主体】<Subject 1> 画面中心偏左，<Subject 2> 右侧挥动钢管横扫。
【动作】<Subject 2> 怒吼着双手挥钢管自右向左横抡扫向头部，破空声凌厉；<Subject 1> 上半身极速后仰下潜闪避，钢管带风险险擦过鼻尖；紧接着 <Subject 1> 左脚拧地蹬转，借扭腰发力，右勾拳如炮弹般自下而上重击 <Subject 2> 左肋软肋部。<Subject 2> 被击中瞬间胸腹肌肉剧烈凹陷，眼球瞪大、嘴里喷出一蓬唾液水雾，身体被横向巨力击得离地半尺、失控横撞向后方水泥柱。<Subject 1> 眼神冷峻如冰，全程嘴唇自然紧闭完全静止不发声（lips completely still and naturally closed, silent character, strictly no speaking, no dialogue, no voiceover）；其余人物全程嘴唇完全紧闭静止。
【镜头】9:16 动态手持低角度跟拍，伴随击打瞬间 0.2 秒轻微画面震颤 (camera shake)；全程1.5倍速迅猛打斗节奏，绝无慢动作定格。
【音效】钢管呼啸破空尖啸、肉体重拳剧烈闷响沉音 (heavy punch thud)、骨骼受压闷响、受击者肺部受压短促闷哼、重重撞击水泥立柱崩裂声；绝无人物对白台词，绝无画外旁白，绝无BGM背景音乐。
【约束】肢体动作连贯硬朗，无多余肢体生成，关节折叠自然，击打落点精准对齐，面部受击表情扭曲真实，光影稳定无闪烁。

[overall_soundscape]
Pure kinetic fight sound effects and heavy breathing; strictly zero human speech, zero voiceover, zero phantom vocal.

[non_diegetic_music]
None. Strictly zero non-diegetic background music (no BGM, no score, no soundtrack). Absolute silence on music channel to guarantee pure kinetic fight foley.
```

---

## 4. 动作打斗戏声音铁律规范 (Ironclad Fight-Action Sound Law)

### 核心铁律（ABSOLUTE IRONCLAD RULES）
**只要没有指定谁说的话，或没有写对白台词时，生成结果必须且只能是：【画面 + 物理动作拟音】，绝对没有背景 BGM。这些是铁律！**

### 动作戏具体执行准则
1. **画面纯净度**：专注刻画骨骼发力、重心转移、受力位移、粒子火花与镜头变速齿轮；
2. **拟音矩阵详写 (Foley In)**：必须详写破空声 (whoosh)、拳脚钝击沉音 (flesh impact thud)、兵器金属交鸣 (metallic clashing)、骨骼受力脆响、受击闷哼与撞击碎裂拟音；
3. **严禁声音乱入 (Strictly No Voice Leakage)**：未指定说话人时，严禁自行编造对白台词、严禁自言自语、严禁画外旁白！角色嘴唇全过程自然紧闭（lips completely still and naturally closed, silent character）；
4. **背景 BGM 彻底归零 (Zero BGM)**：`[non_diegetic_music]` 必须显式声明为 `None`，负向提示词强制封锁 `background music, bgm, soundtrack, score, melody`，为真实物理打击感留出纯净声学通道。

