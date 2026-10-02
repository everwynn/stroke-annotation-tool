# 笔画标注工具 (Stroke Annotation Tool)

一个基于 Web 的汉字笔画人工标注工具，用于在 SVG 画布上描摹汉字笔画中线，自动生成等宽外轮廓路径。输出数据兼容 [hanzi-writer-data](https://github.com/chanind/hanzi-writer-data) 格式，可直接用于汉字笔画动画展示。

![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-8.2-646cff?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ 功能特性

- **SVG 画布标注** — 1024×1024 画布，支持滚轮缩放、拖拽平移、点击添加中线控制点
- **自动轮廓生成** — 基于中线点法线方向自动计算等宽外轮廓，生成封闭 SVG 路径
- **逐点宽度控制** — 每个中线点可独立设置笔画宽度，实现变宽笔画效果
- **轮廓手动微调** — 自动生成后可拖拽调整轮廓控制点，精细修正局部形状
- **参考字形显示** — 输入汉字后显示楷体半透明参考字形，辅助描摹定位
- **数据导入/导出** — 支持导入 hanzi-writer-data 格式 JSON，导出兼容格式
- **动画预览** — 按笔顺逐笔播放轮廓显示，模拟书写效果
- **撤销/重做** — 完整的操作历史栈（最大 50 步），支持键盘快捷键
- **自动保存** — 基于 localStorage 的标注进度自动持久化，按汉字 key 管理
- **深色模式** — 支持亮色/深色主题切换，提供 4 种 View Transition 动画效果
- **多字管理** — 支持同时标注多个汉字，搜索切换、独立保存

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`) |
| 构建工具 | [Vite](https://vite.dev/) |
| CSS 框架 | [Tailwind CSS v4](https://tailwindcss.com/) |
| 画布渲染 | 原生 SVG DOM（无第三方 SVG 库） |
| 状态管理 | Composable 全局单例模式（无 Pinia/Vuex） |
| 本地存储 | localStorage |

## 📦 快速开始

### 环境要求

- Node.js >= 22.18.0 或 >= 24.12.0
- npm

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器（热更新）
npm run dev

# 生产构建（类型检查 + 打包）
npm run build

# 预览生产构建
npm run preview
```

## 📖 使用指南

### 基本标注流程

1. **输入目标汉字** — 在顶部栏输入框中输入一个汉字，点击「确定」
2. **导入参考数据**（可选） — 点击「导入数据」按钮，粘贴 hanzi-writer-data 格式的 JSON
3. **描摹中线** — 在画布上依次点击，添加笔画中线控制点
4. **调整宽度** — 在左侧工具栏调节笔画宽度，或在右侧面板对单个点设置宽度
5. **微调轮廓** — 开启左侧「轮廓控制点」开关，拖拽红/绿手柄修正轮廓
6. **预览动画** — 点击底部「预览」按钮查看笔画动画效果
7. **导出数据** — 点击「导出」按钮下载 JSON 文件

### 画布操作

| 操作 | 方式 |
|------|------|
| 添加中线点 | 左键点击画布 |
| 拖拽控制点 | 左键按住控制点拖动 |
| 删除控制点 | 右键点击控制点 |
| 平移画布 | 中键拖拽 / Shift + 左键拖拽 |
| 缩放画布 | 鼠标滚轮 |
| 重置视图 | 点击右上角「重置视图」按钮 |

### 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Z` | 撤销 |
| `Ctrl + Shift + Z` / `Ctrl + Y` | 重做 |
| `Delete` / `Backspace` | 删除选中的控制点 |
| `Escape` | 取消选中 |

## 🏗 项目架构

### 目录结构

```
src/
├── components/
│   ├── canvas/                  # SVG 画布图层组件
│   │   ├── SvgCanvas.vue        # 画布容器（缩放/平移/坐标转换/编号覆盖层）
│   │   ├── GridLayer.vue        # 田字格辅助线
│   │   ├── ReferenceLayer.vue   # 参考字形层（楷体半透明）
│   │   ├── OutlineLayer.vue     # 轮廓路径渲染层
│   │   ├── MedianLayer.vue      # 中线贝塞尔曲线层
│   │   └── ControlPointLayer.vue# 控制点手柄层（拖拽/选中/删除）
│   ├── panel/                   # 右侧属性面板
│   │   ├── PropertyPanel.vue    # 面板容器
│   │   ├── CharInfo.vue         # 汉字基本信息
│   │   ├── StrokeList.vue       # 笔画列表管理
│   │   ├── MedianPointList.vue  # 中线点坐标列表
│   │   ├── PointWidthEditor.vue # 逐点宽度编辑器
│   │   └── SvgPathPreview.vue   # SVG 路径预览
│   ├── toolbar/                 # 工具栏组件
│   │   ├── LeftToolbar.vue      # 左侧工具栏（宽度/开关/动画设置）
│   │   ├── BottomToolbar.vue    # 底部工具栏（历史/导航/预览/导出）
│   │   ├── HistoryControls.vue  # 撤销/重做按钮
│   │   ├── StrokeNavigation.vue # 笔画导航（上一笔/下一笔）
│   │   ├── PreviewButton.vue    # 动画预览按钮
│   │   ├── ExportButton.vue     # 导出按钮
│   │   └── ImportDialog.vue     # 导入对话框
│   └── StrokeAnnotator.vue      # 主容器（标注工作台）
├── composables/                 # 全局状态管理（Composable 单例）
│   ├── useStrokeData.js         # 笔画数据管理（核心）
│   ├── useOutlineGeneration.js  # 轮廓生成与微调
│   ├── useHistory.js            # 撤销/重做历史栈
│   ├── useAutoSave.js           # localStorage 自动保存
│   ├── useDarkMode.js           # 深色模式 + View Transition 动画
│   ├── useKeyboardShortcuts.js  # 键盘快捷键绑定
│   └── useAnimationPreview.js   # 笔画动画预览
├── utils/                       # 工具函数
│   ├── bezier.js                # 贝塞尔曲线路径生成
│   ├── outline.js               # 等宽偏移轮廓算法
│   ├── coordinate.js            # 坐标系转换
│   ├── import.js                # hanzi-writer-data 导入解析
│   └── export.js                # 数据导出格式化
├── assets/
│   ├── main.css                 # 全局样式 + CSS 变量 + 深色模式
│   └── base.css                 # 基础重置样式
├── App.vue                      # 根组件
└── main.ts                      # 入口文件
```

### 核心数据流

```
用户点击画布
  → SvgCanvas.handleClick（屏幕坐标 → 数据坐标）
  → useStrokeData.addMedianPoint（存储中线点）
  → watch 触发 useOutlineGeneration.generateOutline
  → outline.js 算法计算等宽偏移轮廓
  → OutlineLayer 渲染轮廓路径
  → useAutoSave 自动保存到 localStorage
  → useHistory.saveSnapshot 记录撤销快照
```

### 坐标系说明

项目使用 **Y 轴向上**的数据坐标系（hanzi-writer-data 标准），通过 SVG 根元素的 `transform="scale(1,-1) translate(0,-1024)"` 映射到 SVG 显示空间：

- **数据坐标**：1024×1024，原点左下角，Y 轴向上
- **SVG 显示坐标**：原点左上角，Y 轴向下
- **坐标转换**：`dataY = 1024 - svgY`
- **用户交互**：使用 `getScreenCTM().inverse()` 将屏幕坐标转为 SVG 坐标，再转为数据坐标

## 📤 导出数据格式

导出的 JSON 兼容 hanzi-writer-data 格式：

```json
{
  "character": "字",
  "strokes": [
    "M 100 200 Q 200 150 300 200 L 300 250 Q 200 200 100 250 Z"
  ],
  "medians": [
    [[100, 225], [200, 175], [300, 225]]
  ],
  "radStrokes": []
}
```

| 字段 | 说明 |
|------|------|
| `character` | 汉字 |
| `strokes` | 每笔的 SVG 封闭路径（轮廓） |
| `medians` | 每笔的中线坐标点序列 |
| `radStrokes` | 部首笔画索引（保留字段，暂未使用） |

## 🌙 深色模式动画

基于 [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) 实现深色模式切换动画（Chrome 111+），不支持的浏览器自动降级为直接切换。

支持 4 种动画效果 × 3 种速度 = 12 种组合：

| 动画样式 | 效果描述 |
|----------|----------|
| 圆形扩散 (circle) | 从点击位置向外扩散/收缩 |
| 波浪展开 (wave) | 正弦波边缘从顶部展开 |
| 对角擦除 (wipe) | 矩形从右向左推进 |
| 淡入淡出 (fade) | 透明度渐变（兼容性最佳） |

## 📋 开发说明

### IDE 推荐配置

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 插件（需禁用 Vetur）
- 安装 [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 浏览器扩展

### 类型检查

```bash
npm run type-check
```

### 代码构建

```bash
npm run build-only
```

## 📄 License

[MIT](https://opensource.org/licenses/MIT)
