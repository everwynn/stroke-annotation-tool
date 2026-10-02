/**
 * 贝塞尔曲线工具函数
 * 
 * 用于将离散的控制点序列转换为平滑的贝塞尔曲线
 */

/**
 * 使用二次贝塞尔曲线（Q 命令）连接控制点
 * 算法：以相邻点的中点作为锚点，控制点为原始点
 * 
 * @param {Array<{x: number, y: number}>} points - 控制点数组
 * @returns {string} SVG 路径字符串
 */
export function pointsToQuadraticBezierPath(points) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  
  let path = `M ${points[0].x} ${points[0].y}`
  
  if (points.length === 2) {
    // 两个点，直接连线
    path += ` L ${points[1].x} ${points[1].y}`
    return path
  }
  
  // 三个及以上点，使用二次贝塞尔曲线
  // 从第一个点到第二个点的中点
  const firstMid = {
    x: (points[0].x + points[1].x) / 2,
    y: (points[0].y + points[1].y) / 2
  }
  path += ` L ${firstMid.x} ${firstMid.y}`
  
  // 中间点使用 Q 命令
  for (let i = 1; i < points.length - 1; i++) {
    const mid = {
      x: (points[i].x + points[i + 1].x) / 2,
      y: (points[i].y + points[i + 1].y) / 2
    }
    path += ` Q ${points[i].x} ${points[i].y} ${mid.x} ${mid.y}`
  }
  
  // 最后一个点
  const last = points[points.length - 1]
  path += ` L ${last.x} ${last.y}`
  
  return path
}

/**
 * 使用 Catmull-Rom 样条转换为贝塞尔曲线
 * 曲线会经过所有控制点，更平滑
 * 
 * @param {Array<{x: number, y: number}>} points - 控制点数组
 * @param {number} tension - 张力参数（0-1，默认 0.5）
 * @returns {string} SVG 路径字符串（使用 C 命令）
 */
export function pointsToCatmullRomPath(points, tension = 0.5) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  }
  
  let path = `M ${points[0].x} ${points[0].y}`
  
  // 添加虚拟的起始和结束点，用于计算第一个和最后一个曲线段
  const extendedPoints = [
    { x: points[0].x * 2 - points[1].x, y: points[0].y * 2 - points[1].y },
    ...points,
    { 
      x: points[points.length - 1].x * 2 - points[points.length - 2].x, 
      y: points[points.length - 1].y * 2 - points[points.length - 2].y 
    }
  ]
  
  for (let i = 1; i < extendedPoints.length - 2; i++) {
    const p0 = extendedPoints[i - 1]
    const p1 = extendedPoints[i]
    const p2 = extendedPoints[i + 1]
    const p3 = extendedPoints[i + 2]
    
    // 计算贝塞尔控制点
    const cp1x = p1.x + (p2.x - p0.x) * tension / 3
    const cp1y = p1.y + (p2.y - p0.y) * tension / 3
    const cp2x = p2.x - (p3.x - p1.x) * tension / 3
    const cp2y = p2.y - (p3.y - p1.y) * tension / 3
    
    path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`
  }
  
  return path
}

/**
 * 计算两点之间的距离
 * @param {{x: number, y: number}} p1 - 点 1
 * @param {{x: number, y: number}} p2 - 点 2
 * @returns {number} 距离
 */
export function distance(p1, p2) {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 计算点在线段上的投影（用于 hit-test）
 * @param {{x: number, y: number}} point - 测试点
 * @param {{x: number, y: number}} lineStart - 线段起点
 * @param {{x: number, y: number}} lineEnd - 线段终点
 * @returns {{ distance: number, point: {x: number, y: number} }} 距离和投影点
 */
export function pointToLineDistance(point, lineStart, lineEnd) {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  const lenSq = dx * dx + dy * dy
  
  if (lenSq === 0) {
    // 线段退化为点
    const dist = distance(point, lineStart)
    return { distance: dist, point: lineStart }
  }
  
  let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  
  const proj = {
    x: lineStart.x + t * dx,
    y: lineStart.y + t * dy
  }
  
  return {
    distance: distance(point, proj),
    point: proj
  }
}
