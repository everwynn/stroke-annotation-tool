/**
 * 笔画数据管理 composable
 * 
 * 管理标注过程中的笔画数据：
 * - 笔画列表（每个笔画包含中线点序列）
 * - 当前编辑的笔画
 * - 控制点的增删改
 */
import { ref, computed } from 'vue'

// 全局状态（单例模式，所有组件共享）
const strokes = ref([]) // 所有笔画数据
const currentStrokeIndex = ref(0) // 当前编辑的笔画索引
const selectedPointIndex = ref(-1) // 当前选中的控制点索引

/**
 * 笔画数据结构：
 * {
 *   medianPoints: [{ x: number, y: number, width?: number }, ...], // 中线控制点（width 为逐点宽度，可选）
 *   outlinePath: string, // 轮廓 SVG 路径
 *   completed: boolean // 是否完成
 * }
 */

export function useStrokeData() {
  // 当前笔画
  const currentStroke = computed(() => {
    if (strokes.value.length === 0) return null
    return strokes.value[currentStrokeIndex.value] || null
  })

  // 当前笔画的中线点
  const currentMedianPoints = computed(() => {
    return currentStroke.value?.medianPoints || []
  })

  // 添加新笔画
  const addStroke = () => {
    strokes.value.push({
      medianPoints: [],
      outlinePath: '',
      completed: false
    })
    currentStrokeIndex.value = strokes.value.length - 1
    selectedPointIndex.value = -1
  }

  // 切换到指定笔画
  const switchStroke = (index) => {
    if (index >= 0 && index < strokes.value.length) {
      currentStrokeIndex.value = index
      selectedPointIndex.value = -1
    }
  }

  // 切换到上一笔
  const prevStroke = () => {
    if (currentStrokeIndex.value > 0) {
      switchStroke(currentStrokeIndex.value - 1)
    }
  }

  // 切换到下一笔
  const nextStroke = () => {
    if (currentStrokeIndex.value < strokes.value.length - 1) {
      switchStroke(currentStrokeIndex.value + 1)
    }
  }

  // 删除当前笔画
  const deleteStroke = () => {
    if (strokes.value.length > 0) {
      strokes.value.splice(currentStrokeIndex.value, 1)
      if (currentStrokeIndex.value >= strokes.value.length) {
        currentStrokeIndex.value = strokes.value.length - 1
      }
      selectedPointIndex.value = -1
    }
  }

  // 添加中线控制点
  const addMedianPoint = (x, y) => {
    if (!currentStroke.value) {
      addStroke()
    }
    strokes.value[currentStrokeIndex.value].medianPoints.push({ x, y })
  }

  // 更新中线控制点位置
  const updateMedianPoint = (index, x, y) => {
    if (currentStroke.value && index >= 0 && index < currentStroke.value.medianPoints.length) {
      const point = currentStroke.value.medianPoints[index]
      currentStroke.value.medianPoints[index] = { ...point, x, y }
    }
  }

  // 更新中线控制点宽度（逐点宽度）
  const updateMedianPointWidth = (index, width) => {
    if (currentStroke.value && index >= 0 && index < currentStroke.value.medianPoints.length) {
      const point = currentStroke.value.medianPoints[index]
      currentStroke.value.medianPoints[index] = { ...point, width }
    }
  }

  // 获取中线控制点宽度（未设置时返回 null，表示使用全局宽度）
  const getMedianPointWidth = (index) => {
    if (currentStroke.value && index >= 0 && index < currentStroke.value.medianPoints.length) {
      return currentStroke.value.medianPoints[index].width ?? null
    }
    return null
  }

  // 删除中线控制点
  const deleteMedianPoint = (index) => {
    if (currentStroke.value && index >= 0 && index < currentStroke.value.medianPoints.length) {
      currentStroke.value.medianPoints.splice(index, 1)
      if (selectedPointIndex.value >= currentStroke.value.medianPoints.length) {
        selectedPointIndex.value = currentStroke.value.medianPoints.length - 1
      }
    }
  }

  // 选中控制点
  const selectPoint = (index) => {
    selectedPointIndex.value = index
  }

  // 取消选中
  const clearSelection = () => {
    selectedPointIndex.value = -1
  }

  // 清空所有数据
  const clearAll = () => {
    strokes.value = []
    currentStrokeIndex.value = 0
    selectedPointIndex.value = -1
  }

  // 导出数据（阶段 4 完善）
  const exportData = computed(() => {
    return {
      strokes: strokes.value.map(stroke => ({
        medianPoints: stroke.medianPoints,
        outlinePath: stroke.outlinePath
      }))
    }
  })

  return {
    // 状态
    strokes,
    currentStrokeIndex,
    selectedPointIndex,
    currentStroke,
    currentMedianPoints,
    
    // 笔画操作
    addStroke,
    switchStroke,
    prevStroke,
    nextStroke,
    deleteStroke,
    
    // 控制点操作
    addMedianPoint,
    updateMedianPoint,
    updateMedianPointWidth,
    getMedianPointWidth,
    deleteMedianPoint,
    selectPoint,
    clearSelection,
    
    // 其他
    clearAll,
    exportData
  }
}
