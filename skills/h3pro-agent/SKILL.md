---
name: mvh3-agent
description: >
  mvH3-onlyno999 专职视频生成与调度 Agent 规范。集成 MiniMax H3 官方规范、
  RunningHub 终极版调度模型 (https://www.runninghub.cn/post/2079374352503631873/?inviteCode=zedwxo2q)
  以及 Bernini Director rv2v 多图矩阵与分段连续参考机制。
---

# mvH3-onlyno999 Agent 核心技能规范

## 1. 架构总则：前两步焊死 + 第三步云端一键调度插拔
- **Skill 1【焊死】创意分镜构思内核**：解析自然语言与故事设定，输出时间轴结构化镜头大纲。
- **Skill 2【焊死】MiniMax H3 Ref2VA 规范编译器**：
  - 自动编译六段式结构：`[subject_definitions]` ➔ `[summary]` ➔ `[retention_analysis]` ➔ `[detailed_description]` ➔ `[overall_soundscape]` ➔ `[non_diegetic_music]`。
  - 角色音色 `(Sx)` 与 `<d>` 口型发音标签，防裁头中景定位，零字幕文本安全清洗。
  - 影视级大白话脱敏引擎（规避 `integrity_check_failed`）。
- **Skill 3【插拔】RunningHub 云端一键调度接口**：
  - **默认主模型**：RunningHub Bernini Director rv2v
  - **工作流地址**：`https://www.runninghub.cn/post/2079374352503631873/?inviteCode=zedwxo2q`
  - **邀请码**：`zedwxo2q`
  - **核心调度节点**：Node 22 (`ComfyBerniniDirector`)，配合 UNETLoader (Node 17/18)、ModelSamplingSD3 (Node 11/12) 及 VHS_VideoCombine (Node 5)。

---

## 2. 参考图与多模态输入支持机制 (Reference Input Specification)

### 2.1 支持机制与底层结构
在 Node 22 (`ComfyBerniniDirector`) 的 `timeline_data` 核心状态结构中，支持以下层级的分层参考注入：

1. **全局参考图槽位 (Global `refs`)**：
   - 贯穿整个视频生成的全局参考底图。
   - 映射到 `<Picture 1>` ~ `<Picture 6>`：
     - `<Picture 1>` / `ref_image_0`: 主角三视图或正脸高保真定妆卡（1:1 锁面容与服装质感）。
     - `<Picture 2>` / `ref_image_1`: 第二主体 / 配角 / 核心道具卡（如交通工具、特写物件）。
     - `<Picture 3>` / `ref_image_2`: 场景母本图（环境空间、光照色温、背景虚化锚定）。
     - `<Picture 4~6>` / `ref_image_3~5`: 起始帧构图参考图、特定动作姿态或辅助光影卡。

2. **分镜头局部参考图 (Segment `refs`)**：
   - 每个具体分镜头时间切片（例如 `0~81` 帧、`81~162` 帧等）均内置专有的 `refs` 数组。
   - 可在分段中独立覆盖或追加局部特有参考素材（如中途切换场景或道具特写）。

3. **源视频连续引导 (Reference Video & `continuousReference`)**：
   - 节点内置 `referenceVideo` 对象与 `continuousReference` 布尔开关。
   - 可直接载入上一段出片作为动态时空引导，杜绝跨段变脸与光线跳变。

### 2.2 一次能上传多少张参考图？（容量与工程标准）
- **底层架构**：`refs` 数组采用动态列表设计， ComfyUI 节点底层**未设单一固定的硬性张数死限制**。
- **最佳工程实践推荐容量**：**推荐一次配置 1 ~ 6 张**。
- **原因与质检准则**：
  - 1~6 张足以 100% 覆盖角色正面/侧面三视图、配角、场景母图与关键道具。
  - 若单次注入超过 6 张以上，会导致扩散模型的 Cross-Attention 注意力权重过于分散，不同特征向量相互竞争稀释，可能引起画面背景噪点或细微伪影。因此系统默认提供并推荐 **6 张精细矩阵**。

---

## 3. 跨段无缝接力与 15s 零冻结规则
- 跨段必须提取第 1 段尾帧（如 15.00s / 第 362 帧）作为第 2 段首帧垫图。
- 视频拼接时使用 FFmpeg 滤镜 `[1:v]select='gt(n\,0)',setpts=PTS-STARTPTS[v1]` 剔除第 2 段第 0 帧重复垫图，确保画面无停顿重影。
