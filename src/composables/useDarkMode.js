/**
 * useDarkMode - 深色模式 composable
 * 
 * 功能：
 * - 深色/亮色模式切换
 * - View Transition API 多种切换动画（Chrome 111+）
 *   - circle: 圆形扩散（从点击位置）
 *   - wave: 波浪展开（正弦波边缘）
 *   - wipe: 对角擦除（矩形推进）
 *   - fade: 淡入淡出
 * - 不支持 View Transition 时降级为直接切换
 * - localStorage 持久化用户偏好（模式 + 动画速度 + 动画样式）
 * - 初始化时自动恢复上次偏好
 * - 可自定义动画时长和动画样式
 */
import { ref } from 'vue'

// 全局状态（单例）
const isDark = ref(false)

// 动画时长（毫秒），默认 600ms
const animationDuration = ref(600)

// 动画样式：'circle' | 'wave' | 'wipe' | 'fade'
const animationStyle = ref('circle')

// 是否已初始化
let initialized = false

/**
 * 应用深色模式状态到 DOM
 */
function applyDarkMode(dark) {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

/**
 * 初始化深色模式（从 localStorage 恢复偏好）
 */
function initDarkMode() {
  if (initialized) return
  initialized = true

  const savedDark = localStorage.getItem('dark-mode')
  if (savedDark === '1') {
    isDark.value = true
    applyDarkMode(true)
  }

  const savedDuration = localStorage.getItem('dark-mode-duration')
  if (savedDuration) {
    const ms = parseInt(savedDuration, 10)
    if (ms >= 200 && ms <= 2000) {
      animationDuration.value = ms
    }
  }

  const savedStyle = localStorage.getItem('dark-mode-style')
  if (savedStyle && ['circle', 'wave', 'wipe', 'fade'].includes(savedStyle)) {
    animationStyle.value = savedStyle
  }
}

// ============================================
// 动画样式实现
// ============================================

/**
 * 生成波浪多边形的 clip-path 字符串
 * 
 * @param {number} progress - 展开进度 0~1（0=完全遮盖，1=完全展开）
 * @param {number} amplitude - 波浪振幅（百分比）
 * @param {number} frequency - 波浪频率（完整周期数）
 * @returns {string} clip-path: polygon(...) 字符串
 */
function generateWavePolygon(progress, amplitude = 6, frequency = 3) {
  const points = []
  const steps = 24

  for (let i = 0; i <= steps; i++) {
    const xPercent = (i / steps) * 100
    // 正弦波 Y 偏移
    const waveY = Math.sin((i / steps) * Math.PI * 2 * frequency) * amplitude
    // progress 控制展开位置（从顶部向下展开）
    // 0 = 全部在底部(100%)，1 = 全部在顶部(0%)
    const baseY = (1 - progress) * 100
    const yTop = baseY + waveY * progress
    points.push(`${xPercent.toFixed(1)}% ${Math.max(0, Math.min(100, yTop)).toFixed(1)}%`)
  }

  // 闭合多边形：右下角 → 左下角
  points.push('100% 100%', '0% 100%')
  return `polygon(${points.join(', ')})`
}

/**
 * 获取动画配置
 * 返回 { keyframes, options } 供 document.documentElement.animate() 使用
 * 
 * @param {string} style - 动画样式名称
 * @param {number} x - 点击 X 坐标
 * @param {number} y - 点击 Y 坐标
 * @param {number} endRadius - 圆形扩散的最大半径
 * @param {boolean} isDarkNow - 切换后是否为深色
 * @returns {{ keyframes: Object, options: Object }}
 */
function getAnimationConfig(style, x, y, endRadius, isDarkNow) {
  const duration = animationDuration.value
  const easing = 'ease-in-out'

  switch (style) {
    case 'wave': {
      // 波浪展开：polygon 从底部展开到顶部，边缘呈正弦波
      const from = generateWavePolygon(0)
      const to = generateWavePolygon(1)
      return {
        keyframes: {
          clipPath: isDarkNow ? [from, to] : [to, from],
        },
        options: {
          duration,
          easing,
          pseudoElement: isDarkNow
            ? '::view-transition-new(root)'
            : '::view-transition-old(root)',
        },
      }
    }

    case 'wipe': {
      // 对角擦除：inset 从右向左推进
      const from = 'inset(0 100% 0 0)'
      const to = 'inset(0 0 0 0)'
      return {
        keyframes: {
          clipPath: isDarkNow ? [from, to] : [to, from],
        },
        options: {
          duration,
          easing,
          pseudoElement: isDarkNow
            ? '::view-transition-new(root)'
            : '::view-transition-old(root)',
        },
      }
    }

    case 'fade': {
      // 淡入淡出：opacity 渐变
      return {
        keyframes: {
          opacity: [0, 1],
        },
        options: {
          duration,
          easing,
          pseudoElement: '::view-transition-new(root)',
        },
      }
    }

    case 'circle':
    default: {
      // 圆形扩散：从点击位置扩散/收缩
      const from = `circle(0px at ${x}px ${y}px)`
      const to = `circle(${endRadius}px at ${x}px ${y}px)`
      return {
        keyframes: {
          clipPath: isDarkNow ? [from, to] : [to, from],
        },
        options: {
          duration,
          easing,
          pseudoElement: isDarkNow
            ? '::view-transition-new(root)'
            : '::view-transition-old(root)',
        },
      }
    }
  }
}

// ============================================
// 公共 API
// ============================================

/**
 * 切换深色模式（带 View Transition 动画）
 * @param {MouseEvent} event - 点击事件
 */
function toggleDark(event) {
  if (!event) {
    isDark.value = !isDark.value
    applyDarkMode(isDark.value)
    localStorage.setItem('dark-mode', isDark.value ? '1' : '0')
    return
  }

  const { clientX: x, clientY: y } = event

  const endRadius = Math.hypot(
    Math.max(x, innerWidth - x),
    Math.max(y, innerHeight - y)
  )

  // 降级处理
  if (!document.startViewTransition) {
    isDark.value = !isDark.value
    applyDarkMode(isDark.value)
    localStorage.setItem('dark-mode', isDark.value ? '1' : '0')
    return
  }

  const transition = document.startViewTransition(() => {
    isDark.value = !isDark.value
    applyDarkMode(isDark.value)
    localStorage.setItem('dark-mode', isDark.value ? '1' : '0')
  })

  transition.ready.then(() => {
    const { keyframes, options } = getAnimationConfig(
      animationStyle.value,
      x, y,
      endRadius,
      isDark.value
    )

    document.documentElement.animate(keyframes, options)
  })
}

/**
 * 设置动画时长
 * @param {number} ms - 毫秒数（200-2000）
 */
function setAnimationDuration(ms) {
  const clamped = Math.max(200, Math.min(2000, ms))
  animationDuration.value = clamped
  localStorage.setItem('dark-mode-duration', String(clamped))
}

/**
 * 设置动画样式
 * @param {string} style - 'circle' | 'wave' | 'wipe' | 'fade'
 */
function setAnimationStyle(style) {
  if (['circle', 'wave', 'wipe', 'fade'].includes(style)) {
    animationStyle.value = style
    localStorage.setItem('dark-mode-style', style)
  }
}

export function useDarkMode() {
  if (!initialized) {
    initDarkMode()
  }

  return {
    isDark,
    animationDuration,
    animationStyle,
    toggleDark,
    setAnimationDuration,
    setAnimationStyle,
    initDarkMode,
  }
}
