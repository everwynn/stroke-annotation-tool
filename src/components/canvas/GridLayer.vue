<script setup>
/**
 * GridLayer.vue - 网格辅助线层
 * 
 * 功能：
 * - 田字格辅助线（横竖中线 + 边框）
 * - 半透明灰色线条
 */
</script>

<template>
  <g class="grid-layer">
    <!-- 外边框 -->
    <rect 
      x="0" y="0" 
      width="1024" height="1024" 
      fill="none" 
      :stroke="'var(--svg-grid-border)'" 
      stroke-width="2"
    />
    
    <!-- 竖向中线 -->
    <line 
      x1="512" y1="0" 
      x2="512" y2="1024" 
      :stroke="'var(--svg-grid-line)'" 
      stroke-width="1" 
      stroke-dasharray="8,4"
    />
    
    <!-- 横向中线 -->
    <line 
      x1="0" y1="512" 
      x2="1024" y2="512" 
      :stroke="'var(--svg-grid-line)'" 
      stroke-width="1" 
      stroke-dasharray="8,4"
    />
    
    <!-- 对角线（可选，辅助定位） -->
    <line 
      x1="0" y1="0" 
      x2="1024" y2="1024" 
      :stroke="'var(--svg-grid-diagonal)'" 
      stroke-width="0.5"
    />
    <line 
      x1="1024" y1="0" 
      x2="0" y2="1024" 
      :stroke="'var(--svg-grid-diagonal)'" 
      stroke-width="0.5"
    />
  </g>
</template>

<style scoped>
.grid-layer {
  pointer-events: none;
}
</style>
