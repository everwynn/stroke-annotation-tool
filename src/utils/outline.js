/**
 * 轮廓偏移算法
 * 
 * 用于沿中线生成外轮廓
 * 算法：等宽偏移 - 沿中线法线方向两侧各偏移半个笔画宽度
 */

/**
 * 计算点的法线方向（垂直于切线方向）
 * @param {{x: number, y: number}} prev - 前一个点
 * @param {{x: number, y: number}} curr - 当前点
 * @param {{x: number, y: number}} next - 后一个点
 * @returns {{x: number, y: number}} 单位法线向量
 */
function calculateNormal(prev, curr, next) {
  // 计算切线方向（前后点的平均方向）
  let tx, ty
  
  if (!prev && next) {
    // 起点：使用到下一个点的方向
    tx = next.x - curr.x
    ty = next.y - curr.y
  } else if (prev && !next) {
    // 终点：使用前一个点到当前点的方向
    tx = curr.x - prev.x
    ty = curr.y - prev.y
  } else if (prev && next) {
    // 中间点：使用前后点的平均方向
    tx = next.x - prev.x
    ty = next.y - prev.y
  } else {
    // 只有一个点，无法计算法线
    return { x: 0, y: 1 }
  }
  
  // 计算法线（切线逆时针旋转90度）
  const len = Math.sqrt(tx * tx + ty * ty)
  if (len === 0) return { x: 0, y: 1 }
  
  // 法线方向：(-ty, tx) / len
  return {
    x: -ty / len,
    y: tx / len
  }
}

/**
 * 沿中线生成变宽偏移轮廓
 * 
 * @param {Array<{x: number, y: number, width?: number}>} medianPoints - 中线控制点（可选 width 字段）
 * @param {number} defaultWidth - 默认笔画宽度（当点未设置 width 时使用）
 * @returns {{ left: Array, right: Array, path: string }} 左右轮廓点和路径
 */
export function generateOffsetOutline(medianPoints, defaultWidth = 80) {
  if (medianPoints.length === 0) {
    return { left: [], right: [], path: '' }
  }
  
  if (medianPoints.length === 1) {
    // 只有一个点，生成一个圆形轮廓
    const p = medianPoints[0]
    const w = p.width ?? defaultWidth
    const r = w / 2
    return {
      left: [{ x: p.x - r, y: p.y }],
      right: [{ x: p.x + r, y: p.y }],
      path: `M ${p.x - r} ${p.y} A ${r} ${r} 0 1 0 ${p.x + r} ${p.y} A ${r} ${r} 0 1 0 ${p.x - r} ${p.y} Z`
    }
  }
  
  const leftPoints = []
  const rightPoints = []
  
  // 计算每个点的偏移位置（使用逐点宽度）
  for (let i = 0; i < medianPoints.length; i++) {
    const prev = i > 0 ? medianPoints[i - 1] : null
    const curr = medianPoints[i]
    const next = i < medianPoints.length - 1 ? medianPoints[i + 1] : null
    
    // 计算法线方向
    const normal = calculateNormal(prev, curr, next)
    
    // 获取当前点的有效宽度（未设置时使用默认宽度）
    const currWidth = curr.width ?? defaultWidth
    const halfWidth = currWidth / 2
    
    // 左侧偏移点（法线方向）
    leftPoints.push({
      x: Math.round(curr.x + normal.x * halfWidth),
      y: Math.round(curr.y + normal.y * halfWidth)
    })
    
    // 右侧偏移点（法线反方向）
    rightPoints.push({
      x: Math.round(curr.x - normal.x * halfWidth),
      y: Math.round(curr.y - normal.y * halfWidth)
    })
  }
  
  // 生成封闭路径
  // 路径顺序：左侧从左到右 -> 右侧从右到左 -> 闭合
  const path = generateClosedPath(leftPoints, rightPoints)
  
  return { left: leftPoints, right: rightPoints, path }
}

/**
 * 生成封闭轮廓路径
 * @param {Array} leftPoints - 左侧轮廓点
 * @param {Array} rightPoints - 右侧轮廓点
 * @returns {string} SVG 封闭路径
 */
function generateClosedPath(leftPoints, rightPoints) {
  if (leftPoints.length === 0 || rightPoints.length === 0) return ''
  
  let path = ''
  
  // 起点：左侧第一个点
  path += `M ${leftPoints[0].x} ${leftPoints[0].y}`
  
  // 左侧：从左到右（使用贝塞尔曲线）
  if (leftPoints.length > 2) {
    // 使用二次贝塞尔曲线平滑连接
    for (let i = 1; i < leftPoints.length - 1; i++) {
      const mid = {
        x: (leftPoints[i].x + leftPoints[i + 1].x) / 2,
        y: (leftPoints[i].y + leftPoints[i + 1].y) / 2
      }
      path += ` Q ${leftPoints[i].x} ${leftPoints[i].y} ${mid.x} ${mid.y}`
    }
    // 连接到左侧最后一个点
    path += ` L ${leftPoints[leftPoints.length - 1].x} ${leftPoints[leftPoints.length - 1].y}`
  } else if (leftPoints.length === 2) {
    path += ` L ${leftPoints[1].x} ${leftPoints[1].y}`
  }
  
  // 连接到右侧最后一个点（末端连接）
  path += ` L ${rightPoints[rightPoints.length - 1].x} ${rightPoints[rightPoints.length - 1].y}`
  
  // 右侧：从右到左（使用贝塞尔曲线）
  if (rightPoints.length > 2) {
    for (let i = rightPoints.length - 2; i > 0; i--) {
      const mid = {
        x: (rightPoints[i].x + rightPoints[i - 1].x) / 2,
        y: (rightPoints[i].y + rightPoints[i - 1].y) / 2
      }
      path += ` Q ${rightPoints[i].x} ${rightPoints[i].y} ${mid.x} ${mid.y}`
    }
    // 连接到右侧第一个点
    path += ` L ${rightPoints[0].x} ${rightPoints[0].y}`
  } else if (rightPoints.length === 2) {
    path += ` L ${rightPoints[0].x} ${rightPoints[0].y}`
  }
  
  // 闭合路径
  path += ' Z'
  
  return path
}

/**
 * 生成起笔/收笔的圆形端点
 * @param {{x: number, y: number}} point - 端点位置
 * @param {number} radius - 半径
 * @returns {string} 圆形路径
 */
export function generateCircleCap(point, radius) {
  return `M ${point.x - radius} ${point.y} A ${radius} ${radius} 0 1 0 ${point.x + radius} ${point.y} A ${radius} ${radius} 0 1 0 ${point.x - radius} ${point.y} Z`
}

/**
 * 计算轮廓的控制点（用于拖拽微调）
 * @param {Array} leftPoints - 左侧轮廓点
 * @param {Array} rightPoints - 右侧轮廓点
 * @returns {Array<{x: number, y: number, side: 'left'|'right', index: number}>} 控制点
 */
export function getOutlineControlPoints(leftPoints, rightPoints) {
  const points = []
  
  leftPoints.forEach((p, i) => {
    points.push({ ...p, side: 'left', index: i })
  })
  
  rightPoints.forEach((p, i) => {
    points.push({ ...p, side: 'right', index: i })
  })
  
  return points
}
