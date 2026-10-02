/**
 * 数据导出工具函数
 * 
 * 将标注数据转换为 hanzi-writer-data 兼容格式
 * 
 * 输出格式：
 * {
 *   character: "字",
 *   strokes: ["M...Q...Z", ...],     // 每笔的 SVG 封闭路径
 *   medians: [[[x,y],...], ...],     // 每笔的中线坐标点序列
 *   radStrokes: []                    // 部首笔画索引（暂不使用）
 * }
 */

/**
 * 将标注数据导出为 hanzi-writer-data 格式
 * @param {string} character - 汉字
 * @param {Array} strokesData - 笔画数据
 * @param {Array} outlineData - 轮廓数据
 * @returns {Object} 导出的 JSON 数据
 */
export function formatExportData(character, strokesData, outlineData) {
  const strokes = []
  const medians = []

  strokesData.forEach((stroke, index) => {
    // 导出中线（medians）
    const medianPoints = stroke.medianPoints.map(p => [p.x, p.y])
    medians.push(medianPoints)

    // 导出轮廓路径（strokes）
    const outline = outlineData[index]
    if (outline && outline.path) {
      strokes.push(outline.path)
    } else {
      // 如果没有轮廓，用空字符串占位
      strokes.push('')
    }
  })

  return {
    character,
    strokes,
    medians,
    radStrokes: []
  }
}

/**
 * 将导出数据序列化为 JSON 字符串
 * @param {Object} data - 导出数据
 * @returns {string} JSON 字符串
 */
export function serializeToJSON(data) {
  return JSON.stringify(data, null, 2)
}

/**
 * 触发浏览器下载 JSON 文件
 * @param {string} jsonStr - JSON 字符串
 * @param {string} filename - 文件名
 */
export function downloadJSON(jsonStr, filename) {
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 导出数据到剪贴板
 * @param {string} jsonStr - JSON 字符串
 */
export async function copyToClipboard(jsonStr) {
  try {
    await navigator.clipboard.writeText(jsonStr)
    return true
  } catch (err) {
    console.error('复制到剪贴板失败:', err)
    return false
  }
}

/**
 * 验证导出数据的有效性
 * @param {Object} data - 导出数据
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateExportData(data) {
  const errors = []

  if (!data.character) {
    errors.push('缺少汉字')
  }

  if (!data.strokes || data.strokes.length === 0) {
    errors.push('没有笔画数据')
  }

  if (!data.medians || data.medians.length === 0) {
    errors.push('没有中线数据')
  }

  if (data.strokes && data.medians && data.strokes.length !== data.medians.length) {
    errors.push('strokes 和 medians 数量不一致')
  }

  // 检查每个笔画的数据
  data.medians?.forEach((median, index) => {
    if (!median || median.length === 0) {
      errors.push(`第 ${index + 1} 笔没有中线点`)
    }
  })

  data.strokes?.forEach((stroke, index) => {
    if (!stroke || stroke.trim() === '') {
      errors.push(`第 ${index + 1} 笔没有轮廓路径`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}
