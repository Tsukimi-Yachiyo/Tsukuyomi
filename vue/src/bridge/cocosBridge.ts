// src/bridge/cocosBridge.ts
import { eventBus, RootEvents } from '@/utils/eventBus';

interface BridgeMessage {
    from: 'vue' | 'cocos';
    type: string;
    data: any;
}

let cocosIframe: HTMLIFrameElement | null = null;

export function setCocosIframe(iframe: HTMLIFrameElement | null) {
    cocosIframe = iframe;
}

export function sendToCocos<T extends keyof RootEvents>(
    event: string,
    data: RootEvents[T]
) {
    const cocosEventName = event.startsWith('vue:') ? event : `vue:${event}`;
    
    if (cocosIframe && cocosIframe.contentWindow) {
        cocosIframe.contentWindow.postMessage({
            type: cocosEventName,
            data,
            from: 'vue' as const
        }, '*');
    } else {
        window.dispatchEvent(new CustomEvent(cocosEventName, { detail: data }));
    }
}

export function initCocosBridge() {
    const handler = (e: MessageEvent) => {
        if (e.data && typeof e.data === 'object') {
            const { type, data, from } = e.data as BridgeMessage;
            
            if (from === 'cocos' && type) {
                eventBus.emit(type as any, data);
            }
        }
    };
    
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
}