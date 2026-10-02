<script setup>
/**
 * MedianLayer.vue - 中线编辑层
 * 
 * 功能：
 * - 渲染中线贝塞尔曲线
 * - 响应点击添加控制点
 * - 与 ControlPointLayer 配合实现拖拽
 */
import { computed } from 'vue'
import { useStrokeData } from '@/composables/useStrokeData'
import { pointsToQuadraticBezierPath } from '@/utils/bezier'

const { currentMedianPoints } = useStrokeData()

// 生成中线路径
const medianPath = computed(() => {
  return pointsToQuadraticBezierPath(currentMedianPoints.value)
})
</script>

<template>
  <g class="median-layer">
    <!-- 中线贝塞尔曲线 -->
    <path
      v-if="medianPath"
      :d="medianPath"
      fill="none"
      stroke="#3b82f6"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="pointer-events-none"
    />
    
    <!-- 中线点之间的连线（辅助线，虚线显示） -->
    <g v-if="currentMedianPoints.length > 1" class="pointer-events-none">
      <line
        v-for="(point, index) in currentMedianPoints.slice(0, -1)"
        :key="'line-' + index"
        :x1="point.x"
        :y1="point.y"
        :x2="currentMedianPoints[index + 1].x"
        :y2="currentMedianPoints[index + 1].y"
        stroke="#93c5fd"
        stroke-width="1"
        stroke-dasharray="4,4"
        opacity="0.5"
      />
    </g>
  </g>
</template>

<style scoped>
.median-layer {
  /* 中线层不阻止事件传递，让点击事件到达 SvgCanvas */
}
</style>
