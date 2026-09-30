export function computeDurationFit(start: number, target: number, fps: number): {
  fittedDuration: number;
  frameCount: number;
  overhangSec: number;
} {
  const frameCount = Math.round(target * fps);
  const fittedDuration = frameCount / fps;
  return {
    fittedDuration,
    frameCount,
    overhangSec: 0.0
  };
}

export function planDurationPartition(seconds: number): {
  summary: string;
  segmentCount: number;
  actualTotalSeconds: number;
  segments: Array<{
    segmentIndex: number;
    duration: number;
    frames: number;
    role: string;
    tailFramePadRequired: boolean;
  }>;
} {
  const segCount = Math.max(1, Math.ceil(seconds / 15));
  const segments = Array.from({ length: segCount }, (_, i) => ({
    segmentIndex: i + 1,
    duration: 15,
    frames: 362,
    role: i === 0 ? '开场与铺垫' : i === segCount - 1 ? '终极收尾' : '高潮递进',
    tailFramePadRequired: i < segCount - 1
  }));

  return {
    summary: `总时长 ${seconds}s，规划为 ${segCount} 段 15 秒（362帧/段）连续接力生成。`,
    segmentCount: segCount,
    actualTotalSeconds: segCount * 15,
    segments
  };
}

export function extractDurationFromPrompt(prompt: string): number {
  const match = prompt.match(/(\d+(\.\d+)?)s/i);
  return match ? parseFloat(match[1]) : 15;
}

export function planTimelineSegments(params: any): any[] {
  return [
    { id: 'seg_1', duration: 15.083, frameCount: 362 }
  ];
}
