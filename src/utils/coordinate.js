/**
 * 坐标转换工具函数
 * 
 * 坐标系说明：
 * - 屏幕坐标：鼠标事件的 clientX/clientY，原点在视口左上角，Y 轴向下
 * - SVG 坐标：SVG 画布内的坐标，受 viewBox 影响
 * - 数据坐标：hanzi-writer-data 格式，1024×1024，原点在左下角，Y 轴向上
 */

/**
 * 将屏幕坐标转换为 SVG 坐标
 * @param {number} clientX - 鼠标 X 坐标
 * @param {number} clientY - 鼠标 Y 坐标
 * @param {DOMRect} svgRect - SVG 元素的 getBoundingClientRect()
 * @param {Object} viewBox - SVG 的 viewBox { x, y, width, height }
 * @returns {{ x: number, y: number }} SVG 坐标
 */
export function screenToSvg(clientX, clientY, svgRect, viewBox) {
  const x = viewBox.x + ((clientX - svgRect.left) / svgRect.width) * viewBox.width
  const y = viewBox.y + ((clientY - svgRect.top) / svgRect.height) * viewBox.height
  return { x, y }
}

/**
 * 将 SVG 坐标转换为数据坐标（Y 轴翻转）
 * SVG viewBox 坐标 Y 轴向下，数据坐标 Y 轴向上
 * SVG 根元素有 transform="scale(1,-1) translate(0,-1024)" 翻转，
 * 但 viewBox 值本身仍是 SVG 显示坐标，需要手动转换
 * @param {number} svgX - SVG X 坐标
 * @param {number} svgY - SVG Y 坐标
 * @returns {{ x: number, y: number }} 数据坐标
 */
export function svgToData(svgX, svgY) {
  return {
    x: Math.round(svgX),
    y: Math.round(1024 - svgY)
  }
}

/**
 * 将数据坐标转换为 SVG 坐标
 * @param {number} dataX - 数据 X 坐标
 * @param {number} dataY - 数据 Y 坐标
 * @returns {{ x: number, y: number }} SVG 坐标
 */
export function dataToSvg(dataX, dataY) {
  return {
    x: dataX,
    y: dataY
  }
}

/**
 * 将屏幕坐标直接转换为数据坐标
 * @param {number} clientX - 鼠标 X 坐标
 * @param {number} clientY - 鼠标 Y 坐标
 * @param {DOMRect} svgRect - SVG 元素的 getBoundingClientRect()
 * @param {Object} viewBox - SVG 的 viewBox { x, y, width, height }
 * @returns {{ x: number, y: number }} 数据坐标
 */
export function screenToData(clientX, clientY, svgRect, viewBox) {
  const svgCoord = screenToSvg(clientX, clientY, svgRect, viewBox)
  return svgToData(svgCoord.x, svgCoord.y)
}

/**
 * 限制坐标在画布范围内
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @param {number} min - 最小值（默认 0）
 * @param {number} max - 最大值（默认 1024）
 * @returns {{ x: number, y: number }} 限制后的坐标
 */
export function clampToCanvas(x, y, min = 0, max = 1024) {
  return {
    x: Math.max(min, Math.min(max, x)),
    y: Math.max(min, Math.min(max, y))
  }
}
