<script setup>
/**
 * ControlPointLayer.vue - 控制点手柄层
 * 
 * 功能：
 * - 渲染中线控制点圆形手柄（蓝色）
 * - 渲染轮廓控制点手柄（左侧红色/右侧绿色）
 * - 支持拖拽移动控制点
 * - 支持选中状态（高亮显示）
 * - 支持右键删除控制点
 */
import { ref, computed } from 'vue'
import { useStrokeData } from '@/composables/useStrokeData'
import { useOutlineGeneration } from '@/composables/useOutlineGeneration'

const { 
  currentMedianPoints, 
  selectedPointIndex,
  updateMedianPoint, 
  deleteMedianPoint,
  selectPoint,
  clearSelection
} = useStrokeData()

const { 
  showOutlineControlPoints,
  currentOutlineControlPoints,
  updateOutlinePoint,
  setDraggingMedian
} = useOutlineGeneration()

// 拖拽状态
const isDragging = ref(false)
const dragType = ref('') // 'median' | 'outline-left' | 'outline-right'
const dragIndex = ref(-1)
const dragSide = ref('') // 'left' | 'right'

// 控制点半径
const POINT_RADIUS = 8
const SELECTED_RADIUS = 10
const OUTLINE_POINT_RADIUS = 6

// 开始拖拽中线控制点
const startMedianDrag = (e, index) => {
  e.stopPropagation()
  e.preventDefault()
  isDragging.value = true
  dragType.value = 'median'
  dragIndex.value = index
  selectPoint(index)
  setDraggingMedian(true) // 暂停自动重新生成轮廓
  
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', endDrag)
}

// 开始拖拽轮廓控制点
const startOutlineDrag = (e, point) => {
  e.stopPropagation()
  e.preventDefault()
  isDragging.value = true
  dragType.value = 'outline'
  dragSide.value = point.side
  dragIndex.value = point.index
  
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', endDrag)
}

// 拖拽中
const onDrag = (e) => {
  if (!isDragging.value) return
  
  const svg = document.querySelector('svg')
  if (!svg) return
  
  // 使用 SVG 原生 API 转换坐标
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
  
  const dataX = Math.round(svgP.x)
  const dataY = Math.round(1024 - svgP.y)
  
  if (dragType.value === 'median') {
    updateMedianPoint(dragIndex.value, dataX, dataY)
  } else if (dragType.value === 'outline') {
    updateOutlinePoint(dragSide.value, dragIndex.value, dataX, dataY)
  }
}

// 结束拖拽
const endDrag = () => {
  const wasMedianDrag = dragType.value === 'median'
  
  isDragging.value = false
  dragType.value = ''
  dragIndex.value = -1
  dragSide.value = ''
  
  if (wasMedianDrag) {
    setDraggingMedian(false) // 中线拖拽结束，重新生成轮廓
  }
  
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', endDrag)
}

// 点击控制点
const handlePointClick = (e, index) => {
  e.stopPropagation()
  selectPoint(index)
}

// 右键删除控制点
const handleContextMenu = (e, index) => {
  e.preventDefault()
  e.stopPropagation()
  if (confirm(`确定删除第 ${index + 1} 个控制点吗？`)) {
    deleteMedianPoint(index)
  }
}

// 点击空白处取消选中
const handleBackgroundClick = () => {
  clearSelection()
}
</script>

<template>
  <g class="control-point-layer" @click="handleBackgroundClick">
    <!-- 轮廓控制点手柄（左侧红色/右侧绿色） -->
    <template v-if="showOutlineControlPoints">
      <g
        v-for="point in currentOutlineControlPoints"
        :key="'outline-' + point.side + '-' + point.index"
        @mousedown="startOutlineDrag($event, point)"
        class="cursor-move"
      >
        <circle
          :cx="point.x"
          :cy="point.y"
          :r="OUTLINE_POINT_RADIUS"
          :fill="point.side === 'left' ? '#fecaca' : '#bbf7d0'"
          :stroke="point.side === 'left' ? '#ef4444' : '#22c55e'"
          stroke-width="1.5"
          class="hover:opacity-80"
        />
      </g>
    </template>
    
    <!-- 中线控制点手柄 -->
    <g
      v-for="(point, index) in currentMedianPoints"
      :key="'point-' + index"
      @mousedown="startMedianDrag($event, index)"
      @click="handlePointClick($event, index)"
      @contextmenu="handleContextMenu($event, index)"
      class="cursor-move"
    >
      <!-- 外圈（选中时显示） -->
      <circle
        :cx="point.x"
        :cy="point.y"
        :r="selectedPointIndex === index ? SELECTED_RADIUS : POINT_RADIUS + 2"
        :fill="selectedPointIndex === index ? 'rgba(59, 130, 246, 0.2)' : 'transparent'"
        :stroke="selectedPointIndex === index ? '#3b82f6' : 'transparent'"
        stroke-width="2"
        class="transition-all"
      />
      
      <!-- 内圈（控制点本体） -->
      <circle
        :cx="point.x"
        :cy="point.y"
        :r="POINT_RADIUS"
        :fill="selectedPointIndex === index ? '#3b82f6' : 'var(--svg-point-fill, #ffffff)'"
        :stroke="selectedPointIndex === index ? '#1d4ed8' : '#3b82f6'"
        stroke-width="2"
        class="hover:fill-blue-100"
      />
      
      <!-- 点序号已移至 SvgCanvas 的 HTML 覆盖层渲染（避免 SVG 翻转导致倒置） -->
    </g>
  </g>
</template>

<style scoped>
.control-point-layer {
  /* 控制点层需要响应鼠标事件 */
}

.cursor-move {
  cursor: move;
}

.transition-all {
  transition: all 0.15s ease;
}
</style>
