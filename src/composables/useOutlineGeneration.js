/**
 * 轮廓生成 composable
 * 
 * 管理轮廓数据和生成逻辑：
 * - 根据中线自动生成轮廓
 * - 支持手动微调轮廓控制点
 * - 存储轮廓的左右点序列和路径
 */
import { ref, computed, watch } from 'vue'
import { useStrokeData } from './useStrokeData'
import { generateOffsetOutline, getOutlineControlPoints } from '@/utils/outline'

// 笔画宽度（可调整）
const strokeWidth = ref(80)

// 轮廓数据（与笔画一一对应）
// 结构：[{ left: [], right: [], path: '', manualOffset: { left: [], right: [] } }]
const outlineData = ref([])

// 是否显示轮廓控制点
const showOutlineControlPoints = ref(false)

// 是否正在拖拽中线点（拖拽期间暂停自动重新生成轮廓）
const isDraggingMedian = ref(false)

export function useOutlineGeneration() {
  const { strokes, currentStrokeIndex, currentMedianPoints, updateMedianPointWidth, getMedianPointWidth } = useStrokeData()

  // 当前笔画的轮廓数据
  const currentOutline = computed(() => {
    return outlineData.value[currentStrokeIndex.value] || null
  })

  // 当前轮廓的路径
  const currentOutlinePath = computed(() => {
    return currentOutline.value?.path || ''
  })

  // 当前轮廓的控制点
  const currentOutlineControlPoints = computed(() => {
    if (!currentOutline.value) return []
    return getOutlineControlPoints(
      currentOutline.value.left,
      currentOutline.value.right
    )
  })

  // 根据中线自动生成轮廓
  const generateOutline = () => {
    const points = currentMedianPoints.value
    if (points.length === 0) return

    const result = generateOffsetOutline(points, strokeWidth.value)

    // 确保 outlineData 数组足够长
    while (outlineData.value.length <= currentStrokeIndex.value) {
      outlineData.value.push({
        left: [],
        right: [],
        path: '',
        manualOffset: { left: [], right: [] }
      })
    }

    // 保存自动生成的轮廓
    outlineData.value[currentStrokeIndex.value] = {
      left: result.left,
      right: result.right,
      path: result.path,
      manualOffset: {
        left: result.left.map(() => ({ x: 0, y: 0 })),
        right: result.right.map(() => ({ x: 0, y: 0 }))
      }
    }
  }

  // 更新轮廓控制点位置（手动微调）
  const updateOutlinePoint = (side, index, x, y) => {
    const outline = outlineData.value[currentStrokeIndex.value]
    if (!outline) return

    if (side === 'left' && index < outline.left.length) {
      // 计算手动偏移量
      const autoX = outline.left[index].x
      const autoY = outline.left[index].y
      outline.manualOffset.left[index] = { x: x - autoX, y: y - autoY }
      // 更新实际位置
      outline.left[index] = { x, y }
    } else if (side === 'right' && index < outline.right.length) {
      const autoX = outline.right[index].x
      const autoY = outline.right[index].y
      outline.manualOffset.right[index] = { x: x - autoX, y: y - autoY }
      outline.right[index] = { x, y }
    }

    // 重新生成路径
    regeneratePath()
  }

  // 重新生成路径（在手动微调后调用）
  const regeneratePath = () => {
    const outline = outlineData.value[currentStrokeIndex.value]
    if (!outline) return

    // 重新生成封闭路径
    const path = generatePathFromPoints(outline.left, outline.right)
    outline.path = path
  }

  // 从轮廓点生成路径
  function generatePathFromPoints(leftPoints, rightPoints) {
    if (leftPoints.length === 0 || rightPoints.length === 0) return ''

    let path = ''

    // 起点：左侧第一个点
    path += `M ${leftPoints[0].x} ${leftPoints[0].y}`

    // 左侧：从左到右
    if (leftPoints.length > 2) {
      for (let i = 1; i < leftPoints.length - 1; i++) {
        const mid = {
          x: (leftPoints[i].x + leftPoints[i + 1].x) / 2,
          y: (leftPoints[i].y + leftPoints[i + 1].y) / 2
        }
        path += ` Q ${leftPoints[i].x} ${leftPoints[i].y} ${mid.x} ${mid.y}`
      }
      path += ` L ${leftPoints[leftPoints.length - 1].x} ${leftPoints[leftPoints.length - 1].y}`
    } else if (leftPoints.length === 2) {
      path += ` L ${leftPoints[1].x} ${leftPoints[1].y}`
    }

    // 连接到右侧最后一个点
    path += ` L ${rightPoints[rightPoints.length - 1].x} ${rightPoints[rightPoints.length - 1].y}`

    // 右侧：从右到左
    if (rightPoints.length > 2) {
      for (let i = rightPoints.length - 2; i > 0; i--) {
        const mid = {
          x: (rightPoints[i].x + rightPoints[i - 1].x) / 2,
          y: (rightPoints[i].y + rightPoints[i - 1].y) / 2
        }
        path += ` Q ${rightPoints[i].x} ${rightPoints[i].y} ${mid.x} ${mid.y}`
      }
      path += ` L ${rightPoints[0].x} ${rightPoints[0].y}`
    } else if (rightPoints.length === 2) {
      path += ` L ${rightPoints[0].x} ${rightPoints[0].y}`
    }

    path += ' Z'
    return path
  }

  // 监听中线变化，自动生成轮廓（拖拽期间暂停）
  watch(
    () => currentMedianPoints.value,
    (newPoints) => {
      if (newPoints.length > 0 && !isDraggingMedian.value) {
        generateOutline()
      }
    },
    { deep: true }
  )

  // 监听笔画宽度变化，重新生成所有轮廓
  watch(
    () => strokeWidth.value,
    () => {
      if (currentMedianPoints.value.length > 0) {
        generateOutline()
      }
    }
  )

  // 监听笔画切换，确保轮廓数据存在
  watch(
    () => currentStrokeIndex.value,
    () => {
      if (currentMedianPoints.value.length > 0 && !outlineData.value[currentStrokeIndex.value]) {
        generateOutline()
      }
    }
  )

  // 重置轮廓
  const resetOutline = () => {
    generateOutline()
  }

  // 设置笔画宽度
  const setStrokeWidth = (width) => {
    strokeWidth.value = width
    generateOutline()
  }

  // 标记拖拽开始/结束
  const setDraggingMedian = (dragging) => {
    isDraggingMedian.value = dragging
    // 拖拽结束后重新生成轮廓
    if (!dragging && currentMedianPoints.value.length > 0) {
      generateOutline()
    }
  }

  return {
    // 状态
    strokeWidth,
    outlineData,
    showOutlineControlPoints,
    currentOutline,
    currentOutlinePath,
    currentOutlineControlPoints,

    // 操作
    generateOutline,
    updateOutlinePoint,
    resetOutline,
    setStrokeWidth,
    setDraggingMedian,
    
    // 逐点宽度
    updateMedianPointWidth,
    getMedianPointWidth
  }
}
