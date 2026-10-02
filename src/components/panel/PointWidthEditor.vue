<script setup>
/**
 * PointWidthEditor.vue - 选中点宽度编辑器
 * 
 * 功能：
 * - 当选中中线控制点时，显示该点的宽度滑块
 * - 支持单独调整每个点的宽度（逐点宽度）
 * - 支持重置为全局默认宽度
 */
import { computed } from 'vue'
import { useStrokeData } from '@/composables/useStrokeData'
import { useOutlineGeneration } from '@/composables/useOutlineGeneration'

const { 
  currentMedianPoints,
  selectedPointIndex
} = useStrokeData()

const { 
  strokeWidth,
  updateMedianPointWidth,
  getMedianPointWidth
} = useOutlineGeneration()

// 当前选中点的宽度（null 表示使用全局宽度）
const currentPointWidth = computed(() => {
  if (selectedPointIndex.value < 0) return null
  return getMedianPointWidth(selectedPointIndex.value)
})

// 显示值（未设置时显示全局宽度）
const displayWidth = computed(() => {
  return currentPointWidth.value ?? strokeWidth.value
})

// 是否使用自定义宽度
const isCustomWidth = computed(() => {
  return currentPointWidth.value !== null
})

// 更新选中点宽度
const handleWidthChange = (e) => {
  const width = Number(e.target.value)
  if (selectedPointIndex.value >= 0) {
    updateMedianPointWidth(selectedPointIndex.value, width)
  }
}

// 重置为全局宽度
const resetToDefault = () => {
  if (selectedPointIndex.value >= 0) {
    updateMedianPointWidth(selectedPointIndex.value, undefined)
  }
}
</script>

<template>
  <div v-if="selectedPointIndex >= 0 && currentMedianPoints.length > 0" class="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        第 {{ selectedPointIndex + 1 }} 点宽度
      </h3>
      <button
        v-if="isCustomWidth"
        @click="resetToDefault"
        class="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        title="重置为全局宽度"
      >
        重置
      </button>
    </div>
    
    <div class="flex items-center gap-2">
      <input
        type="range"
        min="10"
        max="200"
        :value="displayWidth"
        @input="handleWidthChange"
        class="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
      />
      <span class="text-xs text-gray-600 dark:text-gray-400 w-8 text-right font-mono">{{ displayWidth }}</span>
    </div>
    
    <div v-if="isCustomWidth" class="mt-1 text-xs text-blue-500 dark:text-blue-400">
      自定义宽度（全局: {{ strokeWidth }}）
    </div>
  </div>
</template>
