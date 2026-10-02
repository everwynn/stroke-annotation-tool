<script setup>
/**
 * LeftToolbar.vue - 左侧工具栏
 * 
 * 功能：
 * - 笔画宽度调节（滑块）
 * - 轮廓控制点开关（Toggle）
 * - 深色模式切换
 * - 可收起/展开
 */
import { ref, onMounted } from 'vue'

const props = defineProps({
  strokeWidth: {
    type: Number,
    default: 80
  },
  showOutlineControlPoints: {
    type: Boolean,
    default: false
  },
  animationDuration: {
    type: Number,
    default: 600
  },
  animationStyle: {
    type: String,
    default: 'circle'
  }
})

const emit = defineEmits([
  'update:strokeWidth',
  'update:showOutlineControlPoints',
  'update:animationDuration',
  'update:animationStyle'
])

// 工具栏展开状态
const isExpanded = ref(true)

// 从 localStorage 恢复展开状态
onMounted(() => {
  const saved = localStorage.getItem('left-toolbar-expanded')
  if (saved !== null) {
    isExpanded.value = saved === '1'
  }
})

// 切换展开/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  localStorage.setItem('left-toolbar-expanded', isExpanded.value ? '1' : '0')
}
</script>

<template>
  <div
    class="flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-200 ease-in-out overflow-hidden"
    :class="isExpanded ? 'w-40' : 'w-10'"
  >
    <!-- 折叠按钮 -->
    <button
      @click="toggleExpand"
      class="h-10 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      :title="isExpanded ? '收起工具栏' : '展开工具栏'"
    >
      <!-- 箭头图标 -->
      <svg
        class="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200"
        :class="isExpanded ? '' : 'rotate-180'"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- 工具内容 -->
    <div class="flex-1 flex flex-col py-3 space-y-4">
      <!-- 笔画宽度 -->
      <div class="px-3">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-base">🎨</span>
          <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap" :class="{ 'hidden': !isExpanded }">
            笔画宽度
          </span>
        </div>
        <div class="flex items-center gap-2">
          <input
            type="range"
            min="40"
            max="150"
            :value="strokeWidth"
            @input="emit('update:strokeWidth', Number($event.target.value))"
            class="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
            :title="`笔画宽度：${strokeWidth}`"
          />
          <span v-if="isExpanded" class="text-xs text-gray-600 dark:text-gray-400 w-6 text-right font-mono">
            {{ strokeWidth }}
          </span>
        </div>
      </div>

      <!-- 轮廓控制点 Toggle -->
      <div class="px-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-base">️</span>
            <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap" :class="{ 'hidden': !isExpanded }">
              轮廓控制点
            </span>
          </div>
          <button
            @click="emit('update:showOutlineControlPoints', !showOutlineControlPoints)"
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            :class="showOutlineControlPoints ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'"
            :title="showOutlineControlPoints ? '隐藏轮廓控制点' : '显示轮廓控制点'"
          >
            <span
              class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow"
              :class="showOutlineControlPoints ? 'translate-x-5' : 'translate-x-1'"
            />
          </button>
        </div>
      </div>

      <!-- 分隔线 -->
      <div class="mx-3 my-2 border-t border-gray-200 dark:border-gray-700"></div>

      <!-- 动画设置（深色模式下显示） -->
      <div class="px-3 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-base">⚡</span>
            <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap" :class="{ 'hidden': !isExpanded }">
              动画速度
            </span>
          </div>
          <select
            :value="animationDuration"
            @change="emit('update:animationDuration', Number($event.target.value))"
            class="text-[10px] border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 w-14 focus:outline-none focus:ring-1 focus:ring-blue-500"
            title="切换动画速度"
          >
            <option :value="300">快</option>
            <option :value="600">中</option>
            <option :value="900">慢</option>
          </select>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-base">🎭</span>
            <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap" :class="{ 'hidden': !isExpanded }">
              动画样式
            </span>
          </div>
          <select
            :value="animationStyle"
            @change="emit('update:animationStyle', $event.target.value)"
            class="text-[10px] border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 w-16 focus:outline-none focus:ring-1 focus:ring-blue-500"
            title="切换动画效果"
          >
            <option value="circle">圆形</option>
            <option value="wave">波浪</option>
            <option value="wipe">擦除</option>
            <option value="fade">淡入</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>
