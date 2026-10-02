<script setup>
/**
 * SvgPathPreview.vue - SVG 路径预览组件
 * 
 * 功能：
 * - 显示当前笔画的轮廓 SVG 路径字符串
 * - 显示中线 SVG 路径字符串
 * - 支持复制路径数据
 */
import { computed } from 'vue'
import { useStrokeData } from '@/composables/useStrokeData'
import { useOutlineGeneration } from '@/composables/useOutlineGeneration'
import { pointsToQuadraticBezierPath } from '@/utils/bezier'

const { currentMedianPoints } = useStrokeData()
const { currentOutlinePath } = useOutlineGeneration()

// 中线 SVG 路径
const medianPath = computed(() => {
  return pointsToQuadraticBezierPath(currentMedianPoints.value)
})

// 复制文本
const copyText = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text)
    alert(`${label} 已复制`)
  } catch (err) {
    alert('复制失败')
  }
}
</script>

<template>
  <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
    <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">SVG 路径预览</h3>
    
    <!-- 轮廓路径 -->
    <div class="mb-2">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs text-gray-500 dark:text-gray-400">轮廓 (strokes)</span>
        <button
          v-if="currentOutlinePath"
          @click="copyText(currentOutlinePath, '轮廓路径')"
          class="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          复制
        </button>
      </div>
      <div class="text-xs text-gray-600 dark:text-gray-400 font-mono break-all bg-gray-50 dark:bg-gray-700/50 p-2 rounded max-h-20 overflow-y-auto">
        {{ currentOutlinePath || '暂无轮廓路径' }}
      </div>
    </div>
    
    <!-- 中线路径 -->
    <div>
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs text-gray-500 dark:text-gray-400">中线 (medians)</span>
        <button
          v-if="medianPath"
          @click="copyText(medianPath, '中线路径')"
          class="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          复制
        </button>
      </div>
      <div class="text-xs text-gray-600 dark:text-gray-400 font-mono break-all bg-gray-50 dark:bg-gray-700/50 p-2 rounded max-h-20 overflow-y-auto">
        {{ medianPath || '暂无中线数据' }}
      </div>
    </div>
  </div>
</template>
