/**
 * 动画预览 composable
 * 
 * 模拟 grid-canvas 的笔画动画效果：
 * - 按笔顺逐笔显示轮廓
 * - 使用 SVG stroke-dasharray + stroke-dashoffset 动画
 * - 播放/暂停/重播控制
 */
import { ref, computed } from 'vue'
import { useStrokeData } from './useStrokeData'
import { useOutlineGeneration } from './useOutlineGeneration'

// 动画状态
const isPlaying = ref(false)
const currentAnimStrokeIndex = ref(-1) // 当前动画播放到的笔画索引
const animationSpeed = ref(800) // 每笔动画时长（ms）

export function useAnimationPreview() {
  const { strokes, currentStrokeIndex } = useStrokeData()
  const { outlineData } = useOutlineGeneration()

  // 是否正在播放
  const isAnimating = computed(() => isPlaying.value)

  // 当前应该显示的笔画（动画播放到的位置）
  const visibleStrokeIndex = computed(() => {
    if (!isPlaying.value) return -1
    return currentAnimStrokeIndex.value
  })

  // 动画定时器
  let playTimer = null
  let resolveWait = null

  // 播放动画
  const play = async () => {
    if (strokes.value.length === 0) return
    if (isPlaying.value) return

    isPlaying.value = true
    currentAnimStrokeIndex.value = -1

    // 逐笔播放
    for (let i = 0; i < strokes.value.length; i++) {
      if (!isPlaying.value) break // 被暂停

      currentAnimStrokeIndex.value = i

      // 等待动画时长
      await wait(animationSpeed.value)
    }

    // 播放完成
    if (isPlaying.value) {
      // 保持最后一笔显示 500ms
      await wait(500)
    }

    stop()
  }

  // 暂停
  const pause = () => {
    isPlaying.value = false
    if (playTimer) {
      clearTimeout(playTimer)
      playTimer = null
    }
  }

  // 停止
  const stop = () => {
    isPlaying.value = false
    currentAnimStrokeIndex.value = -1
    if (playTimer) {
      clearTimeout(playTimer)
      playTimer = null
    }
  }

  // 重播
  const replay = () => {
    stop()
    setTimeout(() => play(), 100)
  }

  // 设置动画速度
  const setSpeed = (ms) => {
    animationSpeed.value = Math.max(200, Math.min(2000, ms))
  }

  // 等待指定毫秒（可被中断）
  function wait(ms) {
    return new Promise((resolve) => {
      resolveWait = resolve
      playTimer = setTimeout(() => {
        resolve()
        resolveWait = null
      }, ms)
    })
  }

  return {
    // 状态
    isPlaying,
    isAnimating,
    currentAnimStrokeIndex,
    visibleStrokeIndex,
    animationSpeed,

    // 操作
    play,
    pause,
    stop,
    replay,
    setSpeed
  }
}
