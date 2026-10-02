/**
 * 自动保存 composable
 * 
 * 使用 localStorage 自动保存标注进度：
 * - 每次操作后自动保存
 * - 重新打开时恢复上次进度
 * - 按汉字 key 存储，支持多字管理
 */
import { ref, watch, onMounted } from 'vue'
import { useStrokeData } from './useStrokeData'
import { useOutlineGeneration } from './useOutlineGeneration'

// localStorage key 前缀
const STORAGE_PREFIX = 'stroke_annotation_'

// 保存的 key 列表
const KEYS_KEY = 'stroke_annotation_keys'

export function useAutoSave() {
  const { strokes, currentStrokeIndex } = useStrokeData()
  const { outlineData, strokeWidth } = useOutlineGeneration()

  // 上次保存的汉字
  const lastSavedCharacter = ref('')

  // 保存状态
  const isSaving = ref(false)
  const lastSaveTime = ref(null)

  // 保存标注数据到 localStorage
  const save = (character) => {
    if (!character) return

    isSaving.value = true

    try {
      const key = STORAGE_PREFIX + character
      const data = {
        character,
        strokes: JSON.parse(JSON.stringify(strokes.value)),
        outlineData: JSON.parse(JSON.stringify(outlineData.value)),
        currentStrokeIndex: currentStrokeIndex.value,
        strokeWidth: strokeWidth.value,
        savedAt: new Date().toISOString()
      }

      localStorage.setItem(key, JSON.stringify(data))

      // 更新已保存的 key 列表
      updateSavedKeys(character)

      lastSavedCharacter.value = character
      lastSaveTime.value = new Date()
    } catch (err) {
      console.error('自动保存失败:', err)
    }

    isSaving.value = false
  }

  // 从 localStorage 加载标注数据
  const load = (character) => {
    if (!character) return false

    try {
      const key = STORAGE_PREFIX + character
      const jsonStr = localStorage.getItem(key)

      if (!jsonStr) return false

      const data = JSON.parse(jsonStr)

      // 恢复数据
      strokes.value = data.strokes || []
      outlineData.value = data.outlineData || []
      currentStrokeIndex.value = data.currentStrokeIndex || 0
      strokeWidth.value = data.strokeWidth || 80

      lastSavedCharacter.value = character
      return true
    } catch (err) {
      console.error('加载数据失败:', err)
      return false
    }
  }

  // 检查是否有已保存的数据
  const hasSavedData = (character) => {
    if (!character) return false
    const key = STORAGE_PREFIX + character
    return localStorage.getItem(key) !== null
  }

  // 删除已保存的数据
  const removeSavedData = (character) => {
    if (!character) return
    const key = STORAGE_PREFIX + character
    localStorage.removeItem(key)
    updateSavedKeys(character, true)
  }

  // 获取所有已保存的汉字列表
  const getSavedCharacters = () => {
    try {
      const keys = JSON.parse(localStorage.getItem(KEYS_KEY) || '[]')
      return keys
    } catch {
      return []
    }
  }

  // 更新已保存的 key 列表
  function updateSavedKeys(character, remove = false) {
    try {
      const keys = JSON.parse(localStorage.getItem(KEYS_KEY) || '[]')
      const index = keys.indexOf(character)

      if (remove) {
        if (index !== -1) keys.splice(index, 1)
      } else {
        if (index === -1) keys.push(character)
      }

      localStorage.setItem(KEYS_KEY, JSON.stringify(keys))
    } catch (err) {
      console.error('更新 key 列表失败:', err)
    }
  }

  // 监听数据变化，自动保存（防抖）
  let saveTimer = null
  const autoSave = (character) => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      save(character)
    }, 500) // 500ms 防抖
  }

  // 监听笔画数据变化
  watch(
    () => strokes.value,
    () => {
      if (lastSavedCharacter.value) {
        autoSave(lastSavedCharacter.value)
      }
    },
    { deep: true }
  )

  // 监听轮廓数据变化
  watch(
    () => outlineData.value,
    () => {
      if (lastSavedCharacter.value) {
        autoSave(lastSavedCharacter.value)
      }
    },
    { deep: true }
  )

  return {
    // 状态
    lastSavedCharacter,
    isSaving,
    lastSaveTime,

    // 操作
    save,
    load,
    hasSavedData,
    removeSavedData,
    getSavedCharacters,
    autoSave
  }
}
