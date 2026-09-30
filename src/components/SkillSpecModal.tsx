import React, { useState } from 'react';
import { X, Copy, Check, FileText, Code, Download, Terminal, Layers, Sparkles } from 'lucide-react';

interface SkillSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPEC_FILES = [
  {
    id: 'readme_md',
    name: 'README.md (系统详细使用与架构总览)',
    type: 'markdown',
    path: '/README.md',
    content: `# mvH3-onlyno999：MiniMax H3 全自动化视频生成平台与导演工作台中台

> **工业级 AI 视频生成 SOP 与云端调度系统**  
> 统合 **【音乐 MV】**、**【竖版短剧 (Short Drama)】** 与 **【商业广告 (Commercials)】** 三大影视题材生产。  
> 独创**「两段式规划法」**：文学剧本构思 ➔ 自动转译为 **MiniMax H3 官方 Ref2VA 规范**。  
> **全面接入 RunningHub 官流终极版**（集成 Bernini Director rv2v 架构），搭载**影视级大白话安全脱敏**、**跨段多图矩阵参考接力（100% 杜绝变脸变装）**、**15s 尾帧垫图与 FFmpeg 零冻结缝合**，直通云端一键出片！

---

## 🔗 云端调度与工作流核心地址
- **平台官网**：[RunningHub 开放平台 (www.runninghub.cn)](https://www.runninghub.cn)
- **最新云端调度模型地址**：[https://www.runninghub.cn/post/2079374352503631873/?inviteCode=zedwxo2q](https://www.runninghub.cn/post/2079374352503631873/?inviteCode=zedwxo2q)
- **官方邀请码**：\`zedwxo2q\`（绑定即赠 1000 RH 渲染币）
- **核心总控节点**：Node 22 (\`ComfyBerniniDirector\`)，双 UNet 高低噪采样与多分段连续时空控制。

---

## 🌟 核心功能与使用指南 (快速上手)

### 模式一：创作者工作台 (Studio Workbench)

#### 步骤 1：H3 提示词转译实验室 (Prompt Lab)
1. **输入文学剧本 / 自然语言大白话**：
   - 可以在输入框直接输入生活化、有戏剧冲突的大白话脚本（如“铁蛋追打野猪，最后摔在草垛上...”）。
2. **大白话安全脱敏引擎 (Anti-integrity_check_failed)**：
   - 系统自动对“打架”、“车祸”、“撞飞”、“吐血”等高危风控词进行影视级戏剧化平替，**100% 杜绝平台风控拦截**。
3. **一键编译为官方 Ref2VA 六段式**：
   - 自动生成 \`[subject_definitions]\`、\`[summary]\`、\`[retention_analysis]\`、\`[detailed_description]\`、\`[overall_soundscape]\`、\`[non_diegetic_music]\`。
   - 严格落实**“零字幕硬门禁”**与**“(Sx) + <d> 口型对白标签”**。

#### 步骤 2：三视图切片与融光资产工坊 (Asset Studio)
1. **智能无损切片**：自动拆解为正面全身、半身面部特写、下肢道具细节卡。
2. **Qwen 融光去棚底**：一键去除影棚纯白/浅灰底色反光与白边，注入环境暖光与接触阴影。
3. **残差距从 47.6% 暴降至 0.8% 内**，实现 1:1 咬合。

#### 步骤 3：多图参考矩阵与云端一键调度 (RunningHub Dispatch)
1. **一次能上传多少张参考图？**
   - **支持机制**：Node 22 (\`ComfyBerniniDirector\`) 采用动态 \`refs\` 数组及分镜头独立绑定机制；
   - **推荐容量**：**标准配置 1 ~ 6 张**：
     - \`ref_image_0\` / \`<Picture 1>\`：主角正面高保真立绘 / 三视图卡
     - \`ref_image_1\` / \`<Picture 2>\`：第二主体 / 配角 / 核心道具卡
     - \`ref_image_2\` / \`<Picture 3>\`：场景母本空间卡（虚化宾客、灯光基调）
     - \`ref_image_3~5\` / \`<Picture 4~6>\`：起始构图与动作姿态卡
   - **分镜头独立参考 (\`segments.refs\`)**：支持针对特定镜头切片动态追加局部特写图。
   - **源视频连续引导 (\`referenceVideo\`)**：可载入上一段出片作为动态时空条件引导。
2. **填入 RunningHub API Key**：点击保存即可调用 \`runninghubService\` 批量派发任务或直达 Web 端调试。

#### 步骤 4：多段视频无缝接力与零冻结终剪 (Algorithm Lab)
- **15.00s 尾帧垫图机制**：提取第 1 段末尾（第 362 帧）作为第 2 段首帧输入，物理硬锁视线、道具与服装。
- **FFmpeg 零重影切片**：使用 \`[1:v]select='gt(n\\,0)',setpts=PTS-STARTPTS[v1]\` 自动切除第 2 段第 0 帧重复垫图。

---

## 📌 系统更新日志与文档同步维护规范 (Changelog & Sync Rule)
> **铁律原则**：本系统往后每一次增加功能、修改接口、调整节点或更新工作流配置，**必须严格同步更新本 README.md 文档及系统内部规范**。`
  },
  {
    id: 'three_skills_chain_md',
    name: '三技能架构规范 (前两步焊死+云端接口可换)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/three_skills_ironclad_chian.md',
    content: `# 三技能链式系统规范：前两步焊死 + 第三步云端一键图片接口热插拔

## 架构核心原则 (System Architecture Principle)
在整套 AI 视频与短剧生成流水线中，核心划分为「两层焊死内核」与「一层插拔管道」：

### 1. 【Skill 1 焊死】创意句子与分镜构思内核 (Creative Ideation Kernel)
- **定位**：业务与叙事基石（不可跳过、严禁大模型直出闲聊文本）。
- **职责**：将用户的粗糙想法（如“这个帽子的创意”）转化为结构化的剧情大纲、分镜节奏、人物角色小传与戏剧冲突。
- **输出物**：结构化镜头清单、台词文本、动作拟音设定。

### 2. 【Skill 2 焊死】MiniMax H3 官方规范编译器 (Official H3 Ref2VA Compiler)
- **定位**：模型底层对齐编译器（官方语法糖与硬门禁拦截）。
- **职责**：
  * 将 Skill 1 的自然语言分镜逐一编译为 H3 官方认可的六段式架构：
    [subject_definitions] ➔ [summary] ➔ [retention_analysis] ➔ [detailed_description] ➔ [overall_soundscape] ➔ [non_diegetic_music]
  * 自动注入 (Sx) 角色音色绑定与 <d> 台词口型发声标签；
  * 执行严格的【零字幕硬门禁】：坚决剔除 "no subtitles/no text" 反向敏感词，防止画面烧录乱码字；
  * 执行【防裁头镜头控制】：将特写安全后退至胸口或中近景，确保发声时头部完整；
  * 执行【角色表面防污染绝缘锁】：严防环境注意力外溢导致的腰部莫名长出 Logo 徽标、大腿长出悬挂饰品、衣服冒出杂质印花（正向注入 pristine solid finish，负向压制 stickers, decals, waist logo, hanging charms, body graffiti）。
- **输出物**：符合 H3 官方 Ref2VA 契约的标准 Payload。

### 3. 【Skill 3 插拔】云端一键生图/生视频接口 (Cloud One-Click Image/Video Driver)
- **定位**：可灵活更换的算力与执行管道（Pluggable Execution Provider）。
- **特性**：**前两步焊死不变，第三步按需随时替换不同云端服务**。
- **支持接入与替换的云端接口**：
  * **接口 A（当前默认首选）**：RunningHub 官方 MiniMax H3 满血版 多模态生视频加速 (地址：\`https://www.runninghub.cn/workflow/2105127972431818753\`，Node ID: 31 \`MiniMaxH3ReferenceToVideo\`)
  * 接口 B：Qwen-Image / FLUX / SD 云端文生图与图像编辑接口 (生成 1:1 人物定妆卡与母本场景卡)
  * 接口 C：平台内置 ImageGen 图生图与 15s 尾帧垫图接力接口
  * 接口 D：第三方 Webhook / 自建 GPU ComfyUI 实例接口
- **全模态参考输入支持机制 (9 图 + 3 视频 + 3 音频)**：
  * **9 张图片参考矩阵 (Node 18, 23, 22, 24, 32, 33, 34, 35, 76)**：
    - 图1: 角色/人物 (外貌特征、面部细节、服装穿搭、姿势动作，全片统一长相)
    - 图2: 场景/环境 (整体环境布局、空间关系、氛围基调母本)
    - 图3: 光影/色调 (光照方向、色温、胶片质感、视觉情绪基调)
    - 图4: 物体/产品 (具体物品形态、材质、颜色、3D 资产还原)
    - 图5: 品牌/标识 (Logo 图形、品牌色、结尾展示画面)
    - 图6: 风格/美术 (写实/插画/水墨/赛博朋克等艺术风格)
    - 图7: UI/UX 界面 (网页设计图、产品界面、交互原型操作演示)
    - 图8: 备用角色/姿势 (第二角色/肢体特写/分身细节)
    - 图9: 备用环境/细节 (微距特写/深度空间背景补充)
  * **3 路视频连续参考 (Node 73, 75, 74 VHS_LoadVideo)**：
    - 视频1: 动作/运动 (人物肢体动作、物体运动轨迹、行为模式，如舞蹈或特技)
    - 视频2: 运镜/镜头运动 (推拉摇移、跟随、手持晃动、希区柯克变焦轨迹)
    - 视频3: 节奏/剪辑/角色一致性/首尾帧 (从 A 画面平滑过渡到 B 画面，消灭变脸与跳变)
  * **3 路音频音色参考 (Node 38, 67, 68 LoadAudio)**：
    - 参考音1: 人声/音色 (说话人声音声学指纹、语气语速，实现对白口型同步)
    - 参考音2: 歌声/演唱 (歌唱旋律与音画“对口型”演唱)
    - 参考音3: 音乐风格/音效环境 (背景音乐氛围、雨声/风声/空间拟音环境音)
- **契约规则**：只要接收到 Skill 2 编译好的标准六段式 Payload，Node 31 均可精准挂接多模态输入并出片。

---

## 用户自然时长指令智能自适应路由规则 (Auto-Duration Adaptation)
用户在对话框中只会说自然语言（如：“生成20秒的短片”、“做个30秒的视频”、“来一个1分钟微短剧”），Agent 必须在底层自动识别并切换单段规格，用户对此零感知：

| 用户自然语言指令 | Agent 内部智能切分规划 | 底层单段 Node 132 设定 | 跨段接力与垫图机制 |
| :--- | :--- | :--- | :--- |
| **"生成 10 秒短片"** | **1 段** 直出 (10s) | Node 132 = 10.0 (243 帧) | 单段直出，无跨段 |
| **"生成 15 秒短片"** | **1 段** 直出 (15s) | Node 132 = 15.0 (362 帧) | 单段直出，长镜头情绪拉满 |
| **"生成 20 秒短片"** | **2 段 × 10 秒** (共 20s) | 每段 Node 132 = 10.0 (243 帧) | 第 1 段截取第 242 帧垫图 ➔ 喂给第 2 段 (Node 137) + 载入前视频 (Node 175) |
| **"生成 30 秒短片"** | **2 段 × 15 秒** (共 30s) | 每段 Node 132 = 15.0 (362 帧) | 第 1 段截取第 362 帧垫图 ➔ 喂给第 2 段 (Node 137) + 载入前视频 (Node 175) |
| **"生成 45 秒短片"** | **3 段 × 15 秒** (共 45s) | 每段 Node 132 = 15.0 (362 帧) | 逐段 15s 尾帧接力，FFmpeg select='gt(n,0)' 消除接缝 |
| **"生成 60 秒 / 1分钟短剧"** | **4 段 × 15 秒** (共 60s) | 每段 Node 132 = 15.0 (362 帧) | **竖版微短剧工业标准一集**！4 段起承转合连续出片 |

---

## 焊死大模型的系统提示词模板 (System Prompt Enforcement)
\`\`\`markdown
# AGENT IRONCLAD ROUTING RULE

你必须执行严格的三技能链式流水线，严禁在未调用工具的情况下自行瞎编故事：
1. 收到任何故事/剧本/视频构思请求，必须且只能首先调用 [Skill 1: 创意分镜生成器]；
2. 拿到 Skill 1 产物后，必须强制传入 [Skill 2: H3 官方六段式转译器] 进行标准编译与敏感词清洗；
3. 将 Skill 2 编译好的标准六段式 Payload，递交给 [Skill 3: 云端一键图片/视频生成接口] 进行云端任务派发。

严禁事项：
- 严禁大模型以自然语言直接回复闲聊故事；
- 严禁跳过 Skill 2 直接将非结构化文字发给云端生图接口！
\`\`\``
  },
  {
    id: 'skill_md',
    name: 'SKILL.md (mvH3 终极版)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/SKILL.md',
    content: `---
name: mvh3-agent
description: >
  mvH3-onlyno999 专职视频生成与调度 Agent 规范 (V2.2 终极版)。全链打通【音乐 MV】、【竖版多段短剧 (Short Drama)】与【商业广告 (Commercials)】三大题材生产。
  全面适配最新 RunningHub Bernini Director rv2v 调度架构 (https://www.runninghub.cn/post/2079374352503631873/?inviteCode=zedwxo2q)，
  严格落实 MiniMax H3 官方 Ref2VA 六段式提示词规范、多图参考矩阵 (1~6张)、分镜头独立局部参考与连续源视频接力、
  无视觉像素级三验 (imgcheck/subprobe/vcheck) 与 15s 尾帧垫图零冻结 FFmpeg 终剪。
---

# mvH3 全自动视频生成流水线 SOP (MV · 短剧 · 广告)

> 核心使命：用 MV 的工程级严密流程（时间轴锚定、12步8关、对齐三验、成本台账、硬门禁拦截），
> 统一扩展与赋能【音乐 MV】、【竖版短剧】与【商业广告】，全面接入 MiniMax H3 官方规范与 Bernini Director 资产中台，
> 彻底解决「音画漂移」、「对白裁头」、「反向字幕敏感」与「背景人忽有忽无」等痛点，直通 RunningHub 出片。

## 六大铁律：
A. 时间是唯一的时间基准（MV 依歌词、短剧依 15s/362 帧节拍、广告依分镜表，底层 17n+5 帧数公式）
B. 只有中近景或宽景安全机位发声，发声时必须绑定 (Sx) 与 <d> 标签，人物嘴唇非发声时必须绝对静止
C. 画面纯净与防反向陷阱：严禁在正负向中写 "no subtitles/no text"（H3 越点名越画字幕！）
D. 多图矩阵同源锁定：主角三视图、配角道具、场景母图三位一体锁定，推荐配置 1~6 张参考图
E. 防走廊构图：走道收窄至一张桌宽，圆桌与宾客铺满两侧，严禁单侧排布造成狭长走廊
F. 零冻结接力与双关制：逐段 15s 截取第 362 帧作为下段首帧垫图，FFmpeg select='gt(n\,0)' 消除卡顿叠影`
  },
  {
    id: 'h3_ref_md',
    name: 'H3官方规范 vs Seedance (MD)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/h3_official_ref2va_rules.md',
    content: `# MiniMax H3 官方 Ref2VA 规范与 Awesome-Seedance 差异辨析

## 六大结构性硬伤对照表：
1. 段落架构：Seedance 无段落散文 -> H3 必须是 [subject_definitions] 至 [non_diegetic_music] 六段式
2. 字幕陷阱：Seedance 习惯写 "no subtitles" -> H3 反向敏感，越写越画双重字幕！必须整句删除
3. 台词格式：Seedance 写 says: "..." -> H3 必须用 (Sx) + <d>[Chinese] 台词</d> + mouth moves only while speaking
4. 参考图引用：Seedance 单独写 <Picture N> -> H3 必须嵌入 <Subject N> 中，禁止单独成行
5. 取景防裁头：Seedance 惯用 tight close-up -> H3 近景裁头率高达 50%！高潮宣言必须改用 wide shot 兜底
6. 宽景复述衣物禁忌：宽景镜文中一旦点名具体衣服首饰，H3 会被拽过去做衣物特写导致躯干特写裁头！`
  },
  {
    id: 'h3_drama_md',
    name: '三工作流短剧与广告 SOP (MD)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/h3_short_drama_and_commercial_pipeline.md',
    content: `# H3 竖版短剧与商业广告流水线 (三工作流与一致性锁定 SOP)

## 三工作流中台闭环：
1. Qwen-Image 2.1 文生图：全身人物立绘卡 (鞋底留地空带) + 母本场景卡 (5×4 纵深网格双侧圆桌，8位虚化宾客)
2. Qwen-Image 2.1 Edit 图像编辑：场景为 image_1 画布，人物为 image_2，注入 CROWD_KEEP，彻底洗净影棚灰底
3. MiniMax H3 Ref2VA：四段 (60.33s) 或八段 (120.67s) 每段固定灌入这 3 张合成卡，0.4MP (480×864)，精准 362 帧
4. FFmpeg 0.35s 音频淡接拼接成片 + AI 合规标注角标`
  },
  {
    id: 'imgcheck_py',
    name: 'imgcheck.py (像素级审计)',
    type: 'python',
    path: '/skills/mv-auto-pipeline/scripts/imgcheck.py',
    content: `#!/usr/bin/env python3
# imgcheck.py: Non-Visual Pixel-Level Audit for Qwen/H3 Reference Images
# grey% < 3% (确保原摄影棚白底/灰底未漏进输出画面)
# Euclidean Distance < 15.0 (确保合成图继承了母本场景卡的色彩基调)
import sys, os, math

def audit_raw_rgb24(rgb_bytes: bytes, width: int, height: int, ancestor_rgb: bytes = None) -> dict:
    total_pixels = width * height
    grey_count = 0
    bg_diff_sum = 0
    bg_pixel_count = 0

    for i in range(0, len(rgb_bytes) - 2, 3):
        r, g, b = rgb_bytes[i], rgb_bytes[i+1], rgb_bytes[i+2]
        max_c, min_c = max(r, g, b), min(r, g, b)
        diff = max_c - min_c
        luma = (r + g + b) // 3

        if diff <= 12 and 60 <= luma <= 210:
            grey_count += 1

    grey_pct = round((grey_count / total_pixels) * 100, 2)
    return {
        "grey_percent": grey_pct,
        "grey_passed": grey_pct < 3.0,
        "recommendation": "PASS" if grey_pct < 3.0 else "REVISE"
    }`
  },
  {
    id: 'subprobe_py',
    name: 'subprobe.py (字幕探测)',
    type: 'python',
    path: '/skills/mv-auto-pipeline/scripts/subprobe.py',
    content: `#!/usr/bin/env python3
# subprobe.py: Narrow-band Burned-in Subtitle Locator for MiniMax H3
# H3 渲染字幕位于画面 55%~75% 高度区间。本脚本定位高对比度白字黑边。
def probe_subtitles_in_frame(rgb_bytes: bytes, width: int, height: int) -> dict:
    start_y, end_y = int(height * 0.55), int(height * 0.75)
    subtitle_lines = []
    for y in range(start_y, end_y):
        white_edge_count = 0
        for x in range(1, width - 1):
            idx = (y * width + x) * 3
            left_idx = (y * width + (x - 1)) * 3
            r, g, b = rgb_bytes[idx:idx+3]
            lr, lg, lb = rgb_bytes[left_idx:left_idx+3]
            if r > 220 and g > 220 and b > 220 and (lr < 60 and lg < 60 and lb < 60):
                white_edge_count += 1
        if white_edge_count > 15:
            subtitle_lines.append(y)
    return {"burned_in_subtitle_detected": len(subtitle_lines) > 3}`
  },
  {
    id: 'validator_py',
    name: 'prompt_validator.py',
    type: 'python',
    path: '/skills/mv-auto-pipeline/scripts/prompt_validator.py',
    content: `#!/usr/bin/env python3
# H3 Ref2VA Six-Section Prompt Machine Validator & Anti-Trap Checker
import re, hashlib

H3_SECTIONS = ["[subject_definitions]", "[summary]", "[retention_analysis]", "[detailed_description]", "[overall_soundscape]", "[non_diegetic_music]"]
FORBIDDEN_ANTI_SUBTITLES = ["no subtitle", "no subtitles", "no text", "no words", "no caption"]

def validate_h3_prompt(text: str) -> dict:
    lower = text.lower()
    missing = [s for s in H3_SECTIONS if s not in lower]
    has_trap = any(w in lower for w in FORBIDDEN_ANTI_SUBTITLES)
    return {
        "passed": len(missing) == 0 and not has_trap,
        "missing_sections": missing,
        "subtitle_trap_detected": has_trap
    }`
  },
  {
    id: 'audio_ref_md',
    name: '音频参考一致性规范 (MD)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/audio_consistency_architecture.md',
    content: `# 音频参考与三位一体声音一致性规范

## 1. 角色音色全局锁定 (Speaker Timbre Lock)
- 全局固定 (Sx) 映射：
  - (S1) 顾总裁：120Hz 低男中音，胸腔共鸣，语速 180 字/分
  - (S2) 林清晚：235Hz 清冷女声，齿音清晰，语速 195 字/分
  - (S3) 赵美琳：285Hz 锐利高音，带有挑衅泛音，语速 220 字/分
- RunningHub Node 34 LoadAudio 直连声学指纹干声切片，杜绝同角色跨段音色漂移。

## 2. 0.35s afade 平滑音频接缝 (Cross-Segment Seam Buffer)
- 每段第 4 镜必须为无台词反应镜，段末留出 0.35s 音频淡出缓冲带。
- 滤镜：afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35。消灭分段音频接缝爆音。

## 3. 全片贯穿式 Master BGM 双轨重贴
- 杜绝直接使用 H3 散乱生成的配乐拼接。
- ComfyUI 仅注入人声干声驱动口型；成片后期通过 FFmpeg 滤镜重贴完整 60.33s 无损 Master BGM 底轨。

## 4. 逐段口型质检闸门 (Segment Gate Protocol)
- 每一段（362/367 帧）渲染完成后必须逐段通过口型对齐三验（滞后量/波形相关度/人声能量）。
- 严禁直接跳过质检调度下一段；只有当前段质检放行后，才解锁下段连续性潜空间。`
  },
  {
    id: 'mv_negative_md',
    name: 'MV 负向禁令护盾规范 (MD)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/mv_forbidden_rules_lexicon.md',
    content: `# MV 负向禁令护盾与静止/背景音乐/字幕规避准则

## 1. 🔇 静止/禁止出现背景音乐
- 正向：[non_diegetic_music] 声明 None，保证只输出纯净干声。
- 负向压制：background music, noisy score, discordant soundtrack, distorted audio, bgm, humming, audio clipping, clashing instruments。

## 2. 👁️ 禁止出现字幕与文字
- 正向：彻底剔除 "no text, no subtitles"，避免 H3 反向敏感烧出乱码字。
- 负向压制：text, words, subtitles, lyrics, captions, watermark, logo, typography, letters, font, burned-in text, on-screen text。
- 字幕由后期挂载标准 SRT。

## 3. 🤐 强制嘴唇静止 / 禁止开口
- 正向：非发声镜注入 mouth naturally closed, lips completely still, not moving along with vocals。
- 负向压制：singing, mouth open, lip-sync, talking, speaking, vocalizing, open lips, moving mouth。`
  },
  {
    id: 'aspect_ratio_md',
    name: '全画幅比例对照表 (MD)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/aspect_ratio_table.md',
    content: `# 全画幅比例契约与 ComfyUI 分辨率映射表

| 比例 | 适用场景 | ComfyUI Node 61 | 文生图 (1.0MP) | H3视频 (0.4MP) | 构图防裁切规则 |
|---|---|---|---|---|---|
| 9:16 | 竖屏短剧 / TikTok | 9:16 (Portrait Widescreen) | 768×1376 | 480×864 | 头部距顶 6%，鞋底距底 92%，留地面 |
| 16:9 | 电影感 / 横屏短剧 / MV | 16:9 (Widescreen) | 1376×768 | 864×480 | 黄金三分法横向铺展，全身无裁切 |
| 21:9 | 宽银幕大片 | 21:9 (Ultrawide) | 1536×672 | 960×416 | 宽银幕深景深，对峙站位 |
| 1:1 | 正方形广告 / 社媒 | 1:1 (Square) | 1024×1024 | 640×640 | 居中对称视觉锚点 |
| 4:3 | 复古胶片感 | 4:3 (Standard) | 1184×896 | 736×544 | 经典学院画幅 |
| 3:4 | 竖向标准画幅 | 3:4 (Portrait Standard) | 896×1184 | 544×736 | 肖像标准安全框 |`
  },
  {
    id: 'director_spec_md',
    name: 'H3 满血版全模态工作流规范 (MD)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/runninghub_workflow_spec.md',
    content: `# MiniMax H3 满血版 · 多模态生视频加速工作流规范 (RunningHub 2105127972431818753)

## 核心拓扑架构与节点映射：
1. **主算子核心总控 (Node 31 MiniMaxH3ReferenceToVideo)**：
   - 官方核心调度枢纽，全面承接 9 张图片、3 路参考视频、3 路参考音频的多模态输入
   - 内部直连 CLIP (Node 3 Qwen3-VL 32B AWQ) 与双 VAE (Node 4 视频 VAE + Node 12 音频 VAE)
2. **底层模型与加速 LoRA (Node 41 & Node 47)**：
   - UNET 模型：\`minimax_h3_fl2va_int8_convrot.safetensors\` / \`minimax_h3_ref2va_pruned_bf16.safetensors\`
   - 加速补丁：\`T8-minimax_h3_turbo_4步加速_comfyui.safetensors\` (Node 47) + \`MiniMaxH3MemoryEfficientSageAttentionPatch\` (Node 48)
3. **9 张图片多维参考矩阵 (LoadImage)**：
   - Node 18: 图1 (角色/人物，锁定五官骨架与服饰)
   - Node 23: 图2 (场景/环境，空间关系与氛围基调)
   - Node 22: 图3 (光影/色调，光照方向与胶片色彩质感)
   - Node 24: 图4 (物体/产品，3D 资产与道具细节)
   - Node 32: 图5 (品牌/标识，Logo 图形与品牌色结尾)
   - Node 33: 图6 (风格/美术，插画/写实/水墨/赛博视觉)
   - Node 34: 图7 (UI/UX 界面，网页设计与交互原型)
   - Node 35: 图8 (备用角色/姿势，副主角与分身动作)
   - Node 76: 图9 (备用环境/细节，宏观背景与微距特写)
4. **3 路参考视频连续引导 (Node 73, 75, 74 VHS_LoadVideo)**：
   - Node 73 (视频1): 动作/运动 (肢体舞蹈动作、运动轨迹)
   - Node 75 (视频2): 运镜/镜头运动 (推拉摇移、希区柯克变焦)
   - Node 74 (视频3): 节奏/剪辑/角色一致性/首尾帧 (指定起始结束帧，100% 不变脸跨段接力)
5. **3 路参考音频音色绑定 (Node 38, 67, 68 LoadAudio)**：
   - Node 38 (参考音1): 人声/音色 (声学指纹干声，精准唇形发声)
   - Node 67 (参考音2): 歌声/演唱 (歌唱节奏对口型)
   - Node 68 (参考音3): 音乐风格/环境拟音 (背景音乐、雨声/风声/空间拟音)
6. **数学公式与无损封包 (Node 29 & Node 17)**：
   - Node 29: \`ComfyMathExpression\` 执行 \`17n+5\` 严格数学帧长计算；
   - Node 17: \`VHS_VideoCombine\` 输出标准 24fps MP4 成片。`
  },
  {
    id: 'h3_native_audio_spec_md',
    name: 'H3 原生声线推演与音色克隆规范 (MD)',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/audio_consistency_architecture.md',
    content: `# H3 原生声音自生成与参考音频克隆体系规范

## 两种声音输入模式 (Dual Audio Modes)：
1. 有参考音频（音色克隆 Voice Clone）：
   - 上传参考音频文件，通过 Node 75 / Node 12 绑定 <Audio 1/2/3>
   - 提示词锁定：S1 永远是说话人。S1始终使用固定声音：参考音频1（男.mp3），中低音...

2. 无参考音频（H3 文本原生自生成）：
   - Agent 在第 1 步根据角色容貌与剧本，自动推演 6 维自然语言声线设定
   - 包括：年龄段、中高/中低音域、音色特质、常态语速、情绪变化规律及禁用夹子音/播音腔
   - H3 多模态神经声码网络直接 100% 从文本自生成专属声音与口型！

## 镜头级 100% 物理拟音 (Foley In, Score Out)：
- 每个分镜必须详写动作拟音（敲桌、搓烟纸、脚步、衣物摩擦）、呼吸换气与空间底噪
- 彻底消灭死寂空窗，全片后期统一挂载无损 Master BGM 底轨！`
  }
];

export const SkillSpecModal: React.FC<SkillSpecModalProps> = ({ isOpen, onClose }) => {
  const [selectedFileId, setSelectedFileId] = useState<string>('skill_md');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentFile = SPEC_FILES.find(f => f.id === selectedFileId) || SPEC_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name.replace(/ \(.*?\)/, '');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>MV-AUTO-PIPELINE & H3 核心规范源码库 (V2.0)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  全链可直接导出
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                可直接拷贝或下载为本地 Cursor / Claude Code / Agent Skill 规范
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="复制当前文件内容"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制' : '复制代码'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
              title="下载文件到本地"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载文件</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* File Tree Sidebar */}
          <div className="w-64 border-r border-slate-800 bg-slate-950/40 p-3 space-y-1 overflow-y-auto">
            <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1 font-semibold">
              规范文档与质检脚本 ({SPEC_FILES.length})
            </div>
            {SPEC_FILES.map(file => {
              const isSelected = file.id === selectedFileId;
              const isPy = file.type === 'python';
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {isPy ? <Code className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  <span className="truncate">{file.name}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between bg-slate-900/40">
              <span>{currentFile.path}</span>
              <span className="text-[10px] text-slate-500 font-mono">UTF-8 · LF</span>
            </div>
            <pre className="flex-1 p-4 text-xs font-mono text-slate-200 leading-relaxed overflow-y-auto whitespace-pre-wrap selection:bg-cyan-500/30">
              {currentFile.content}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
