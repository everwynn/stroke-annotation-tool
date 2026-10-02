<script setup>
/**
 * HistoryControls.vue - 撤回/恢复控制组件
 * 
 * 功能：
 * - 撤回上一步按钮 (Ctrl+Z)
 * - 恢复上一步按钮 (Ctrl+Shift+Z)
 * - 禁用状态管理
 */
import { useHistory } from '@/composables/useHistory'

const { canUndo, canRedo, undo, redo } = useHistory()
</script>

<template>
  <div class="flex items-center gap-1">
    <button 
      @click="undo"
      :disabled="!canUndo"
      class="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
      title="撤回上一步 (Ctrl+Z)"
    >
      撤回上一步
    </button>
    <button 
      @click="redo"
      :disabled="!canRedo"
      class="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
      title="恢复上一步 (Ctrl+Shift+Z)"
    >
      恢复上一步
    </button>
  </div>
</template>
