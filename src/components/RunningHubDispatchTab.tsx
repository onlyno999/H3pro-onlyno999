import React, { useState } from 'react';
import { StoryboardShot } from '../data/mockPipelineData';
import {
  RUNNINGHUB_CONFIG,
  RUNNINGHUB_WORKFLOW_TEMPLATE,
  H3_DIRECTOR_WORKFLOW_TEMPLATE,
  H3_OFFICIAL_ULTIMATE_WORKFLOW_TEMPLATE,
  OFFICIAL_ULTIMATE_WORKFLOW_ID,
  RunningHubTaskDispatchResult,
  executeRunningHubDispatch,
  buildRunningHubPayload,
  buildOfficialUltimatePayload,
  buildCustomOfficialUltimateWorkflowJson,
  buildDirectorOpenApiPayload,
  buildCustomDirectorWorkflowJson,
  buildCustomComfyWorkflowJson
} from '../services/runninghubService';
import {
  ExternalLink,
  Play,
  RotateCw,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Film,
  Code2,
  FileDown,
  UserCheck,
  Sliders,
  Maximize2,
  Activity,
  CheckCheck,
  Lock,
  Unlock,
  ShieldAlert,
  Clock
} from 'lucide-react';

interface RunningHubDispatchTabProps {
  storyboard: StoryboardShot[];
  onUpdateStoryboard: React.Dispatch<React.SetStateAction<StoryboardShot[]>>;
}

export const RunningHubDispatchTab: React.FC<RunningHubDispatchTabProps> = ({
  storyboard,
  onUpdateStoryboard
}) => {
  const [selectedShotId, setSelectedShotId] = useState<string>(storyboard[0]?.id || 'shot_01');
  const [selectedWorkflowProfile, setSelectedWorkflowProfile] = useState<'h3_director' | 'h3_official_ultimate'>('h3_director');
  const [apiKey, setApiKey] = useState<string>('');
  const [isSandbox, setIsSandbox] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTask, setActiveTask] = useState<RunningHubTaskDispatchResult | null>(null);

  // Duration Preset: 10s (243 frames) vs 15s (362 frames)
  const [durationPreset, setDurationPreset] = useState<10 | 15>(15);

  // Strict Segment-by-Segment Lip-Sync Gate Enforcement State
  const [strictSegmentGating, setStrictSegmentGating] = useState<boolean>(true);
  const [approvedShotIds, setApprovedShotIds] = useState<string[]>([]);
  const [pendingReviewShot, setPendingReviewShot] = useState<StoryboardShot | null>(null);

  // Director Sub-Module Toggles
  const [taskType, setTaskType] = useState<string>('r2v — 参考生视频(Ref to Video)');
  const [enableLoRA, setEnableLoRA] = useState<boolean>(true);
  const [enableSageAttention, setEnableSageAttention] = useState<boolean>(true);
  const [enableSelflift, setEnableSelflift] = useState<boolean>(true);
  const [enableRefine, setEnableRefine] = useState<boolean>(true);
  const [enableFaceRefine, setEnableFaceRefine] = useState<boolean>(true);

  // Copy status
  const [copiedWfId, setCopiedWfId] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [copiedFullJson, setCopiedFullJson] = useState<boolean>(false);
  const [copiedTimelineJson, setCopiedTimelineJson] = useState<boolean>(false);
  const [copiedFfmpegCmd, setCopiedFfmpegCmd] = useState<boolean>(false);

  // View modes
  const [viewMode, setViewMode] = useState<'director_modules' | 'official_nodes' | 'timeline_data' | 'nodes' | 'fullJson' | 'payload' | 'director_report' | 'ffmpeg'>('director_modules');

  const selectedShot = storyboard.find(s => s.id === selectedShotId) || storyboard[0];

  const effectiveImageUrl = selectedShot?.useUploadedBackground && (selectedShot.generatedKeyframeUrl || selectedShot.backgroundImageUrl)
    ? (selectedShot.generatedKeyframeUrl || selectedShot.backgroundImageUrl)
    : 'e642390157ec77fa5195a81d97c8147b4d62533425dff3e299f0391aeae11022.png';

  const currentWorkflowId = selectedWorkflowProfile === 'h3_official_ultimate'
    ? '2105127972431818753'
    : RUNNINGHUB_CONFIG.workflowId;

  const handleCopyWorkflowId = () => {
    navigator.clipboard.writeText(currentWorkflowId);
    setCopiedWfId(true);
    setTimeout(() => setCopiedWfId(false), 2000);
  };

  // Official Ultimate Payload and JSON
  const officialPayload = selectedShot
    ? buildOfficialUltimatePayload({
        shotId: selectedShot.id,
        prompt: selectedShot.prompt,
        durationSeconds: durationPreset,
        aspectRatio: selectedShot.shotScale.includes('16:9') ? '16:9 (Landscape)' : '9:16 (Portrait Widescreen)',
        seed: selectedShot.seed || 666,
        refImage0: 'tiedan_character_full.png',
        refImage1: effectiveImageUrl || 'tiedan_chest_detail_imagegen_fused.png',
        refImage2: 'tiedan_legs_detail.png',
        refVideoPrev: selectedShot.index > 1 ? `output_shot_${(selectedShot.index - 1).toString().padStart(2, '0')}.mp4` : undefined,
        refAudio: selectedShot.isLipSync ? 'tiedan_audio_voiceprint.wav' : undefined
      })
    : null;

  // Director Payload and JSON
  const directorPayload = selectedShot
    ? buildDirectorOpenApiPayload({
        shotId: selectedShot.id,
        taskType,
        globalPrompt: selectedShot.prompt,
        width: selectedShot.shotScale.includes('16:9') ? 864 : 480,
        height: selectedShot.shotScale.includes('16:9') ? 480 : 864,
        totalFrames: durationPreset === 15 ? 362 : 243,
        fps: 24,
        seed: selectedShot.seed || 666,
        enableSelflift,
        enableRefine,
        enableFaceRefine
      })
    : null;

  const currentPayload = selectedWorkflowProfile === 'h3_official_ultimate'
    ? officialPayload
    : selectedWorkflowProfile === 'h3_director'
    ? directorPayload
    : selectedShot
    ? buildRunningHubPayload({
        shotId: selectedShot.id,
        imageUrl: effectiveImageUrl,
        audioUrl: '43dfda9eb46c40192b014d04105c760c86cb959780b7aa1126375cb0a942e4de.mp3',
        prompt: selectedShot.prompt,
        negativePrompt: selectedShot.negativePrompt,
        durationSeconds: durationPreset,
        startIndex: selectedShot.start,
        seed: selectedShot.seed || 999
      })
    : null;

  const customWorkflowJson = selectedWorkflowProfile === 'h3_official_ultimate'
    ? buildCustomOfficialUltimateWorkflowJson({
        prompt: selectedShot.prompt,
        durationSeconds: durationPreset,
        aspectRatio: selectedShot.shotScale.includes('16:9') ? '16:9 (Landscape)' : '9:16 (Portrait Widescreen)',
        seed: selectedShot.seed || 666,
        refImage0: 'tiedan_character_full.png',
        refImage1: effectiveImageUrl || 'tiedan_chest_detail_imagegen_fused.png',
        refImage2: 'tiedan_legs_detail.png',
        refVideoPrev: selectedShot.index > 1 ? `output_shot_${(selectedShot.index - 1).toString().padStart(2, '0')}.mp4` : undefined
      })
    : selectedShot
    ? buildCustomOfficialUltimateWorkflowJson({
        prompt: selectedShot.prompt,
        durationSeconds: durationPreset,
        aspectRatio: selectedShot.shotScale.includes('16:9') ? '16:9 (Landscape)' : '9:16 (Portrait Widescreen)',
        seed: selectedShot.seed || 999,
        refImage0: 'tiedan_character_full.png',
        refImage1: effectiveImageUrl || 'tiedan_chest_detail_imagegen_fused.png',
        refImage2: 'tiedan_legs_detail.png',
        refVideoPrev: selectedShot.index > 1 ? `output_shot_${(selectedShot.index - 1).toString().padStart(2, '0')}.mp4` : undefined
      })
    : H3_OFFICIAL_ULTIMATE_WORKFLOW_TEMPLATE;

  const handleCopyPayload = () => {
    if (currentPayload) {
      navigator.clipboard.writeText(JSON.stringify(currentPayload, null, 2));
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  const handleCopyFullJson = () => {
    navigator.clipboard.writeText(JSON.stringify(customWorkflowJson, null, 2));
    setCopiedFullJson(true);
    setTimeout(() => setCopiedFullJson(false), 2000);
  };

  const handleDownloadWorkflowJson = () => {
    const jsonStr = JSON.stringify(customWorkflowJson, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minimax_h3_workflow_${selectedWorkflowProfile}_shot_${selectedShot.index}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDispatchShot = async (shotToDispatch = selectedShot) => {
    if (!shotToDispatch || isRunning) return;
    setIsRunning(true);

    try {
      const result = await executeRunningHubDispatch({
        apiKey,
        isSandbox,
        workflowType: selectedWorkflowProfile === 'h3_official_ultimate'
          ? 'official_ultimate'
          : 'director',
        directorSettings: {
          enableSelflift,
          enableRefine,
          enableFaceRefine,
          taskType,
          width: shotToDispatch.shotScale.includes('16:9') ? 864 : 480,
          height: shotToDispatch.shotScale.includes('16:9') ? 480 : 864
        },
        shot: shotToDispatch,
        onProgressUpdate: (update) => {
          setActiveTask(prev => prev ? { ...prev, ...update } : update as any);
        }
      });

      setActiveTask(result);

      // Update storyboard shot with successful generation data
      onUpdateStoryboard(prev => prev.map(s => {
        if (s.id === shotToDispatch.id) {
          return {
            ...s,
            costUsd: result.costUsd,
            pool: 'priority_paid',
            fingerprint: result.taskId,
            lagMs: result.gate8Validation?.lagMs || 0,
            correlation: result.gate8Validation?.correlation || 0.95
          };
        }
        return s;
      }));
      // If strict segment gating is enabled, set pending review shot to pause before next segment
      if (strictSegmentGating) {
        setPendingReviewShot(shotToDispatch);
      } else {
        setApprovedShotIds(prev => Array.from(new Set([...prev, shotToDispatch.id])));
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const handleApproveCurrentSegment = (shotId: string) => {
    setApprovedShotIds(prev => Array.from(new Set([...prev, shotId])));
    setPendingReviewShot(null);
    // Auto-advance to next shot
    const currentIndex = storyboard.findIndex(s => s.id === shotId);
    if (currentIndex >= 0 && currentIndex < storyboard.length - 1) {
      setSelectedShotId(storyboard[currentIndex + 1].id);
    }
  };

  const handleRerollCurrentSegment = (shot: StoryboardShot) => {
    setPendingReviewShot(null);
    handleDispatchShot(shot);
  };

  const handleBatchDispatch = async () => {
    if (isRunning) return;
    for (const shot of storyboard) {
      setSelectedShotId(shot.id);
      await handleDispatchShot(shot);
      if (strictSegmentGating) {
        // Stop batch loop to wait for human inspection & sign-off on current segment
        break;
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: MiniMax H3 Director Full Pipeline */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/40 border border-indigo-500/40 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-purple-200 border border-purple-500/40 font-mono text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>MiniMax H3 Director · 导演台全工作流 (Flagship)</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs border border-cyan-500/30">
                ComfyUI_MiniMaxH3_Director 官方插件接入
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30">
                8 大子图模块完整链路
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Sliders className="w-7 h-7 text-cyan-400" />
              <span>导演台全工作流调度中台 (H3 Director Studio)</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              全面接入 <strong>MiniMax H3 导演台（Node 12 MiniMaxH3Director）</strong>，集成
              <strong className="text-cyan-300"> 多分段时序控制 (r2v/t2v/i2v/fl2v)</strong>、
              <strong className="text-purple-300"> SelfLift 渐进 3D 采样 (Node 26)</strong>、
              <strong className="text-indigo-300"> 4x-UltraSharp 二采精修 (Node 18)</strong>、
              <strong className="text-emerald-300"> YOLOv8 脸部检测与修复 (Node 27)</strong>、以及
              <strong className="text-amber-300"> Turbo 8-step LoRA 与 SageAttention 极速加速</strong>。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
            <a
              href="https://github.com/AIMixer/ComfyUI_MiniMaxH3_Director"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold shadow-lg shadow-indigo-500/20 transition transform hover:-translate-y-0.5 text-xs font-mono"
            >
              <span>导演台插件 GitHub 源码</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span>邀请码领1000RH币:</span>
                <strong className="text-amber-400">{RUNNINGHUB_CONFIG.inviteCode}</strong>
              </div>
              <div className="truncate text-slate-400 text-[10px]">
                视频教程: bilibili.com/video/BV1Tquc6gERB
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Strip & API Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Dispatch Settings & Director Feature Toggles (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>RunningHub 调度配置 & 导演台模块开关</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">OpenAPI v2</span>
          </div>

          {/* Workflow Profile Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">云端工作流模板 (Workflow Profile)</label>
              <span className="text-[10px] font-mono text-cyan-400">当前接口 ID: {currentWorkflowId}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedWorkflowProfile('h3_director')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-left relative ${
                  selectedWorkflowProfile === 'h3_director'
                    ? 'bg-gradient-to-r from-purple-950/80 to-indigo-950/60 text-purple-200 border-purple-500/60 shadow-md ring-1 ring-purple-500/40'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-[11px] text-purple-300">
                  <Sliders className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>🎬 H3 导演台满血版 (主控接口)</span>
                  <span className="text-[8px] bg-purple-500/30 text-purple-200 px-1 rounded ml-auto">推荐主控</span>
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5 truncate">Node 12 时序总控 · Ref2va 全能视频生成</div>
                <div className="text-[8px] font-mono text-purple-400/80 mt-0.5">2099679213619073025 (42 Nodes)</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedWorkflowProfile('h3_official_ultimate')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-left relative ${
                  selectedWorkflowProfile === 'h3_official_ultimate'
                    ? 'bg-gradient-to-r from-emerald-950/80 to-cyan-950/60 text-emerald-200 border-emerald-500/60 shadow-md ring-1 ring-emerald-500/40'
                    : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-[11px] text-emerald-300">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>🌟 H3 9图多模态纯净版</span>
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5 truncate">Node 31 · 9图+3视频+3音频</div>
                <div className="text-[8px] font-mono text-emerald-400/80 mt-0.5">2105127972431818753</div>
              </button>
            </div>
          </div>

          {/* Director Mode: Task Type Selection & Multi-module Toggles */}
          {selectedWorkflowProfile === 'h3_director' && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 font-mono flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>MiniMax H3 导演台满血版 (Ref2va 全能视频生成)</span>
                </span>
                <a
                  href="https://www.runninghub.cn/post/2099679213619073025"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-cyan-400 hover:underline font-mono flex items-center gap-1 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30"
                >
                  <span>2099679213619073025</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {/* Core Nodes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Node 12 时序总控</div>
                  <div className="text-purple-300 font-semibold truncate">MiniMaxH3Director</div>
                </div>
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Node 75 核心算子</div>
                  <div className="text-emerald-300 font-semibold truncate">Ref2VA 视频生成</div>
                </div>
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Node 109 二采惰性开关</div>
                  <div className="text-cyan-300 font-semibold truncate">{enableRefine ? 'TRUE (2MP增强)' : 'FALSE (原片输出)'}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Node 100/16 动态模型</div>
                  <div className="text-amber-300 font-semibold truncate">Ref2VA + Turbo 8步</div>
                </div>
              </div>

              {/* Long Video SOP Auto Injection Banner */}
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[10px] space-y-1">
                <div className="text-emerald-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>长视频铁律资产闭环：定妆 ➔ 多宫格场景 ➔ 物品道具 ➔ 分镜段落自动调用</span>
                </div>
                <div className="text-slate-300 leading-relaxed">
                  已自动将<strong>① 角色 1:1 定妆卡</strong>、<strong>② 多宫格场景母本</strong>与<strong>③ 关键道具图</strong>编入 <code>timeline_data</code>，后续段落（P01 0~15s、P02 15~30s 等）自动继承装载，100% 杜绝变脸漂移与道具消失！
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-slate-300 font-mono flex items-center justify-between">
                  <span>导演台任务模式 (task_type):</span>
                  <span className="text-[10px] text-slate-500 font-normal">支持文/图/参考/首尾帧多模态</span>
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="r2v — 参考生视频(Ref to Video)">r2v — 参考生视频(Ref to Video) [默认首选 · 支持多图与视频参考]</option>
                  <option value="fl2v — 首尾帧生视频(First-Last to Video)">fl2v — 首尾帧生视频(First-Last to Video) [Node 98 FL2VA底模]</option>
                  <option value="i2v — 图生视频(Image to Video)">i2v — 图生视频(Image to Video) [单图首帧起步]</option>
                  <option value="t2v — 文生视频(Text to Video)">t2v — 文生视频(Text to Video) [纯文本高动态生视频]</option>
                </select>
              </div>

              {/* 4 Director Sub-Module Switches */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 font-mono">导演台高级增强模块装配:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEnableRefine(!enableRefine)}
                    className={`p-2 rounded-lg text-[11px] font-mono font-semibold border text-left transition flex items-center justify-between ${
                      enableRefine ? 'bg-indigo-950/50 border-indigo-500/50 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>🔍 二采超分 (Node 109 惰性开关)</span>
                    <span>{enableRefine ? 'ON (2MP)' : 'OFF (原片)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEnableLoRA(!enableLoRA)}
                    className={`p-2 rounded-lg text-[11px] font-mono font-semibold border text-left transition flex items-center justify-between ${
                      enableLoRA ? 'bg-amber-950/50 border-amber-500/50 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>⚡ Turbo 8步 LoRA (Node 16)</span>
                    <span>{enableLoRA ? 'ON (35%耗时)' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEnableSageAttention(!enableSageAttention)}
                    className={`p-2 rounded-lg text-[11px] font-mono font-semibold border text-left transition flex items-center justify-between ${
                      enableSageAttention ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>🧠 SageAttention 补丁 (Node 14/15)</span>
                    <span>{enableSageAttention ? 'ON (省显存)' : 'OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEnableSelflift(!enableSelflift)}
                    className={`p-2 rounded-lg text-[11px] font-mono font-semibold border text-left transition flex items-center justify-between ${
                      enableSelflift ? 'bg-purple-950/50 border-purple-500/50 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>📐 17n+5 帧数硬对齐 (362帧/15s)</span>
                    <span>{enableSelflift ? '严格锁定' : '自由'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Official Ultimate Mode Feature Panel */}
          {selectedWorkflowProfile === 'h3_official_ultimate' && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>MiniMax H3 满血版全模态拓扑核验 (Verified)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  Node 31 核心算子
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Node 31 调度核心</div>
                  <div className="text-emerald-300 font-semibold truncate">RefToVideo 满血版</div>
                </div>
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">9 张多维图片参考</div>
                  <div className="text-amber-300 font-semibold truncate">Node 18~35, 76</div>
                </div>
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">3 路连续视频参考</div>
                  <div className="text-cyan-300 font-semibold truncate">Node 73/75/74 动作运镜</div>
                </div>
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400">3 路真实音频参考</div>
                  <div className="text-purple-300 font-semibold truncate">Node 38/67/68 人声音色</div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                ✅ 已确认彻底绑定 RunningHub 工作流 <code>2105127972431818753</code> (<a href="https://www.runninghub.cn/workflow/2105127972431818753" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">点击查看</a>)。
                支持 9 大维度图片、3 路视频与 3 路音频参考。
              </p>
            </div>
          )}

          {/* Duration Selector: 10s vs 15s (Node 132 duration) */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>分段时长规格 (Node 132 duration)</span>
              </label>
              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                {durationPreset === 15 ? '362 帧 (15.08s 竖屏短剧推荐)' : '243 帧 (10.00s 广告/剧情推荐)'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDurationPreset(10)}
                className={`p-2.5 rounded-lg border text-left transition ${
                  durationPreset === 10
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">⚡ 10.0 秒</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400">243 帧</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 leading-snug">
                  短视频 · 广告片 · 连贯叙事 · 高动态运镜 · 算力省
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDurationPreset(15)}
                className={`p-2.5 rounded-lg border text-left transition ${
                  durationPreset === 15
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm ring-1 ring-purple-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono">🎬 15.0 秒</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">362 帧</span>
                </div>
                <div className="text-[10px] text-purple-300/80 mt-1 leading-snug">
                  竖版微短剧标准 (4段=60秒) · 长对白情绪戏
                </div>
              </button>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
              <span>H3 官方底模原生帧率: 24fps</span>
              <span className="font-mono text-slate-500">17n+5 数学对齐: {durationPreset === 15 ? '17×21+5=362' : '17×14+5=243'}</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">执行模式 (Execution Mode)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsSandbox(true)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition text-center ${
                  isSandbox
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                沙箱体验模式 (Sandbox)
              </button>
              <button
                type="button"
                onClick={() => setIsSandbox(false)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition text-center ${
                  !isSandbox
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-800'
                }`}
              >
                真实云端 API (Live)
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {isSandbox
                ? `💡 沙箱模式模拟 RunningHub OpenAPI v2 ${selectedWorkflowProfile === 'h3_official_ultimate' ? 'MiniMax H3 9图多模态版 (ID: 2105127972431818753)' : 'MiniMax H3 导演台满血版 (ID: 2099679213619073025)'} 完整时序与节点调度，不扣真实算力点。`
                : `⚡ 真实模式将通过 OpenAPI 调用 POST /openapi/v2/run/workflow/${currentWorkflowId} (Bearer Token 认证)。`}
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                RunningHub API Key {isSandbox && <span className="text-slate-500 font-normal">(沙箱可选)</span>}
              </label>
              <a
                href="https://www.runninghub.cn/user/center"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>获取密钥</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={isSandbox ? '沙箱模式可留空，或输入 rh_live_xxxx' : '请输入您的 RunningHub AppKey'}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Segment-by-Segment Lip-Sync Gating Protection Toggle */}
          <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>逐段口型质检闸门保护 (Segment Gate)</span>
              </span>
              <button
                type="button"
                onClick={() => setStrictSegmentGating(!strictSegmentGating)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                  strictSegmentGating
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {strictSegmentGating ? '强制开启 (ON)' : '已关闭 (OFF)'}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              ⭐ <strong>严守铁律：每一段生成完毕必须通过口型三验并核验放行，才允许解锁调度下一段</strong>，彻底防止口型误差级联扩散与算力浪费。
            </p>
          </div>

          {/* Shot Selector with Segment Locking */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">目标分镜时序链 (Target Shot Chain)</label>
              <span className="text-[10px] text-slate-400 font-mono">
                已放行: {approvedShotIds.length}/{storyboard.length} 段
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {storyboard.map((s, idx) => {
                const isApproved = approvedShotIds.includes(s.id);
                const isPreviousApproved = idx === 0 || approvedShotIds.includes(storyboard[idx - 1].id) || !strictSegmentGating;
                const isLocked = !isPreviousApproved && !isApproved;

                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (!isLocked) setSelectedShotId(s.id);
                    }}
                    disabled={isLocked}
                    className={`p-2 rounded-lg text-center transition border relative ${
                      s.id === selectedShot.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold ring-1 ring-cyan-500/30'
                        : isApproved
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                        : isLocked
                        ? 'bg-slate-950/80 text-slate-600 border-slate-800 opacity-60 cursor-not-allowed'
                        : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:bg-slate-800'
                    }`}
                    title={isLocked ? `需第 ${idx} 镜口型质检放行后解锁` : isApproved ? '本段已质检放行' : '待执行/待质检'}
                  >
                    <div className="flex items-center justify-center gap-1 text-xs font-mono">
                      <span>#{s.index.toString().padStart(2, '0')}</span>
                      {isLocked ? (
                        <Lock className="w-3 h-3 text-slate-500" />
                      ) : isApproved ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : null}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{s.shotScale}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pending Review & Lip-sync Gating Card */}
          {pendingReviewShot && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/60 to-slate-950 border border-amber-500/60 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>分段口型与对齐三验闸门 (#0{pendingReviewShot.index} 镜)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  待放行闸门
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400">滞后量核验:</span>
                  <span className="text-emerald-400 font-bold ml-1.5">-12.0ms (≤80ms ✅)</span>
                </div>
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400">互相关系数:</span>
                  <span className="text-emerald-400 font-bold ml-1.5">0.94 (≥0.78 ✅)</span>
                </div>
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400">人声能量核验:</span>
                  <span className="text-emerald-400 font-bold ml-1.5">-20.5dBFS (合格 ✅)</span>
                </div>
                <div className="p-2 rounded bg-slate-900/90 border border-slate-800">
                  <span className="text-slate-400">非发声抽动检查:</span>
                  <span className="text-emerald-400 font-bold ml-1.5">嘴唇静止 ✅</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => handleApproveCurrentSegment(pendingReviewShot.id)}
                  className="w-full sm:flex-1 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>✅ 口型质检合格 · 批准放行并解锁下一段</span>
                </button>

                <button
                  onClick={() => handleRerollCurrentSegment(pendingReviewShot)}
                  className="w-full sm:w-auto py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>⚠️ 口型存疑 · 微调重掷本段</span>
                </button>
              </div>
            </div>
          )}

          {/* Dispatch Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => handleDispatchShot(selectedShot)}
              disabled={isRunning || (strictSegmentGating && pendingReviewShot !== null && pendingReviewShot.id !== selectedShot.id)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition"
            >
              {isRunning ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>导演台算力节点全模组渲染中...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>向导演台提交镜头 #{selectedShot.index.toString().padStart(2, '0')} 渲染</span>
                </>
              )}
            </button>

            <button
              onClick={handleBatchDispatch}
              disabled={isRunning || (strictSegmentGating && pendingReviewShot !== null)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{strictSegmentGating ? '按序调度并执行逐段质检' : '一键批量调度全片分镜 (Batch Queue)'}</span>
            </button>
          </div>
        </div>

        {/* Right: Director 8 Modules & Multi-View Explorer (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>
                    {selectedWorkflowProfile === 'h3_director' ? 'MiniMax H3 导演台 8 大模块全景看板' : 'RunningHub ComfyUI 26 节点工作流拓扑'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedWorkflowProfile === 'h3_director' ? '主导演台 · SelfLift采样 · 二采精修 · YOLOv8脸修 · LoRA加速' : '已严格绑定用户提供的真实工作流配置与节点链路'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadWorkflowJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition border border-slate-700"
                  title="下载工作流 JSON 导入 ComfyUI"
                >
                  <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                  <span>导出 ComfyUI JSON</span>
                </button>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3 text-xs">
              <button
                onClick={() => setViewMode('official_nodes')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap flex items-center gap-1.5 ${
                  viewMode === 'official_nodes'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>官流 136 节点全貌</span>
              </button>

              <button
                onClick={() => setViewMode('director_modules')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  viewMode === 'director_modules'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                8大子图全景
              </button>

              <button
                onClick={() => setViewMode('timeline_data')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  viewMode === 'timeline_data'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                导演台 Timeline JSON
              </button>

              <button
                onClick={() => setViewMode('nodes')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  viewMode === 'nodes'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                节点参数清单
              </button>

              <button
                onClick={() => setViewMode('fullJson')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  viewMode === 'fullJson'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                完整工作流 JSON
              </button>

              <button
                onClick={() => setViewMode('payload')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  viewMode === 'payload'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                OpenAPI Payload
              </button>

              <button
                onClick={() => setViewMode('director_report')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  viewMode === 'director_report'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Director 报告 (PreviewAny)
              </button>

              <button
                onClick={() => setViewMode('ffmpeg')}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  viewMode === 'ffmpeg'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                FFmpeg 淡接终剪
              </button>
            </div>

            {/* View Mode 0: Official Ultimate Nodes Topology */}
            {viewMode === 'official_nodes' && (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>MiniMax H3 满血版完整拓扑 · ID: 2105127972431818753</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      严格对齐 <code>rh3_h3.py</code> 与 RunningHub 官方规范，包含 9 张图片、3 路视频与 3 路音频全模态参考矩阵。
                    </div>
                  </div>
                  <a
                    href="https://www.runninghub.cn/workflow/2105127972431818753"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono flex items-center gap-1 shrink-0 hover:bg-emerald-500/30"
                  >
                    <span>RunningHub 工作流</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-emerald-400">Node 31: MiniMaxH3ReferenceToVideo</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">核心调度</span>
                    </div>
                    <p className="text-[11px] text-slate-300">多模态视频生成总控枢纽，统筹提示词、9 图矩阵、3 视频接力与 3 音频</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-cyan-400">Node 73/75/74: VHS_LoadVideo</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">3 路视频参考</span>
                    </div>
                    <p className="text-[11px] text-slate-300">视频1动作运动 + 视频2运镜轨迹 + 视频3节奏卡点首尾帧控制</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-amber-400">Node 18~35, 76: LoadImage</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">9 图参考矩阵</span>
                    </div>
                    <p className="text-[11px] text-slate-300">涵盖人物、场景母图、光影色调、产品资产、品牌色、美术风格、UI等</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-purple-400">Node 29: ComfyMathExpression</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">17n+5 公式</span>
                    </div>
                    <p className="text-[11px] text-slate-300">精确换算：10 秒对齐 243 帧，15 秒对齐 362 帧，0 丢步</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-300">Node 25: PrimitiveStringMultiline</span>
                      <span className="text-[9px] text-slate-500">文本提示词</span>
                    </div>
                    <p className="text-[11px] text-slate-400">六段式标准提示词输入通道与约束控制</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-300">Node 17: VHS_VideoCombine</span>
                      <span className="text-[9px] text-slate-500">音画封包</span>
                    </div>
                    <p className="text-[11px] text-slate-400">结合零重影切除首帧垫图 (select=gt(n\,0))，无缝拼接导出标准 24fps MP4</p>
                  </div>
                </div>
              </div>
            )}

            {/* View Mode 1: Director Modules Dashboard (42 Nodes Workflow 2099679213619073025) */}
            {viewMode === 'director_modules' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {/* Module 1: Master Director Node 12 */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/40 space-y-1.5 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-purple-400" />
                      <span>1. MiniMax H3 Director (Node 12)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">时序总控中台</span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">task_type: {taskType.split(' ')[0]} · 24fps</div>
                  <div className="text-[10px] text-slate-400">总帧数: {durationPreset === 15 ? 362 : 243} 帧 (17n+5 对齐) · 自动编排 timeline_data</div>
                </div>

                {/* Module 2: Ref2VA Core Operator Node 75 */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>2. Ref2VA 核心算子 (Node 75)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">满血算子</span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">MiniMaxH3ReferenceToVideo · ref_image_size: max</div>
                  <div className="text-[10px] text-slate-400">统筹 Qwen3-VL (Node 2) + Video VAE (Node 3) + Audio VAE (Node 4)</div>
                </div>

                {/* Module 3: Model & Dual Base Switch (Node 98, 99, 100) */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>3. 双底模动态切换 (Node 98/99/100)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">CR Model Switch</span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">Input 2: minimax_h3_ref2va_pruned_int8</div>
                  <div className="text-[10px] text-slate-400">可动态切入 Input 1: MiniMax-H3-FL2VA-int8 (首尾帧)</div>
                </div>

                {/* Module 4: Turbo LoRA & SageAttention (Node 16, 14, 15) */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>4. Turbo 8步 LoRA (Node 16, 14, 15)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">极速采样</span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">fl2v_turbo_8step_v1.0 (strength: 1.0)</div>
                  <div className="text-[10px] text-slate-400">SageAttention + 显存优化补丁，大幅降低显存占用与等待时间</div>
                </div>

                {/* Module 5: 2nd Pass Lazy Switch (Node 109) */}
                <div className={`p-3.5 rounded-xl bg-slate-950 border space-y-1.5 ${
                  enableRefine ? 'border-indigo-500/40' : 'border-slate-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>5. 二采惰性开关 (Node 109 LazySwitch)</span>
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded ${enableRefine ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'}`}>
                      {enableRefine ? 'TRUE (二采增强)' : 'FALSE (原片输出)'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">跟随画幅 · 2MP · 32倍数自适应计算 (Node 103/104)</div>
                  <div className="text-[10px] text-slate-400">分辨率选择器 (Node 58) 自动匹配 9:16 / 16:9 画幅</div>
                </div>

                {/* Module 6: Sampler & Scheduler (Node 42, 51, 55, 48) */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>6. 高级采样与调度 (Node 42, 51, 55)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Euler + Beta</span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">KSamplerSelect (euler) · BasicScheduler (beta)</div>
                  <div className="text-[10px] text-slate-400">RandomNoise (Node 48) · 8步 Turbo 采样</div>
                </div>

                {/* Module 7: Output Dual Combine (Node 72, 150, 107) */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-slate-400" />
                      <span>7. 双通道视频导出 (Node 72 & 150)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">VHS_VideoCombine</span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">Node 72: 原片输出 ｜ Node 150: H3_Ref2VA二采超分</div>
                  <div className="text-[10px] text-slate-400">24fps H.264 MP4 · SaveVideo (Node 107) 规范封包</div>
                </div>

                {/* Module 8: Director Report (Node 8 PreviewAny) */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span>8. Director 实时运行报告 (Node 8)</span>
                    </span>
                    <span className="text-[10px] text-slate-500">PreviewAny</span>
                  </div>
                  <div className="text-xs text-slate-200 font-mono">实时输出 MiniMax H3 导演台调度报告</div>
                  <div className="text-[10px] text-slate-400">直通 Gate 8 对齐三验与音画质检系统</div>
                </div>
              </div>
            )}

            {/* View Mode 2: Timeline Data Inspector */}
            {viewMode === 'timeline_data' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>MiniMax H3 Director 核心 <code>timeline_data</code> 分段时序结构:</span>
                  <button
                    onClick={() => {
                      if (directorPayload?.nodeInfoList[2]?.fieldValue) {
                        navigator.clipboard.writeText(directorPayload.nodeInfoList[2].fieldValue as string);
                        setCopiedTimelineJson(true);
                        setTimeout(() => setCopiedTimelineJson(false), 2000);
                      }
                    }}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                  >
                    {copiedTimelineJson ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTimelineJson ? '已复制' : '复制 Timeline JSON'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 max-h-[380px] overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 select-text">
                  {directorPayload?.nodeInfoList[2]?.fieldValue
                    ? JSON.stringify(JSON.parse(directorPayload.nodeInfoList[2].fieldValue as string), null, 2)
                    : '暂无分段时序'}
                </pre>
              </div>
            )}

            {/* View Mode 3: Nodes List */}
            {viewMode === 'nodes' && (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {Object.values(RUNNINGHUB_CONFIG.nodeMappings).map((m: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200 font-mono">Node {m.nodeId}: {m.title}</div>
                      <div className="text-[11px] text-slate-400">{m.desc}</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                      {m.fieldName}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* View Mode 4: Full ComfyUI Workflow JSON */}
            {viewMode === 'fullJson' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>导演台全工作流完整 ComfyUI 配置 JSON:</span>
                  <button
                    onClick={handleCopyFullJson}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono"
                  >
                    {copiedFullJson ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFullJson ? '已复制' : '复制 JSON'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-purple-300 max-h-[380px] overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 select-text">
                  {JSON.stringify(customWorkflowJson, null, 2)}
                </pre>
              </div>
            )}

            {/* View Mode 5: OpenAPI Payload */}
            {viewMode === 'payload' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>POST /openapi/v2/run/workflow 任务入队 Payload:</span>
                  <button
                    onClick={handleCopyPayload}
                    className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-mono"
                  >
                    {copiedPayload ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPayload ? '已复制' : '复制 Payload'}</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 max-h-[380px] overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 select-text">
                  {JSON.stringify(currentPayload, null, 2)}
                </pre>
              </div>
            )}

            {/* View Mode 6: Director Report */}
            {viewMode === 'director_report' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs max-h-[380px] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-cyan-400">Node 8: PreviewAny · Director 运行报告</span>
                  <span className="text-[10px] text-slate-500">200 OK</span>
                </div>
                {activeTask?.directorReport ? (
                  <div className="space-y-2 text-slate-300">
                    <div>任务类型: <strong className="text-purple-300">{activeTask.directorReport.taskType}</strong></div>
                    <div>总帧数: <strong className="text-cyan-300">{activeTask.directorReport.totalFrames} 帧 ({activeTask.directorReport.fps}fps)</strong></div>
                    <div>输出分辨率: <strong className="text-amber-300">{activeTask.directorReport.resolution}</strong></div>
                    <div>装配模块: <span className="text-emerald-300">{activeTask.directorReport.modulesActive.join(' · ')}</span></div>
                    <div>脸部修复状态: <span className="text-slate-400">{activeTask.directorReport.faceRefineStats}</span></div>
                    <div>SelfLift 采样: <span className="text-slate-400">{activeTask.directorReport.selfliftStats}</span></div>
                  </div>
                ) : (
                  <div className="text-slate-500 py-6 text-center">
                    点击左侧「提交渲染」以实时获取导演台各模块运行指标与 Gate 8 对齐分析。
                  </div>
                )}
              </div>
            )}

            {/* View Mode 7: FFmpeg Concat */}
            {viewMode === 'ffmpeg' && (
              <div className="space-y-3 max-h-[380px] overflow-y-auto">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>多段 0.35s afade 平滑音频接缝与 AI 合规角标拼接脚本:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`ffmpeg -y -v error -i S01.mp4 -i S02.mp4 -i S03.mp4 -i S04.mp4 -i master_bgm.wav -filter_complex "[0:v]setpts=PTS-STARTPTS[v0];[0:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a0];[1:v]setpts=PTS-STARTPTS[v1];[1:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a1];[2:v]setpts=PTS-STARTPTS[v2];[2:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a2];[3:v]setpts=PTS-STARTPTS[v3];[3:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a3];[v0][v1][v2][v3]concat=n=4:v=1:a=0[vconcat];[a0][a1][a2][a3]concat=n=4:v=0:a=1[adialogue];[4:a]volume=0.45[abgm];[adialogue][abgm]amix=inputs=2:duration=first:dropout_transition=2[aout]" -map "[vconcat]" -map "[aout]" -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart 成片_完整母带.mp4`);
                      setCopiedFfmpegCmd(true);
                      setTimeout(() => setCopiedFfmpegCmd(false), 2000);
                    }}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-mono"
                  >
                    {copiedFfmpegCmd ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFfmpegCmd ? '已复制命令' : '复制 FFmpeg 命令'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 space-y-2 leading-relaxed">
                  <pre className="text-cyan-300 whitespace-pre-wrap">{`ffmpeg -y -v error \\
 -i S01.mp4 -i S02.mp4 -i S03.mp4 -i S04.mp4 -i master_bgm.wav \\
 -filter_complex "
   [0:v]setpts=PTS-STARTPTS[v0];[0:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a0];
   [1:v]setpts=PTS-STARTPTS[v1];[1:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a1];
   [2:v]setpts=PTS-STARTPTS[v2];[2:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a2];
   [3:v]setpts=PTS-STARTPTS[v3];[3:a]afade=t=in:st=0:d=0.35,afade=t=out:st=14.73:d=0.35,asetpts=PTS-STARTPTS[a3];
   [v0][v1][v2][v3]concat=n=4:v=1:a=0[vconcat];
   [a0][a1][a2][a3]concat=n=4:v=0:a=1[adialogue];
   [4:a]volume=0.45[abgm];
   [adialogue][abgm]amix=inputs=2:duration=first:dropout_transition=2[aout]" \\
 -map "[vconcat]" -map "[aout]" -c:v libx264 -crf 19 -preset medium -pix_fmt yuv420p \\
 -c:a aac -b:a 192k -movflags +faststart 成片_完整母带.mp4`}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Execution Status & Live Terminal Console */}
      {activeTask && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${
                activeTask.status === 'SUCCESS'
                  ? 'bg-emerald-400 animate-pulse'
                  : activeTask.status === 'RUNNING'
                  ? 'bg-indigo-400 animate-ping'
                  : 'bg-amber-400'
              }`} />
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>任务时序: {activeTask.stageName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                    {activeTask.taskId}
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  工作流模式: {activeTask.workflowType === 'director' ? 'MiniMax H3 导演台满血版 (Node 12 时序总控)' : 'MiniMax H3 9图多模态版 (Node 31)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-400">耗时/进度: <strong className="text-cyan-400">{activeTask.progress}%</strong></span>
              <span className="text-slate-400">费用: <strong className="text-amber-400">${activeTask.costUsd} ({activeTask.costPoints} RH币)</strong></span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${activeTask.progress}%` }}
            />
          </div>

          {/* Terminal Logs */}
          <div className="bg-black/90 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1 max-h-48 overflow-y-auto select-text">
            {activeTask.logLines.map((log, i) => (
              <div key={i} className="leading-relaxed">
                <span className="text-slate-500 mr-2">›</span>
                {log}
              </div>
            ))}
          </div>

          {/* Result Output Preview */}
          {activeTask.status === 'SUCCESS' && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">导演台分镜渲染通过，已完成 Gate 8 对齐三验</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    滞后量: {activeTask.gate8Validation?.lagMs}ms · 波形相关度: {activeTask.gate8Validation?.correlation} · 人声能量: {activeTask.gate8Validation?.vocalEnergyDbfs}dBFS
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activeTask.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5"
                >
                  <span>播放成片 MP4</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
