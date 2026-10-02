/**
 * 键盘快捷键 composable
 * 
 * 绑定常用操作的键盘快捷键：
 * - Ctrl+Z: 撤销
 * - Ctrl+Shift+Z / Ctrl+Y: 重做
 * - Delete/Backspace: 删除选中的控制点
 * - Escape: 取消选中
 */
import { onMounted, onUnmounted } from 'vue'
import { useHistory } from './useHistory'
import { useStrokeData } from './useStrokeData'

export function useKeyboardShortcuts() {
  const { undo, redo, canUndo, canRedo } = useHistory()
  const { selectedPointIndex, deleteMedianPoint, clearSelection } = useStrokeData()

  // 键盘事件处理
  const handleKeyDown = (e) => {
    // 忽略输入框内的快捷键
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return
    }

    // Ctrl+Z: 撤销
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      if (canUndo.value) {
        undo()
      }
      return
    }

    // Ctrl+Shift+Z 或 Ctrl+Y: 重做
    if ((e.ctrlKey && e.key === 'z' && e.shiftKey) || (e.ctrlKey && e.key === 'y')) {
      e.preventDefault()
      if (canRedo.value) {
        redo()
      }
      return
    }

    // Delete/Backspace: 删除选中的控制点
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPointIndex.value >= 0) {
      e.preventDefault()
      deleteMedianPoint(selectedPointIndex.value)
      return
    }

    // Escape: 取消选中
    if (e.key === 'Escape') {
      e.preventDefault()
      clearSelection()
      return
    }
  }

  // 注册键盘事件
  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  // 移除键盘事件
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return {
    handleKeyDown
  }
}
