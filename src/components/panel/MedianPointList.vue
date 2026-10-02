<script setup>
/**
 * MedianPointList.vue - 中线点列表组件
 * 
 * 功能：
 * - 显示当前笔画的所有中线控制点坐标
 * - 支持点击定位到对应控制点
 */
import { useStrokeData } from '@/composables/useStrokeData'

const { 
  currentMedianPoints,
  selectedPointIndex,
  selectPoint
} = useStrokeData()
</script>

<template>
  <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
    <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">中线点列表</h3>
    
    <div v-if="currentMedianPoints.length === 0" class="text-sm text-gray-400 dark:text-gray-500 italic">
      暂无中线点
    </div>
    
    <div v-else class="space-y-0.5 max-h-36 overflow-y-auto">
      <div
        v-for="(point, index) in currentMedianPoints"
        :key="'mp-' + index"
        @click="selectPoint(index)"
        class="flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer"
        :class="selectedPointIndex === index ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'"
      >
        <span class="font-medium">{{ index + 1 }}.</span>
        <div class="flex items-center gap-2">
          <span class="font-mono">[{{ point.x }}, {{ point.y }}]</span>
          <span v-if="point.width" class="text-xs text-orange-500 dark:text-orange-400 font-mono" title="自定义宽度">w:{{ point.width }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="currentMedianPoints.length > 0" class="mt-2 text-xs text-gray-400 dark:text-gray-500">
      共 {{ currentMedianPoints.length }} 个点
    </div>
  </div>
</template>
