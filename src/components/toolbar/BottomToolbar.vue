<script setup>
/**
 * BottomToolbar.vue - 底部工具栏
 * 
 * 功能：
 * - 撤销/重做控制
 * - 上一笔/下一笔导航
 * - 预览动画按钮
 * - 导出 JSON 按钮
 */
import HistoryControls from './HistoryControls.vue'
import StrokeNavigation from './StrokeNavigation.vue'
import PreviewButton from './PreviewButton.vue'
import ExportButton from './ExportButton.vue'

const props = defineProps({
  character: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="h-14 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
    <!-- 左侧：历史控制 -->
    <HistoryControls />
    
    <!-- 中间：笔画导航 -->
    <StrokeNavigation />
    
    <!-- 右侧：预览和导出 -->
    <div class="flex items-center gap-2">
      <PreviewButton />
      <ExportButton :character="character" />
    </div>
  </div>
</template>
