// 文件路径：src/utils/eventBus.ts
import mitt from 'mitt';

export type RootEvents = {
    // Vue 发送给 Cocos 的事件 (以 vue: 开头)
    'vue:login-success': { token: string };
    'vue:change-theme': { isDark: boolean };

    // 全局弹幕消息事件
    'vue:show-message': { text: string; type?: 'success' | 'error' | 'warning' | 'info' };

    // Cocos 发送给 Vue 的事件 (以 cocos: 开头)
    'cocos:trigger-ui': { uiType: 'store' | 'profile' | 'document'; data?: any };
    'cocos:engine-ready': void;
    'cocos:player-sync': any;
    'cocos:block-interaction': any;
    'cocos:player-join-leave': any;
    'cocos:player-position': any;
    'cocos:room-sync-frame': any;
    'cocos:new-chat': any;

    // Socket 事件
    'socket:connected': void;
    'socket:disconnected': { code: number; reason: string };
    'socket:error': any;

    // 网络发送事件
    'network:send-player-move': any;
    'network:send-chat': any;
    'network:send-block-interaction': any;
};

export const eventBus = mitt<RootEvents>();