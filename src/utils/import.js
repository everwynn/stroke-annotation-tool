/**
 * 数据导入工具
 * 
 * 用于从 hanzi-writer-data 等外部数据源导入笔画数据
 */

/**
 * 解析 hanzi-writer 格式的 medians 数据
 * 
 * @param {Array} mediansData - medians 数组，格式：[[[x,y], [x,y], ...], ...]
 * @returns {Array<Array<{x: number, y: number}>>} 转换后的中线点数组（Y 轴翻转）
 */
export function parseMedians(mediansData) {
  if (!Array.isArray(mediansData)) {
    throw new Error('medians 数据必须是数组')
  }
  
  return mediansData.map((stroke, strokeIndex) => {
    if (!Array.isArray(stroke)) {
      throw new Error(`第 ${strokeIndex + 1} 笔的 medians 必须是数组`)
    }
    
    return stroke.map((point, pointIndex) => {
      if (!Array.isArray(point) || point.length !== 2) {
        throw new Error(`第 ${strokeIndex + 1} 笔第 ${pointIndex + 1} 个点格式错误，应为 [x, y]`)
      }
      
      const [x, y] = point
      
      if (typeof x !== 'number' || typeof y !== 'number') {
        throw new Error(`第 ${strokeIndex + 1} 笔第 ${pointIndex + 1} 个点坐标必须是数字`)
      }
      
      // 注意：hanzi-writer-data 使用 Y-down 坐标系，与参考字形渲染坐标系一致
      // 我们的工具内部也使用 Y-down 存储（SVG 显示坐标），通过父组 transform 翻转显示
      // 因此不需要做 Y 轴翻转
      return {
        x: Math.round(x),
        y: Math.round(y)
      }
    })
  })
}

/**
 * 从完整 JSON 数据中提取 medians
 * 
 * @param {string|Object} jsonData - JSON 字符串或对象
 * @returns {Array} medians 数组
 */
export function extractMediansFromJSON(jsonData) {
  let data = jsonData
  
  // 如果是字符串，先解析
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (e) {
      throw new Error('JSON 解析失败：' + e.message)
    }
  }
  
  // 检查是否包含 medians 字段
  if (data.medians && Array.isArray(data.medians)) {
    return data.medians
  }
  
  // 如果本身就是 medians 数组
  if (Array.isArray(data)) {
    return data
  }
  
  throw new Error('数据格式错误：未找到 medians 字段')
}

/**
 * 完整的导入流程：解析 JSON 并转换为工具内部格式
 * 
 * @param {string|Object} jsonData - JSON 字符串或对象
 * @returns {Array<Array<{x: number, y: number}>>} 转换后的笔画数据
 */
export function importStrokeData(jsonData) {
  const mediansData = extractMediansFromJSON(jsonData)
  return parseMedians(mediansData)
}
