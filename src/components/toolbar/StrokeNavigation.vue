<script setup>
/**
 * StrokeNavigation.vue - 笔画导航组件
 * 
 * 功能：
 * - 上一笔/下一笔按钮
 * - 当前笔画序号显示
 * - 添加新笔画按钮
 */
import { useStrokeData } from '@/composables/useStrokeData'

const { 
  strokes,
  currentStrokeIndex,
  prevStroke,
  nextStroke,
  addStroke
} = useStrokeData()

// 添加新笔画并切换
const handleAddAndSwitch = () => {
  addStroke()
}
</script>

<template>
  <div class="flex items-center gap-2">
    <button 
      @click="prevStroke"
      :disabled="currentStrokeIndex <= 0"
      class="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
    >
      ← 上一笔
    </button>
    
    <span class="text-sm text-gray-600 dark:text-gray-400 min-w-[80px] text-center">
      第 
      <span class="font-medium text-blue-600 dark:text-blue-400">
        {{ strokes.length > 0 ? currentStrokeIndex + 1 : '-' }}
      </span>
      / {{ strokes.length || '-' }} 笔
    </span>
    
    <button 
      @click="nextStroke"
      :disabled="currentStrokeIndex >= strokes.length - 1"
      class="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
    >
      下一笔 →
    </button>
    
    <button
      @click="handleAddAndSwitch"
      class="px-2 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded"
      title="添加新笔画"
    >
      + 新笔画
    </button>
  </div>
</template>
