<script setup>
/**
 * ReferenceLayer.vue - 参考字形层
 * 
 * 功能：
 * - 输入汉字，渲染半透明楷体字作为描摹参考
 * - 使用 SVG <text> 元素
 * 
 * 注意：
 * - <text> 元素需要单独翻转，因为它不在已翻转的 <g> 内
 */
import { computed } from 'vue'

const props = defineProps({
  character: {
    type: String,
    default: ''
  }
})

// 是否显示参考字形
const showReference = computed(() => props.character && props.character.length > 0)
</script>

<template>
  <g v-if="showReference" class="reference-layer">
    <!-- 
      参考字形渲染
      - 使用楷体作为参考字体
      - 半透明显示，不干扰标注操作
      - 需要翻转坐标系（因为父级 <g> 已翻转，这里需要再翻转回来让文字正向显示）
    -->
    <text
      x="512"
      y="512"
      text-anchor="middle"
      dominant-baseline="central"
      font-family="KaiTi, STKaiti, SimKai, serif"
      font-size="800"
      :fill="'var(--svg-ref-fill)'"
      transform="scale(1,-1) translate(0,-1024)"
    >
      {{ character }}
    </text>
  </g>
</template>

<style scoped>
.reference-layer {
  pointer-events: none;
}
</style>
