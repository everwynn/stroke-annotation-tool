/**
 * 撤销/重做 composable
 * 
 * 管理操作历史栈：
 * - 每次操作推入状态快照
 * - 支持撤销 (Ctrl+Z) 和重做 (Ctrl+Shift+Z)
 * - 历史栈深度限制（默认 50 步）
 */
import { ref, computed } from 'vue'
import { useStrokeData } from './useStrokeData'
import { useOutlineGeneration } from './useOutlineGeneration'

// 历史栈
const undoStack = ref([]) // 撤销栈
const redoStack = ref([]) // 重做栈

// 历史栈最大深度
const MAX_HISTORY = 50

// 是否正在恢复状态（防止记录恢复操作本身）
let isRestoring = false

// 是否跳过下一次自动保存（防止撤销/重做后的 watch 触发清空重做栈）
let skipNextSnapshot = false

export function useHistory() {
  const { strokes, currentStrokeIndex, selectedPointIndex } = useStrokeData()
  const { outlineData } = useOutlineGeneration()

  // 是否可以撤销
  const canUndo = computed(() => undoStack.value.length > 0)

  // 是否可以重做
  const canRedo = computed(() => redoStack.value.length > 0)

  // 保存当前状态快照
  const saveSnapshot = () => {
    if (isRestoring) return
    
    // 跳过撤销/重做后的自动保存（防止清空重做栈）
    if (skipNextSnapshot) {
      skipNextSnapshot = false
      return
    }

    const snapshot = {
      strokes: JSON.parse(JSON.stringify(strokes.value)),
      outlineData: JSON.parse(JSON.stringify(outlineData.value)),
      currentStrokeIndex: currentStrokeIndex.value,
      selectedPointIndex: selectedPointIndex.value
    }

    undoStack.value.push(snapshot)

    // 限制历史栈深度
    if (undoStack.value.length > MAX_HISTORY) {
      undoStack.value.shift()
    }

    // 新操作清空重做栈
    redoStack.value = []
  }

  // 撤销
  const undo = () => {
    if (!canUndo.value) return

    isRestoring = true

    // 保存当前状态到重做栈
    const currentSnapshot = {
      strokes: JSON.parse(JSON.stringify(strokes.value)),
      outlineData: JSON.parse(JSON.stringify(outlineData.value)),
      currentStrokeIndex: currentStrokeIndex.value,
      selectedPointIndex: selectedPointIndex.value
    }
    redoStack.value.push(currentSnapshot)

    // 恢复上一个状态
    const prevSnapshot = undoStack.value.pop()
    restoreSnapshot(prevSnapshot)

    isRestoring = false
    skipNextSnapshot = true  // 跳过 watch 触发的自动保存
  }

  // 重做
  const redo = () => {
    if (!canRedo.value) return

    isRestoring = true

    // 保存当前状态到撤销栈
    const currentSnapshot = {
      strokes: JSON.parse(JSON.stringify(strokes.value)),
      outlineData: JSON.parse(JSON.stringify(outlineData.value)),
      currentStrokeIndex: currentStrokeIndex.value,
      selectedPointIndex: selectedPointIndex.value
    }
    undoStack.value.push(currentSnapshot)

    // 恢复重做栈中的状态
    const nextSnapshot = redoStack.value.pop()
    restoreSnapshot(nextSnapshot)

    isRestoring = false
    skipNextSnapshot = true  // 跳过 watch 触发的自动保存
  }

  // 恢复状态快照
  function restoreSnapshot(snapshot) {
    strokes.value = JSON.parse(JSON.stringify(snapshot.strokes))
    outlineData.value = JSON.parse(JSON.stringify(snapshot.outlineData))
    currentStrokeIndex.value = snapshot.currentStrokeIndex
    selectedPointIndex.value = snapshot.selectedPointIndex
  }

  // 清空历史
  const clearHistory = () => {
    undoStack.value = []
    redoStack.value = []
  }

  return {
    // 状态
    canUndo,
    canRedo,

    // 操作
    saveSnapshot,
    undo,
    redo,
    clearHistory
  }
}
