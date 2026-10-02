<script setup>
/**
 * ExportButton.vue - 导出 JSON 按钮组件
 * 
 * 功能：
 * - 导出 strokes + medians JSON
 * - 验证数据有效性
 * - 触发浏览器下载
 * - 复制到剪贴板
 */
import { ref, computed } from 'vue'
import { useStrokeData } from '@/composables/useStrokeData'
import { useOutlineGeneration } from '@/composables/useOutlineGeneration'
import { 
  formatExportData, 
  serializeToJSON, 
  downloadJSON, 
  copyToClipboard,
  validateExportData 
} from '@/utils/export'

const props = defineProps({
  character: {
    type: String,
    default: ''
  }
})

const { strokes } = useStrokeData()
const { outlineData } = useOutlineGeneration()

// 导出状态
const showResult = ref(false)
const resultMessage = ref('')
const resultType = ref('') // 'success' | 'error'

// 导出数据
const exportData = computed(() => {
  return formatExportData(
    props.character,
    strokes.value,
    outlineData.value
  )
})

// 导出 JSON 文件
const handleExport = () => {
  const data = exportData.value
  
  // 验证数据
  const validation = validateExportData(data)
  if (!validation.valid) {
    showResult.value = true
    resultMessage.value = '数据验证失败：' + validation.errors.join('；')
    resultType.value = 'error'
    setTimeout(() => { showResult.value = false }, 3000)
    return
  }
  
  // 序列化
  const jsonStr = serializeToJSON(data)
  
  // 下载文件
  const filename = `${props.character || 'unknown'}.json`
  downloadJSON(jsonStr, filename)
  
  showResult.value = true
  resultMessage.value = `已导出 ${filename}`
  resultType.value = 'success'
  setTimeout(() => { showResult.value = false }, 2000)
}

// 复制到剪贴板
const handleCopy = async () => {
  const data = exportData.value
  const jsonStr = serializeToJSON(data)
  
  const success = await copyToClipboard(jsonStr)
  showResult.value = true
  resultMessage.value = success ? '已复制到剪贴板' : '复制失败'
  resultType.value = success ? 'success' : 'error'
  setTimeout(() => { showResult.value = false }, 2000)
}
</script>

<template>
  <div class="relative">
    <div class="flex items-center gap-1">
      <button 
        @click="handleCopy"
        :disabled="strokes.length === 0"
        class="px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        title="复制到剪贴板"
      >
        复制
      </button>
      
      <button 
        @click="handleExport"
        :disabled="strokes.length === 0"
        class="px-4 py-1.5 text-sm bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        导出 JSON
      </button>
    </div>
    
    <!-- 结果提示 -->
    <div
      v-if="showResult"
      class="absolute bottom-full right-0 mb-2 px-3 py-1.5 text-xs rounded shadow-lg whitespace-nowrap"
      :class="resultType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
    >
      {{ resultMessage }}
    </div>
  </div>
</template>
