<script setup>
/**
 * OutlineLayer.vue - 轮廓路径层
 * 
 * 功能：
 * - 渲染所有已完成笔画的轮廓（半透明）
 * - 当前编辑笔画的轮廓高亮显示
 * - 动画播放时显示播放进度
 */
import { computed } from 'vue'
import { useOutlineGeneration } from '@/composables/useOutlineGeneration'
import { useStrokeData } from '@/composables/useStrokeData'
import { useAnimationPreview } from '@/composables/useAnimationPreview'

const { outlineData } = useOutlineGeneration()
const { strokes, currentStrokeIndex } = useStrokeData()
const { isPlaying, currentAnimStrokeIndex } = useAnimationPreview()

// 非当前笔画的已完成轮廓（半透明显示）
const completedOutlines = computed(() => {
  const result = []
  for (let i = 0; i < outlineData.value.length; i++) {
    const outline = outlineData.value[i]
    if (outline && outline.path && i !== currentStrokeIndex.value) {
      // 动画播放时，只显示已播放的笔画
      if (isPlaying.value && i > currentAnimStrokeIndex.value) continue
      result.push({ path: outline.path, index: i })
    }
  }
  return result
})

// 当前编辑笔画的轮廓
const currentOutline = computed(() => {
  return outlineData.value[currentStrokeIndex.value] || null
})

// 当前轮廓路径
const currentOutlinePath = computed(() => {
  return currentOutline.value?.path || ''
})

// 是否有当前轮廓
const hasCurrentOutline = computed(() => {
  return currentOutline.value && currentOutlinePath.value
})
</script>

<template>
  <g class="outline-layer">
    <!-- 已完成笔画的轮廓（半透明） -->
    <path
      v-for="item in completedOutlines"
      :key="'completed-' + item.index"
      :d="item.path"
      fill="rgba(59, 130, 246, 0.1)"
      stroke="#93c5fd"
      stroke-width="1.5"
      stroke-linejoin="round"
      class="pointer-events-none"
    />
    
    <!-- 当前编辑笔画的轮廓（高亮） -->
    <path
      v-if="hasCurrentOutline"
      :d="currentOutlinePath"
      fill="rgba(59, 130, 246, 0.15)"
      stroke="#3b82f6"
      stroke-width="2"
      stroke-linejoin="round"
      class="pointer-events-none"
    />
  </g>
</template>

<style scoped>
.outline-layer {
  pointer-events: none;
}
</style>
