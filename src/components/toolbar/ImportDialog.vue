<script setup>
/**
 * ImportDialog.vue - 数据导入对话框
 * 
 * 功能：
 * - 粘贴 hanzi-writer-data 格式的 JSON 数据
 * - 自动解析 medians 字段
 * - 坐标转换后导入到画布
 */
import { ref, computed } from 'vue'
import { importStrokeData } from '@/utils/import'
import { useStrokeData } from '@/composables/useStrokeData'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'imported'])

const { clearAll, addStroke, addMedianPoint, switchStroke } = useStrokeData()

const jsonInput = ref('')
const error = ref('')
const preview = ref(null)

// 解析并预览数据
const handleParse = () => {
  error.value = ''
  preview.value = null
  
  if (!jsonInput.value.trim()) {
    error.value = '请输入 JSON 数据'
    return
  }
  
  try {
    const strokes = importStrokeData(jsonInput.value)
    preview.value = strokes
  } catch (e) {
    error.value = e.message
  }
}

// 执行导入
const handleImport = () => {
  if (!preview.value) {
    handleParse()
    if (!preview.value) return
  }
  
  try {
    // 清空现有数据
    clearAll()
    
    // 导入每一笔
    preview.value.forEach((strokePoints, index) => {
      addStroke()
      strokePoints.forEach(point => {
        addMedianPoint(point.x, point.y)
      })
    })
    
    // 切换到第一笔
    switchStroke(0)
    
    emit('imported', preview.value.length)
    handleClose()
  } catch (e) {
    error.value = '导入失败：' + e.message
  }
}

// 关闭对话框
const handleClose = () => {
  jsonInput.value = ''
  error.value = ''
  preview.value = null
  emit('close')
}

// 统计信息
const stats = computed(() => {
  if (!preview.value) return null
  return {
    strokeCount: preview.value.length,
    totalPoints: preview.value.reduce((sum, stroke) => sum + stroke.length, 0)
  }
})
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- 遮罩层 -->
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="handleClose"></div>
      
      <!-- 对话框 -->
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        <!-- 标题栏 -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">导入笔画数据</h3>
          <button @click="handleClose" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- 内容区 -->
        <div class="px-6 py-4 flex-1 overflow-y-auto">
          <!-- 说明 -->
          <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
            <p class="mb-1">粘贴 hanzi-writer-data 格式的 JSON 数据：</p>
            <code class="block bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-xs font-mono">
              { "char": "字", "medians": [[[x,y],...],...], "strokes": [...] }
            </code>
          </div>
          
          <!-- 输入框 -->
          <textarea
            v-model="jsonInput"
            @input="error = ''"
            placeholder="在此粘贴 JSON 数据..."
            class="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          ></textarea>
          
          <!-- 错误提示 -->
          <div v-if="error" class="mt-2 text-sm text-red-600 dark:text-red-400">
            {{ error }}
          </div>
          
          <!-- 预览信息 -->
          <div v-if="stats" class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <div class="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">数据预览</div>
            <div class="text-xs text-blue-700 dark:text-blue-400">
              <span>笔画数：{{ stats.strokeCount }}</span>
              <span class="mx-2">|</span>
              <span>总点数：{{ stats.totalPoints }}</span>
            </div>
          </div>
        </div>
        
        <!-- 按钮栏 -->
        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            @click="handleClose"
            class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
          >
            取消
          </button>
          <button
            @click="handleParse"
            class="px-4 py-2 text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-md"
          >
            解析预览
          </button>
          <button
            @click="handleImport"
            :disabled="!preview"
            class="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认导入
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
