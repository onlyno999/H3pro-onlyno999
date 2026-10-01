# 双参考接力铁律（防多段脸型跑偏）

## 问题

v2.5 工作流（`2086280720103858177`）多段接力时，第 2 段起如果只用上一段尾帧做 Node 18 的参考图，人物脸型会逐段跑偏。

**原因**：尾帧里的人脸通常很小、角度偏，模型每段都按上一段的"残脸"重绘，误差累积，3-4 段后近景脸型就对不上定妆照了。

**实测翻车**：2026-10-01 刁哥悬崖 36 秒片，第 4 段、第 6 段近景脸型跑偏，被迫重跑。

## 解法：双参考，各司其职

第 2 段起**必须**同时注入两张参考图：

| 节点 | 槽位 | 放什么 | 作用 |
|------|------|--------|------|
| Node 18 | ref_image_0 | 人物定妆照（全片固定同一张） | 锁脸：面部特征、服装穿搭 |
| Node 23 | ref_image_1 | 上一段尾帧 | 锁场景/机位：环境延续、镜头衔接 |

## 规则

1. **缺一不可**：两个都得放，少一个就是违规。
2. **Node 18 全片固定**：从第 1 段到最后一段，Node 18 永远是同一张定妆照，不许换。
3. **Node 23 逐段更新**：每段用上一段的尾帧，保证场景和机位连续。
4. **远景豁免**：人物成小点、看不清脸的远景段，可以只用尾帧（省一张 reference）；凡近景/中景露脸的段，必须双参考。
5. **提示词配合**：正向写"脸型严格按人物参考图"，场景写"按场景参考图延续"，让模型知道哪张管哪块。

## 反模式

- ❌ 只用尾帧做 Node 18（脸越跑越偏）
- ❌ 只用定妆照不用 Node 23（场景/机位断裂）
- ❌ 每段换不同的定妆照（自己打自己脸）

## 派发示例

```python
nl=[
    {"nodeId":"25","fieldName":"value","fieldValue":prompt},  # 提示词
    {"nodeId":"28","fieldName":"value","fieldValue":6},        # 时长秒数
    {"nodeId":"26","fieldName":"aspect_ratio","fieldValue":"9:16 (Portrait Widescreen)"},
    {"nodeId":"5","fieldName":"noise_seed","fieldValue":random.randint(1,999999)},
    {"nodeId":"18","fieldName":"image","fieldValue":CHAR_FN},  # 定妆照：锁脸，全片同一张
    {"nodeId":"23","fieldName":"image","fieldValue":TAIL_FN},  # 上一段尾帧：锁场景，逐段更新
    {"nodeId":"38","fieldName":"audio","fieldValue":SIL_FN},   # 静音：关音频通道
    {"nodeId":"67","fieldName":"audio","fieldValue":SIL_FN},
    {"nodeId":"68","fieldName":"audio","fieldValue":SIL_FN},
]
```
