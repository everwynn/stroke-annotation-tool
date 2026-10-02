<script setup>
/**
 * SvgCanvas.vue - SVG 画布核心组件
 * 
 * 功能：
 * - 1024×1024 画布，坐标系翻转（Y 轴向上）
 * - 滚轮缩放 + 拖拽平移（viewBox 控制）
 * - 点击添加中线控制点
 * - 作为所有图层的容器
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import GridLayer from './GridLayer.vue'
import ReferenceLayer from './ReferenceLayer.vue'
import MedianLayer from './MedianLayer.vue'
import OutlineLayer from './OutlineLayer.vue'
import ControlPointLayer from './ControlPointLayer.vue'
import { useStrokeData } from '@/composables/useStrokeData'

const props = defineProps({
  character: {
    type: String,
    default: ''
  }
})

const { addMedianPoint, currentMedianPoints, selectedPointIndex } = useStrokeData()

// 画布状态
const svgRef = ref(null)
const viewBox = ref({ x: 0, y: 0, width: 1024, height: 1024 })
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })

// 缩放处理
const handleWheel = (e) => {
  e.preventDefault()
  const scale = e.deltaY > 0 ? 1.1 : 0.9
  const rect = svgRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  
  // 将鼠标位置转换为 SVG 坐标
  const svgX = viewBox.value.x + (mouseX / rect.width) * viewBox.value.width
  const svgY = viewBox.value.y + (mouseY / rect.height) * viewBox.value.height
  
  // 缩放
  const newWidth = viewBox.value.width * scale
  const newHeight = viewBox.value.height * scale
  
  // 限制缩放范围
  if (newWidth < 100 || newWidth > 5000) return
  
  viewBox.value = {
    x: svgX - (mouseX / rect.width) * newWidth,
    y: svgY - (mouseY / rect.height) * newHeight,
    width: newWidth,
    height: newHeight
  }
}

// 平移处理
const handleMouseDown = (e) => {
  if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
    // 中键或 Shift+左键 平移
    isPanning.value = true
    panStart.value = { x: e.clientX, y: e.clientY }
    e.preventDefault()
  }
}

// 点击添加控制点
const handleClick = (e) => {
  // 如果正在平移，不添加点
  if (isPanning.value) return
  
  // 如果是 Shift+左键，不添加点（用于平移）
  if (e.shiftKey) return
  
  // 只响应左键
  if (e.button !== 0) return
  
  const svg = svgRef.value
  if (!svg) return
  
  // 使用 SVG 原生 API 将屏幕坐标转换为 SVG 用户坐标
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  
  // getScreenCTM() 返回从 SVG 用户坐标到屏幕坐标的变换矩阵
  // inverse() 得到反向矩阵，用于将屏幕坐标转为 SVG 坐标
  const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
  
  // svgP 是 SVG 用户坐标（即 viewBox 坐标），需要转换为数据坐标
  // SVG 根元素有 transform="scale(1,-1) translate(0,-1024)" 翻转
  // 所以数据坐标 Y = 1024 - svgY
  const dataX = Math.round(svgP.x)
  const dataY = Math.round(1024 - svgP.y)
  
  // 添加中线控制点（数据坐标）
  addMedianPoint(dataX, dataY)
}

const handleMouseMove = (e) => {
  if (!isPanning.value) return
  
  const rect = svgRef.value.getBoundingClientRect()
  const dx = (e.clientX - panStart.value.x) * (viewBox.value.width / rect.width)
  const dy = (e.clientY - panStart.value.y) * (viewBox.value.height / rect.height)
  
  viewBox.value = {
    ...viewBox.value,
    x: viewBox.value.x - dx,
    y: viewBox.value.y - dy
  }
  
  panStart.value = { x: e.clientX, y: e.clientY }
}

const handleMouseUp = () => {
  isPanning.value = false
}

// 重置视图
const resetView = () => {
  viewBox.value = { x: 0, y: 0, width: 1024, height: 1024 }
}

// 控制点编号的 HTML 覆盖层位置
const containerRef = ref(null)
const labelPositions = computed(() => {
  const svg = svgRef.value
  const container = containerRef.value
  if (!svg || !container) return []
  
  const containerRect = container.getBoundingClientRect()
  const ctm = svg.getScreenCTM()
  if (!ctm) return []
  
  return currentMedianPoints.value.map((point, index) => {
    // 数据坐标 → SVG 用户坐标（Y 轴翻转）
    const svgX = point.x
    const svgY = 1024 - point.y
    
    // 使用 SVG 原生 API 将 SVG 用户坐标转为屏幕坐标
    const pt = svg.createSVGPoint()
    pt.x = svgX
    pt.y = svgY
    const screenP = pt.matrixTransform(ctm)
    
    // 屏幕坐标 → 相对于容器的 CSS 像素位置
    const left = screenP.x - containerRect.left
    const top = screenP.y - containerRect.top
    
    return {
      index,
      left: `${left}px`,
      top: `${top}px`,
      label: String(index + 1),
      selected: selectedPointIndex.value === index
    }
  })
})
defineExpose({
  resetView,
  viewBox
})
</script>

<template>
  <div ref="containerRef" class="relative w-full h-full bg-gray-50 dark:bg-gray-800 overflow-hidden">
    <svg
      ref="svgRef"
      :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`"
      class="w-full h-full cursor-crosshair"
      :class="{ 'cursor-grabbing': isPanning }"
      @wheel="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @click="handleClick"
    >
      <!-- 坐标系翻转：Y 轴向上 -->
      <g transform="scale(1,-1) translate(0,-1024)">
        <!-- 网格辅助线层 -->
        <GridLayer />
        
        <!-- 参考字形层 -->
        <ReferenceLayer :character="character" />
        
        <!-- 轮廓路径层 -->
        <OutlineLayer />
        
        <!-- 中线编辑层 -->
        <MedianLayer />
        
        <!-- 控制点手柄层 -->
        <ControlPointLayer />
      </g>
    </svg>
    
    <!-- 控制点编号覆盖层（HTML，不受 SVG 翻转影响） -->
    <div class="absolute inset-0 pointer-events-none">
      <div
        v-for="item in labelPositions"
        :key="'label-' + item.index"
        class="absolute flex items-center justify-center rounded-full text-[10px] font-medium leading-none"
        :style="{
          left: item.left,
          top: item.top,
          width: '16px',
          height: '16px',
          transform: 'translate(-50%, -50%)',
          color: item.selected ? '#ffffff' : 'var(--label-color, #3b82f6)',
          backgroundColor: item.selected ? '#3b82f6' : 'var(--label-bg, rgba(255,255,255,0.8))'
        }"
      >
        {{ item.label }}
      </div>
    </div>
    
    <!-- 画布工具栏 -->
    <div class="absolute top-2 right-2 flex gap-1 bg-white dark:bg-gray-700 rounded shadow p-1 z-10">
      <button 
        @click.stop="resetView" 
        class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded text-gray-700 dark:text-gray-300"
        title="重置视图（恢复默认缩放和平移）"
      >
        重置视图
      </button>
    </div>
  </div>
</template>

<style scoped>
svg {
  user-select: none;
}
</style>
