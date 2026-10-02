<script setup>
/**
 * CharInfo.vue - 汉字信息组件
 * 
 * 功能：
 * - 显示当前标注的汉字
 * - 显示笔画数
 * - 显示当前正在标注的笔画序号
 */
import { useStrokeData } from '@/composables/useStrokeData'

const props = defineProps({
  character: {
    type: String,
    default: ''
  }
})

const { strokes, currentStrokeIndex } = useStrokeData()
</script>

<template>
  <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
    <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">汉字信息</h3>
    <div class="space-y-1">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">汉字</span>
        <span class="font-medium text-gray-900 dark:text-gray-100 text-lg">{{ character || '-' }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">笔画数</span>
        <span class="font-medium text-gray-900 dark:text-gray-100">{{ strokes.length || '-' }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">当前笔画</span>
        <span class="font-medium text-blue-600 dark:text-blue-400">
          {{ strokes.length > 0 ? `第 ${currentStrokeIndex + 1} 笔` : '-' }}
        </span>
      </div>
    </div>
  </div>
</template>
