<script setup>
/**
 * StrokeList.vue - 笔画列表组件
 * 
 * 功能：
 * - 显示所有笔画的状态（已完成/编辑中/待标注）
 * - 点击切换当前编辑笔画
 * - 显示每笔的中线点数量
 * - 支持添加新笔画
 * - 支持删除笔画
 */
import { useStrokeData } from '@/composables/useStrokeData'

const { 
  strokes, 
  currentStrokeIndex,
  switchStroke,
  addStroke,
  deleteStroke
} = useStrokeData()

// 笔画状态名称
const getStrokeStatus = (index) => {
  if (index === currentStrokeIndex.value) return 'editing'
  const stroke = strokes.value[index]
  if (stroke && stroke.medianPoints.length > 0) return 'completed'
  return 'pending'
}

// 状态标签
const statusLabel = {
  editing: '编辑中',
  completed: '已完成',
  pending: '待标注'
}

// 状态颜色（亮色 / 深色）
const statusColor = {
  editing: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30',
  completed: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30',
  pending: 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700'
}

// 添加新笔画
const handleAddStroke = () => {
  addStroke()
}

// 删除笔画
const handleDeleteStroke = (e, index) => {
  e.stopPropagation()
  if (confirm(`确定删除第 ${index + 1} 笔吗？`)) {
    deleteStroke()
  }
}
</script>

<template>
  <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">笔画列表</h3>
      <button
        @click="handleAddStroke"
        class="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        title="添加新笔画"
      >
        + 添加
      </button>
    </div>
    
    <div v-if="strokes.length === 0" class="text-sm text-gray-400 dark:text-gray-500 italic">
      点击画布添加第一个笔画
    </div>
    
    <div v-else class="space-y-1 max-h-48 overflow-y-auto">
      <div
        v-for="(stroke, index) in strokes"
        :key="'stroke-' + index"
        @click="switchStroke(index)"
        class="flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors"
        :class="index === currentStrokeIndex ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'"
      >
        <div class="flex items-center gap-2">
          <!-- 序号 -->
          <span 
            class="w-5 h-5 flex items-center justify-center text-xs font-medium rounded-full"
            :class="index === currentStrokeIndex ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'"
          >
            {{ index + 1 }}
          </span>
          
          <!-- 中线点数 -->
          <span class="text-sm text-gray-700 dark:text-gray-300">
            {{ stroke.medianPoints.length }} 个点
          </span>
        </div>
        
        <div class="flex items-center gap-1">
          <!-- 状态标签 -->
          <span 
            class="text-xs px-1.5 py-0.5 rounded"
            :class="statusColor[getStrokeStatus(index)]"
          >
            {{ statusLabel[getStrokeStatus(index)] }}
          </span>
          
          <!-- 删除按钮 -->
          <button
            @click="handleDeleteStroke($event, index)"
            class="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-xs"
            title="删除笔画"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
