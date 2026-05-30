# 项目历史页（开发时间线）设计文档

## 概述

一个横向滚动的开发时间线页面，展示项目从启动到当前的里程碑事件。极简黑白风格，节点随机上下曲折排列，间距按时间差计算。

## 数据结构

数据文件：`src/data/timeline.ts`

```ts
interface TimelineEvent {
  id: string
  date: string          // ISO 日期，如 '2025-03-15'
  title: string         // 事件标题
  description: string   // 详细描述
  image?: string        // 可选配图路径
}

export const timelineEvents: TimelineEvent[] = [
  // 示例条目，需用户填充实际内容
  {
    id: 'project-start',
    date: '2025-01-10',
    title: '项目启动',
    description: '月读工作室正式立项《超时空辉夜姬》。',
  },
]
```

Y 轴曲折偏移使用固定数组 `[-80, 60, -40, 90, -60, 50, -100, 70]` 循环应用，保证视觉稳定。

## 页面布局

### 路由

新增路由 `/history` → `HistoryPage.vue`，在 `src/router/index.ts` 中注册。

### 文件结构

```
src/
  page/HistoryPage.vue              # 主页面
  data/timeline.ts                  # 时间线数据
  components/history/
    TimelineNode.vue                # 单个节点组件
    TimelineLine.vue                # 连接线 SVG 组件
```

### 滚动机制

- 页面根容器 `overflow-x: auto; overflow-y: hidden; height: 100vh`
- 监听 `wheel` 事件，将 `deltaY` 转换为 `scrollLeft` 变化
- 底层容器宽度根据数据动态计算：`totalWidth = Math.max(eventCount * minSpacing, (lastDate - firstDate) / totalDays * contentScale) + padding * 2`
- `minSpacing` = 400px（节点最小间距），`contentScale` = 3（每天对应的像素宽度），`padding` = 400px
- 若只有一个事件，容器宽度 = `padding * 2 + minSpacing`

### 节点定位

- `position: absolute` + `transform: translate(x, y)`
- X 坐标：`(eventDate - startDate) / totalDays * contentWidth + leftPadding`
- Y 坐标：`centerY + offsets[index % offsets.length]`

### 连接线

- SVG overlay，与容器等大，`pointer-events: none`
- `<polyline>` 按节点顺序连线
- `stroke: rgba(255,255,255,0.2)`，节点处加粗

## 视觉设计

### 极简黑白风格

| 元素 | 样式 |
|------|------|
| 背景 | `#000` |
| 主文字 | `#fff` / `rgba(255,255,255,0.7)` |
| 描述文字 | `rgba(255,255,255,0.5)` |
| 连接线 | `rgba(255,255,255,0.2)` |
| 节点圆点 | 白色实心，4px |
| 卡片边框 | `1px solid rgba(255,255,255,0.1)` |

### 卡片布局

- 节点圆点 + 卡片
- 卡片在圆点上方或下方，由 Y 偏移方向决定（偏移为负 → 卡片在下方，偏移为正 → 卡片在上方）
- 卡片内容从上到下：日期、标题、描述、可选图片
- 固定最大宽度 280px

### 交互效果

- **hover 节点**：圆点放大 + 发光，卡片边框变亮，轻微上浮
- **加载动画**：节点从左到右依次淡入（staggered fade-in）
- **滚动提示**：页面左右边缘半透明渐变遮罩，暗示可滚动

### 响应式

- 节点卡片在小屏幕上缩小 max-width
- 最小间距保底，避免节点重叠

## 实现要点

1. **wheel 事件转换**：`e.preventDefault()` + `scrollLeft += e.deltaY`，平滑滚动用 `behavior: 'smooth'`
2. **动态宽度计算**：根据最早和最晚事件的时间差计算总宽度，确保稀疏事件不会挤在一起
3. **SVG 连接线**：用 `<polyline points="x1,y1 x2,y2 ...">` 绘制
4. **卡片方向自适应**：根据 Y 偏移正负决定卡片在圆点上方还是下方
5. **Tailwind CSS**：所有样式用 Tailwind 实用类，遵循 CLAUDE.md 规范
