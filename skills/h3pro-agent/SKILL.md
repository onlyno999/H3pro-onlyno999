---
name: mvh3-agent
description: >
  mvH3-onlyno999 专职视频生成与调度 Agent 规范 (V2.3 终极满血版)。
  集成 MiniMax H3 官方满血加速工作流 (https://www.runninghub.cn/workflow/2105127972431818753)、
  Node 31 MiniMaxH3ReferenceToVideo 全模态调度算子、
  9图 + 3视频 + 3音频全维度参考矩阵、以及 15s 尾帧接力零重影剪辑体系。
---

# mvH3-onlyno999 Agent 核心技能规范 (V2.3 满血版)

## 1. 架构总则：前两步焊死 + 第三步云端一键调度插拔
- **Skill 1【焊死】创意分镜构思内核**：解析自然语言与故事设定，输出时间轴结构化镜头大纲、台词与音效。
- **Skill 2【焊死】MiniMax H3 Ref2VA 规范编译器**：
  - 自动编译六段式结构：`[subject_definitions]` ➔ `[summary]` ➔ `[retention_analysis]` ➔ `[detailed_description]` ➔ `[overall_soundscape]` ➔ `[non_diegetic_music]`。
  - 角色音色 `(Sx)` 与 `<d>` 口型发音标签，防裁头中近景定位，零字幕反向词敏感清洗。
  - 影视级大白话脱敏引擎（规避 `integrity_check_failed`）。
- **Skill 3【插拔】RunningHub 云端一键调度接口 (全新满血版替换上线)**：
  - **当前主工作流**：MiniMax H3 满血版 多模态生视频加速
  - **工作流地址**：`https://www.runninghub.cn/workflow/2105127972431818753`
  - **工作流 ID**：`2105127972431818753`
  - **核心调度节点**：Node 31 (`MiniMaxH3ReferenceToVideo`)，直连 UNETLoader (Node 41/58)、CLIPLoader (Node 3/59)、VAELoader (Node 4/12)、SamplerCustomAdvanced (Node 6) 与 VHS_VideoCombine (Node 17)。
  - **帧数对齐**：Node 28 (`PrimitiveFloat`) 输入时长秒数，直连 Node 29 (`ComfyMathExpression`) 执行 `17n+5` 网格对齐。

---

## 2. 全模态多维参考矩阵支持机制 (Full Multimodal Reference Matrix)

在最新满血版工作流中，Node 31 具备**9 张图片 + 3 路参考视频 + 3 路参考音频**的超强多模态注入能力：

### 2.1 🖼️ 9 张图片参考支持机制 (Image Reference Matrix)
| 参考模态 | 槽位与真实节点 | 可参考维度 | 注入内容与业务功能 | 示例 / 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **图片** | `ref_image_0` (Node 18) | **角色 / 人物** | 外貌特征、面部细节、服装穿搭、姿势动作 | 参考人物立绘卡，让全片角色保持绝对同一长相、穿搭与发型 |
| **图片** | `ref_image_1` (Node 23) | **场景 / 环境** | 整体环境布局、空间关系、氛围基调 | 参考一张街景/宴会图，锁定故事发生的背景母本与空间结构 |
| **图片** | `ref_image_2` (Node 22) | **光影 / 色调** | 光照方向、色温、胶片质感、视觉风格 | 参考“情绪色调”（如暖黄昏、冷科幻、赛博朋克），生成同风格画面 |
| **图片** | `ref_image_3` (Node 24) | **物体 / 产品** | 具体物品形态、材质、颜色、细节 | 参考一款包袋/手机/道具图，在视频中 3D 动态高保真复现资产 |
| **图片** | `ref_image_4` (Node 32) | **品牌 / 标识** | Logo 图形、品牌色、片尾锁屏 | 参考品牌 Logo 图，在片头或片尾生成无损品牌展示画面 |
| **图片** | `ref_image_5` (Node 33) | **风格 / 美术** | 视觉艺术风格（写实/插画/水墨/赛博等） | 参考一幅插画或经典剧照，生成艺术风格完全一致的质感 |
| **图片** | `ref_image_6` (Node 34) | **UI / UX 界面** | 网页设计图、产品界面、交互原型 | 参考 APP 或网页界面图，生成动态的操作交互演示视频 |
| **图片** | `ref_image_7` (Node 35) | **备用角色 / 姿势** | 第二角色/特写姿势/分身细节 | 辅助锁定副主角、群演或关键动作的肢体定位 |
| **图片** | `ref_image_8` (Node 76) | **备用环境 / 微距** | 深度背景补充、道具微距特写 | 特写镜头下的微观细节增强 |

### 2.2 🎬 3 路视频参考支持机制 (Video Reference Matrix)
通过 Node 73、75、74 三路 `VHS_LoadVideo` 算子载入源视频参考：
| 槽位与节点 | 可参考维度 | 注入内容与业务功能 | 示例 / 说明 |
| :--- | :--- | :--- | :--- |
| **视频 1** (Node 73) | **动作 / 运动** | 人物肢体动作、物体运动轨迹、行为模式 | 参考一段舞蹈/跑酷视频，让新角色无缝做出完全一致的复杂动作 |
| **视频 2** (Node 75) | **运镜 / 镜头运动** | 推拉摇移、跟随、手持晃动、希区柯克变焦 | 学习好莱坞大片的镜头轨迹与运镜加速度，并应用到新场景中 |
| **视频 3** (Node 74) | **节奏 / 角色一致性 / 首尾帧** | 视频剪辑节奏、转场方式、叙事快慢、首尾帧控制 | 指定起始帧与结束帧画面，让模型生成从 A 画面平滑过渡到 B 画面的连贯长镜头，并在多段接力中实现 100% 不变脸跨段直出 |

### 2.3 🎵 3 路音频参考支持机制 (Audio Reference Matrix)
通过 Node 38、67、68 三路 `LoadAudio` 算子载入音频参考：
| 槽位与节点 | 可参考维度 | 注入内容与业务功能 | 示例 / 说明 |
| :--- | :--- | :--- | :--- |
| **参考音 1** (Node 38) | **人声 / 音色** | 说话人的音色、语气、情绪、语速 | 注入角色声学指纹干声，生成相似人声对白与精准唇形同步 |
| **参考音 2** (Node 67) | **歌声 / 演唱** | 歌唱音色、旋律律动、演唱风格 | 注入歌曲人声干声切片，让画面中的角色严格按该歌声“对口型”歌唱 |
| **参考音 3** (Node 68) | **音乐风格 / 环境音效** | 摇滚/古典/电子配乐，雨声/风声/空间拟音 | 注入背景音乐风格或空间拟音（脚步、雷雨、电子嗡鸣），匹配音画合一氛围 |

---

## 3. 跨段无缝接力与 15s 零重影终剪规则
- **首尾帧精准匹配**：在段与段接力时，将上一段成片的尾帧（如 15.00s / 第 362 帧）提取并注入下段作为首帧垫图，或直接挂入 Node 74 / Node 75 视频通道；
- **FFmpeg 零重影拼接**：
  ```bash
  ffmpeg -y -v error \
    -i P01.mp4 -i P02.mp4 -i P03.mp4 -i master_bgm.wav \
    -filter_complex "
      [0:v]setpts=PTS-STARTPTS[v0];
      [1:v]select='gt(n\,0)',setpts=PTS-STARTPTS[v1];
      [2:v]select='gt(n\,0)',setpts=PTS-STARTPTS[v2];
      [v0][v1][v2]concat=n=3:v=1:a=0[vconcat]" \
    -map "[vconcat]" -c:v libx264 -crf 18 -preset medium final_master.mp4
  ```
- **消灭叠影**：通过 `select='gt(n\,0)'` 剔除第 2 段起的第 0 帧重复垫图帧，实现 100% 电影级无缝连续出片。

---

## 4. 台词优化与防乱讲话规范 (Dialogue & Anti-Ramble Guard)

按 MiniMax H3 官方规范执行**动作/语气/台词细化与防乱讲话死锁**：
1. **防乱讲话机制 (Strict Anti-Ramble)**：
   - **台词时间线动作化**：台词严禁单独存在，必须嵌套在具体分镜 `【动作】` 中：
     `【动作】<Subject N> (SN) [动作与具体肢体语言]，[语气/音量/语速描述] 说：<d>[中文] 精确台词原文</d>`
   - **说完全程静止锁定**：台词结束后必须紧跟闭嘴防乱动指令（如：“说完嘴唇抿成一条线，喉结滚一下，把更多话咽回去；不再接话，保持沉默闭唇”），**彻底锁死嘴唇，杜绝模型自由发挥乱叽里咕噜讲话**；
   - **非发声镜头闭嘴死锁**：非台词镜头/听者反应镜，正向强制注入 `mouth naturally closed, lips completely still, not moving along with vocals, no singing or talking`，负向词库强制注入 `singing, mouth open, lip-sync, talking, speaking, vocalizing, open lips`；
2. **情绪靠动作带 (No Adjective Emotions)**：
   - 严禁空洞形容词（不写“他很悲伤地说”）；
   - 必须翻译成具体生理动作与微表情（如：“视线落在凉透的青菜上，右手指节轻敲桌面三下，压着情绪低沉发闷地说”）；
3. **接收先于反应 (Receive Before React)**：
   - 听者先听见、停顿或微动作（如搓烟纸、喉结滚动），再开口说话；
4. **声音与说话人全局绑定**：
   - 角色在 `subject_definitions` 绑定后，在 `声音设定` 明确：
     `<Picture 2> 是说话人用 (S2) 标记，参考音频 2，并在全片保持一致`；
   - 全片台词统一使用 `(S1)/(S2)` 锚定声线，杜绝跨镜头跳音色。

---

## 5. 动作打斗与特效戏自动调用机制 (Fight FX Sub-Skill Trigger)

当用户在分镜创作、剧本输入或 Agent 交互中涉及**打斗、格斗、搏击、武术、兵器对决、受击反馈、冲击波/爆破特效**时，**Agent 必须强制自动调用 `/skills/fight-fx-anchor-prompter/SKILL.md`**：
- **自动激活三段式动作矢量拆解**：发起动能 (Wind-up) ➔ 碰撞击打落点 (Impact) ➔ 物理受力与反作用力位移 (Reaction Displacement)；
- **自动挂载格斗拟音矩阵**：沉重肉体闷击音 (`heavy flesh impact`)、金属交鸣火星音 (`metallic clashing`)、破空呼啸 (`whoosh drag`) 与骨骼受力声；
- **动态运镜与变速齿轮**：低角度跟拍、接触瞬间微慢动作 (0.3x 定格强化)、受击瞬间画面轻微震颤 (camera shake)；
- **打斗脱敏引擎联动**：在保证暴力美学与打击感的同时，自动转译为“影视级特技动作戏剧化表现”，100% 规避平台风控。

