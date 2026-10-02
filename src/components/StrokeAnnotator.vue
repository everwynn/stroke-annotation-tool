<script setup>
/**
 * StrokeAnnotator.vue - 主容器（标注工作台）
 * 
 * 功能：
 * - 整合画布区域、属性面板、底部工具栏
 * - 管理全局标注状态
 * - 协调各组件之间的数据流
 * - 键盘快捷键、自动保存、撤销/重做
 * - 深色模式切换（带 View Transition 动画）
 */
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import SvgCanvas from './canvas/SvgCanvas.vue'
import PropertyPanel from './panel/PropertyPanel.vue'
import BottomToolbar from './toolbar/BottomToolbar.vue'
import LeftToolbar from './toolbar/LeftToolbar.vue'
import ImportDialog from './toolbar/ImportDialog.vue'
import { useOutlineGeneration } from '@/composables/useOutlineGeneration'
import { useAutoSave } from '@/composables/useAutoSave'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { useStrokeData } from '@/composables/useStrokeData'
import { useHistory } from '@/composables/useHistory'
import { useDarkMode } from '@/composables/useDarkMode'

// 初始化各 composable
const { showOutlineControlPoints, strokeWidth, setStrokeWidth, outlineData } = useOutlineGeneration()
const { save, load, hasSavedData, lastSaveTime, getSavedCharacters, removeSavedData, lastSavedCharacter } = useAutoSave()
const { strokes, clearAll: clearStrokeData } = useStrokeData()
const { saveSnapshot } = useHistory()
const { isDark, toggleDark, animationDuration, setAnimationDuration, animationStyle, setAnimationStyle } = useDarkMode()

// 初始化键盘快捷键
useKeyboardShortcuts()

// 点击外部关闭下拉框
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 当前标注的汉字
const character = ref('')

// 输入框绑定
const characterInput = ref('')

// 保存状态提示
const saveStatus = ref('')

// 导入对话框
const showImportDialog = ref(false)

// 导入成功提示
const importStatus = ref('')

// 已保存的汉字列表（使用 ref 以便手动更新）
const savedCharacters = ref(getSavedCharacters())

// 刷新已保存列表
const refreshSavedCharacters = () => {
  savedCharacters.value = getSavedCharacters()
}

// 搜索下拉框状态
const showSavedDropdown = ref(false)
const savedSearchQuery = ref('')
const dropdownRef = ref(null)

// 过滤后的汉字列表
const filteredCharacters = computed(() => {
  const query = savedSearchQuery.value.trim().toLowerCase()
  if (!query) return savedCharacters.value
  return savedCharacters.value.filter(char => char.toLowerCase().includes(query))
})

// 删除已保存的汉字
const deleteSavedCharacter = (char, event) => {
  event.preventDefault()
  event.stopPropagation()
  removeSavedData(char)
  refreshSavedCharacters()  // 刷新列表
  // 如果删除的是当前选中的汉字，清空画布
  if (character.value === char) {
    clearCharacter()
  }
}

// 从列表加载汉字
const loadCharacter = (char) => {
  characterInput.value = char
  character.value = char
  savedSearchQuery.value = char  // 显示选中的汉字
  showSavedDropdown.value = false
  const loaded = load(char)
  if (loaded) {
    saveStatus.value = '已恢复上次进度'
    setTimeout(() => { saveStatus.value = '' }, 2000)
  }
}

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showSavedDropdown.value = false
  }
}

// 清除当前汉字选择（只清空显示，不删除 localStorage 缓存）
const clearCharacter = () => {
  // 先清空 lastSavedCharacter，防止自动保存覆盖 localStorage
  lastSavedCharacter.value = ''
  
  character.value = ''
  characterInput.value = ''
  saveStatus.value = ''
  // 清空标注数据
  clearStrokeData()
  outlineData.value = []
}

// 设置汉字
const setCharacter = () => {
  const newChar = characterInput.value.trim()
  if (!newChar) return
  
  // 切换汉字时，先尝试加载已保存的数据
  character.value = newChar
  const loaded = load(newChar)
  if (loaded) {
    saveStatus.value = '已恢复上次进度'
    setTimeout(() => { saveStatus.value = '' }, 2000)
  }
}

// 手动保存
const handleSave = () => {
  if (character.value) {
    save(character.value)
    refreshSavedCharacters()  // 刷新已保存列表
    saveStatus.value = '已保存'
    setTimeout(() => { saveStatus.value = '' }, 2000)
  }
}

// 打开导入对话框
const openImportDialog = () => {
  showImportDialog.value = true
}

// 导入完成回调
const handleImported = (strokeCount) => {
  importStatus.value = `已导入 ${strokeCount} 笔`
  setTimeout(() => { importStatus.value = '' }, 2000)
}

// 监听笔画数据变化，保存快照（用于撤销/重做）
let snapshotTimer = null
watch(
  () => strokes.value,
  () => {
    // 防抖：500ms 内只保存一次快照
    if (snapshotTimer) clearTimeout(snapshotTimer)
    snapshotTimer = setTimeout(() => {
      saveSnapshot()
    }, 500)
  },
  { deep: true }
)
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
    <!-- 顶部标题栏 -->
    <header class="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
      <div class="flex items-center gap-2">
        <!-- 项目图标 - 毛笔笔尖 -->
        <svg
          class="w-6 h-6"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="icon-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#60A5FA;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#icon-bg)"/>
          <rect x="42" y="15" width="16" height="45" rx="3" fill="#D97706" transform="rotate(-15, 50, 50)"/>
          <path d="M 38 55 L 62 55 L 50 85 Z" fill="#1F2937"/>
          <circle cx="50" cy="88" r="4" fill="#1F2937" opacity="0.8"/>
          <circle cx="47" cy="92" r="2" fill="#1F2937" opacity="0.5"/>
          <circle cx="53" cy="91" r="1.5" fill="#1F2937" opacity="0.4"/>
          <rect x="44" y="20" width="4" height="30" rx="2" fill="white" opacity="0.3" transform="rotate(-15, 50, 50)"/>
        </svg>
        
        <h1 class="text-lg font-medium text-gray-800 dark:text-gray-200">笔画标注工具</h1>
      </div>
      
      <!-- 汉字输入 -->
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600 dark:text-gray-400">目标汉字：</label>
        <input
          v-model="characterInput"
          type="text"
          maxlength="1"
          class="w-16 px-2 py-1 text-center text-lg border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="字"
          @keyup.enter="setCharacter"
        />
        <button
          @click="setCharacter"
          class="px-3 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded"
        >
          确定
        </button>
        
        <!-- 已保存汉字搜索下拉框 -->
        <div v-if="savedCharacters.length > 0" class="flex items-center ml-2" ref="dropdownRef">
          <label class="text-xs text-gray-500 dark:text-gray-400 mr-1">已保存：</label>
          <div class="relative">
            <input
              v-model="savedSearchQuery"
              @focus="showSavedDropdown = true"
              type="text"
              class="text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-0.5 pr-6 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 w-28 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="搜索汉字..."
            />
            <!-- 清除按钮 -->
            <button
              v-if="savedSearchQuery || character"
              @mousedown.prevent="clearCharacter(); savedSearchQuery = ''"
              class="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-xs"
              title="清除当前选择"
            >
              ×
            </button>
            
            <!-- 下拉列表 -->
            <div
              v-if="showSavedDropdown && filteredCharacters.length > 0"
              class="absolute top-full left-0 mt-1 w-28 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-50 max-h-48 overflow-y-auto"
            >
              <div
                v-for="char in filteredCharacters"
                :key="char"
                @mousedown.prevent="loadCharacter(char)"
                class="flex items-center justify-between px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
              >
                <span>{{ char }}</span>
                <button
                  @mousedown.prevent.stop="deleteSavedCharacter(char, $event)"
                  class="text-gray-400 hover:text-red-500 ml-1 px-1"
                  title="删除此汉字的缓存"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧工具区 -->
      <div class="flex items-center gap-2">
        <!-- 深色模式切换 -->
        <button
          @click="toggleDark($event)"
          class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          :title="isDark ? '切换亮色模式' : '切换深色模式'"
        >
          <!-- 月亮图标（深色模式） -->
          <svg v-if="isDark" class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
          <!-- 太阳图标（亮色模式） -->
          <svg v-else class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
        
        <!-- 导入按钮 -->
        <button
          @click="openImportDialog"
          class="px-3 py-1.5 text-sm bg-green-500 text-white hover:bg-green-600 rounded"
          title="导入 hanzi-writer-data 格式数据"
        >
          {{ importStatus || '导入数据' }}
        </button>
        
        <button 
          @click="handleSave"
          class="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300"
          title="保存标注进度到浏览器本地存储"
        >
          {{ saveStatus || '保存进度' }}
        </button>
      </div>
    </header>
    
    <!-- 主内容区域 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧工具栏 -->
      <LeftToolbar
        :stroke-width="strokeWidth"
        :show-outline-control-points="showOutlineControlPoints"
        :animation-duration="animationDuration"
        :animation-style="animationStyle"
        @update:stroke-width="setStrokeWidth($event)"
        @update:show-outline-control-points="showOutlineControlPoints = $event"
        @update:animation-duration="setAnimationDuration($event)"
        @update:animation-style="setAnimationStyle($event)"
      />
      
      <!-- 画布区域 -->
      <div class="flex-1 p-4">
        <SvgCanvas :character="character" />
      </div>
      
      <!-- 右侧：属性面板 -->
      <div class="w-72">
        <PropertyPanel :character="character" />
      </div>
    </div>
    
    <!-- 底部工具栏 -->
    <BottomToolbar :character="character" />
    
    <!-- 导入对话框 -->
    <ImportDialog
      :visible="showImportDialog"
      @close="showImportDialog = false"
      @imported="handleImported"
    />
  </div>
</template>
