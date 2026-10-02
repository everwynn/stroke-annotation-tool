<script setup>
/**
 * PreviewButton.vue - 预览动画按钮组件
 * 
 * 功能：
 * - 播放/暂停/重播控制
 * - 动画速度调节
 * - 动画播放时显示进度
 */
import { useAnimationPreview } from '@/composables/useAnimationPreview'
import { useStrokeData } from '@/composables/useStrokeData'

const { 
  isPlaying, 
  currentAnimStrokeIndex,
  animationSpeed,
  play, 
  pause, 
  stop,
  replay,
  setSpeed
} = useAnimationPreview()

const { strokes } = useStrokeData()
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- 动画速度 -->
    <div v-if="strokes.length > 0" class="flex items-center gap-1">
      <label class="text-xs text-gray-500 dark:text-gray-400">速度:</label>
      <select
        :value="animationSpeed"
        @change="setSpeed(Number($event.target.value))"
        class="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
      >
        <option :value="400">快</option>
        <option :value="800">中</option>
        <option :value="1200">慢</option>
      </select>
    </div>
    
    <!-- 播放控制 -->
    <template v-if="!isPlaying">
      <button 
        @click="play"
        :disabled="strokes.length === 0"
        class="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ▶ 预览动画
      </button>
    </template>
    
    <template v-else>
      <button 
        @click="pause"
        class="px-3 py-1.5 text-sm bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 rounded"
      >
        ⏸ 暂停
      </button>
      <button 
        @click="stop"
        class="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded"
      >
        ⏹ 停止
      </button>
    </template>
    
    <!-- 重播 -->
    <button 
      v-if="!isPlaying && strokes.length > 0"
      @click="replay"
      class="px-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
      title="重播"
    >
      ↻
    </button>
    
    <!-- 播放进度 -->
    <span v-if="isPlaying" class="text-xs text-blue-600 dark:text-blue-400">
      {{ currentAnimStrokeIndex + 1 }} / {{ strokes.length }}
    </span>
  </div>
</template>
