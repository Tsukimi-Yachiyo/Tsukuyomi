export interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  image?: string
}

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'project-start',
    date: '2025-01-10',
    title: '项目启动',
    description: '月读工作室正式立项《超时空辉夜姬》，确定技术栈为 Vue 3 + Cocos Creator 3.8。',
  },
  {
    id: 'prototype',
    date: '2025-03-20',
    title: '原型完成',
    description: '完成核心玩法原型，实现基础的角色移动与场景交互。',
  },
  {
    id: 'multiplayer',
    date: '2025-06-05',
    title: '多人联机上线',
    description: 'WebSocket 多人联机模块上线，支持玩家实时互动。',
  },
  {
    id: 'ai-chat',
    date: '2025-09-12',
    title: 'AI 对话系统',
    description: '集成 Spring AI + LangGraph，NPC 智能对话功能上线。',
  },
  {
    id: 'public-test',
    date: '2026-01-15',
    title: '公开测试',
    description: '首次公开测试开启，邀请玩家进入赛博世界体验。',
  },
]
