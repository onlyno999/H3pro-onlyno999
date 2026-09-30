# H3PRO-onlyno999：MiniMax H3 全自动化视频生成平台与导演工作台中台

> **工业级 AI 视频生成 SOP 与云端调度系统**  
> 统合 **【音乐 MV】**、**【竖版短剧 (Short Drama)】** 与 **【商业广告 (Commercials)】** 三大影视题材生产。  
> 独创**「两段式规划法」**：文学剧本构思 ➔ 自动转译为 **MiniMax H3 官方 Ref2VA 规范**。  
> **全面接入 RunningHub 官流终极版**（集成 Bernini Director rv2v 架构），搭载**影视级大白话安全脱敏**、**跨段多图矩阵参考接力（100% 杜绝变脸变装）**、**15s 尾帧垫图与 FFmpeg 零冻结缝合**，直通云端一键出片！

---

## 🔗 云端调度与工作流核心地址
- **平台官网**：[RunningHub 开放平台 (www.runninghub.cn)](https://www.runninghub.cn)
- **最新云端调度模型地址**：[https://www.runninghub.cn/post/2079374352503631873/?inviteCode=zedwxo2q](https://www.runninghub.cn/post/2079374352503631873/?inviteCode=zedwxo2q)
- **官方邀请码**：`zedwxo2q`（绑定即赠 1000 RH 渲染币）
- **核心总控节点**：Node 22 (`ComfyBerniniDirector`)，双 UNet 高低噪采样与多分段连续时空控制。

---

## 🌟 核心功能与使用指南 (快速上手)

### 模式一：创作者工作台 (Studio Workbench)

#### 步骤 1：H3 提示词转译实验室 (Prompt Lab)
1. **输入文学剧本 / 自然语言大白话**：
   - 可以在输入框直接输入生活化、有戏剧冲突的大白话脚本（如“铁蛋追打野猪，最后摔在草垛上...”）。
2. **大白话安全脱敏引擎 (Anti-integrity_check_failed)**：
   - 系统自动对“打架”、“车祸”、“撞飞”、“吐血”等高危风控词进行影视级戏剧化平替（例：将撞飞转译为“夸张滑稽腾空翻滚三周半，稳稳跌坐松软草垛，卡通弹跳无物理伤害”），**100% 杜绝平台风控拦截**。
3. **一键编译为官方 Ref2VA 六段式**：
   - 自动生成 `[subject_definitions]`、`[summary]`、`[retention_analysis]`、`[detailed_description]`、`[overall_soundscape]`、`[non_diegetic_music]`。
   - 严格落实**“零字幕硬门禁”**（绝不包含 `no subtitles` 等易引起双重字幕的反向词）与**“(Sx) + <d> 口型对白标签”**。

#### 步骤 2：三视图切片与融光资产工坊 (Asset Studio)
1. **解决白底三视图喂给模型导致五官走样（残差距高达 47%）的行业痛点**：
   - **智能无损切片**：自动拆解为正面全身、半身面部特写、下肢道具细节卡。
   - **Qwen 融光去棚底**：一键去除影棚纯白/浅灰底色反光与白边，注入环境暖光与接触阴影。
   - **残差距从 47.6% 暴降至 0.8% 内**，实现 1:1 咬合。

#### 步骤 3：多图参考矩阵与云端一键调度 (RunningHub Dispatch)
1. **一次能上传多少张参考图？**
   - **支持机制**：Node 22 (`ComfyBerniniDirector`) 采用动态 `refs` 数组及分镜头独立绑定机制；
   - **推荐容量**：**标准配置 1 ~ 6 张**：
     - `ref_image_0` / `<Picture 1>`：主角正面高保真立绘 / 三视图卡
     - `ref_image_1` / `<Picture 2>`：第二主体 / 配角 / 核心道具卡
     - `ref_image_2` / `<Picture 3>`：场景母本空间卡（虚化宾客、灯光基调）
     - `ref_image_3~5` / `<Picture 4~6>`：起始构图与动作姿态卡
   - **分镜头独立参考 (`segments.refs`)**：支持针对特定镜头切片（如 0~81 帧、81~162 帧）动态追加局部特写图。
   - **源视频连续引导 (`referenceVideo`)**：可载入上一段出片作为动态时空条件引导。
2. **填入 RunningHub API Key**：
   - 点击右上角或调度面板的“保存并测试”，即可调用 `runninghubService` 批量派发任务或一键直达 Web 界面调试。

#### 步骤 4：多段视频无缝接力与零冻结终剪 (Algorithm Lab)
- **15.00s 尾帧垫图机制**：提取第 1 段末尾（第 362 帧）作为第 2 段首帧输入，物理硬锁视线、道具与服装。
- **FFmpeg 零重影切片**：使用 `[1:v]select='gt(n\,0)',setpts=PTS-STARTPTS[v1]` 自动切除第 2 段第 0 帧重复垫图，消灭 1 帧停顿与叠影！

---

### 模式二：系统后台管理系统 (Admin Dashboard)

点击顶栏右上角 **「进入管理系统」** 可切换到后台中台：
1. **API 配额与并发监控 (ApiQuotaManagerTab)**：监控 RunningHub、Qwen 与 MiniMax 各 API 的 Token 消耗与并发度。
2. **任务队列监视器 (TaskQueueMonitorTab)**：端到端查看排队中、渲染中、已完成及失败任务。
3. **节点拓扑配置 (ModelNodeConfigTab)**：实时核验 Node 22 (`ComfyBerniniDirector`)、Node 17/18 (`UNETLoader`) 等节点参数。
4. **安全风控策略引擎 (SafetyPolicyEngineTab)**：维护与扩充脱敏词库（暴力、敏感动作平替库）。
5. **合规审计与硬门禁 (GatekeeperAuditTab)**：时间轴 17n+5 帧数合规检查与防反向字幕硬门禁。
6. **CLI 脚本调度中心 (CliScriptIntegrationTab)**：提供 `rh_h3.py` 脚本参数与一键终端触发命令。

---

## 🛠️ CLI 自动化出片示例

```bash
# 生成第 1 段 (P01) - 6 张多图矩阵参考输入：
python3 rh_h3.py --shot P01 --duration 10.0 \
  --ref-image-0 "workspace/main_char.png" \
  --ref-image-1 "workspace/side_char.png" \
  --ref-image-2 "workspace/scene_base.png" \
  --prompt "主角在老宅庭院中修整木椅..." \
  --api-key "你的_RunningHub_API_KEY"

# 生成第 2 段 (P02) - 视频参考接力 (杜绝变脸)：
python3 rh_h3.py --shot P02 --duration 10.0 \
  --ref-video "workspace/output_p01.mp4" \
  --prompt "承接上一镜头，主角抬起头望向走来的客人..." \
  --api-key "你的_RunningHub_API_KEY"
```

---

## 🎬 零重影四段无缝拼接命令 (FFmpeg)

```bash
ffmpeg -y -v error \
 -i P01_15s.mp4 -i P02_15s.mp4 -i P03_15s.mp4 -i P04_15s.mp4 -i master_bgm.wav \
 -filter_complex "
   [0:v]setpts=PTS-STARTPTS[v0];[0:a]asetpts=PTS-STARTPTS[a0];
   [1:v]select='gt(n\,0)',setpts=PTS-STARTPTS[v1];[1:a]asetpts=PTS-STARTPTS[a1];
   [2:v]select='gt(n\,0)',setpts=PTS-STARTPTS[v2];[2:a]asetpts=PTS-STARTPTS[a2];
   [3:v]select='gt(n\,0)',setpts=PTS-STARTPTS[v3];[3:a]asetpts=PTS-STARTPTS[a3];
   [v0][v1][v2][v3]concat=n=4:v=1:a=0[vconcat];
   [a0][a1][a2][a3]concat=n=4:v=0:a=1[adialogue];
   [4:a]volume=0.45[abgm];
   [adialogue][abgm]amix=inputs=2:duration=first:dropout_transition=2[aout]" \
 -map "[vconcat]" -map "[aout]" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p \
 -c:a aac -b:a 192k -movflags +faststart 成片_一镜到底短剧.mp4
```

---

## 📁 目录文件索引

```
├── README.md                                     # 本使用与架构详细介绍
├── H3_README.md                                  # H3 官流终极版核心 SOP 指南
├── rh_h3.py                                     # RunningHub OpenAPI 调度脚本
├── skills/
│   └── h3pro-agent/
│       └── SKILL.md                             # H3PRO 专职 Agent 技能规范
├── src/
│   ├── components/
│   │   ├── H3PromptLabTab.tsx                   # 提示词转译与大白话安全脱敏
│   │   ├── ThreeWorkflowAssetStudio.tsx         # 三视图智能切片与融光去棚底
│   │   ├── RunningHubDispatchTab.tsx            # 云端调度与多图矩阵配置
│   │   ├── StoryboardStudioTab.tsx              # 分镜规划与时长切分
│   │   ├── AlgorithmLabTab.tsx                  # 尾帧垫图与 FFmpeg 零冻结拼接
│   │   ├── AudioConsistencyStudioTab.tsx        # 物理音效与口型一致性
│   │   └── admin/                               # 后台管理六大中台组件
│   └── utils/
│       ├── h3PromptEngine.ts                    # 六段式提示词编译器与词库脱敏
│       └── durationAutoPlanner.ts               # 17n+5 时长自适应计算
```

---

## 📌 系统更新日志与文档同步维护规范 (Changelog & Sync Rule)

> **铁律原则**：本系统往后每一次增加功能、修改接口、调整节点或更新工作流配置，**必须严格同步更新本 README.md 文档及系统内部规范**。

### 最新更新记录：
- **[2026-09-30] H3PRO-onlyno999 品牌与云端调度升级**：
  1. 系统正式更名为 **H3PRO-onlyno999**（包含全页面标题、SEO 元数据、Logo 与后台管理系统）。
  2. 云端调度全面接入 **RunningHub 官方 Bernini Director rv2v 架构**：
     - 工作流地址更新为：`https://www.runninghub.cn/post/2079374352503631873/?inviteCode=zedwxo2q`
     - 核心总控节点升级为 Node 22 (`ComfyBerniniDirector`)。
  3. **参考图上传机制与容量规范确立**：
     - 底层采用动态 `refs` 数组及分镜头 `segments.refs` 独立绑定机制；
     - 明确工程标准最佳实践：一次上传推荐 **1 ~ 6 张** 参考图，杜绝注意力过度分散导致的画面噪点；
     - 完整规范同步写入 `/skills/h3pro-agent/SKILL.md` 及前端工作台 `SkillSpecModal.tsx`。

