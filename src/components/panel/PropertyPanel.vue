<script setup>
/**
 * PropertyPanel.vue - 右侧属性面板
 * 
 * 功能：
 * - 显示汉字信息（当前字、笔画数）
 * - 笔画列表（状态、顺序）
 * - 中线点列表（坐标）
 * - SVG 路径预览
 */
import CharInfo from './CharInfo.vue'
import StrokeList from './StrokeList.vue'
import MedianPointList from './MedianPointList.vue'
import PointWidthEditor from './PointWidthEditor.vue'
import SvgPathPreview from './SvgPathPreview.vue'

const props = defineProps({
  character: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
    <!-- 面板标题 -->
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <h2 class="text-sm font-medium text-gray-700 dark:text-gray-300">属性面板</h2>
    </div>
    
    <!-- 面板内容（可滚动） -->
    <div class="flex-1 overflow-y-auto">
      <!-- 汉字信息 -->
      <CharInfo :character="character" />
      
      <!-- 笔画列表 -->
      <StrokeList />
      
      <!-- 中线点列表 -->
      <MedianPointList />
      
      <!-- 选中点宽度编辑器 -->
      <PointWidthEditor />
      
      <!-- SVG 路径预览 -->
      <SvgPathPreview />
    </div>
  </div>
</template>
