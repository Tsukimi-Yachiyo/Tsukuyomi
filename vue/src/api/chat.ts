import protobuf from 'protobufjs';
import { eventBus } from '../utils/eventBus';
import { api } from './index';

export class ChatSocketService {
    private ws: WebSocket | null = null;
    private root: protobuf.Root | null = null;
    private Chat: protobuf.Type | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;
    private manualClose = false;

    constructor() {
        this.loadProto().then(() => this.setupEventListeners());
    }

    private setupEventListeners() {
        eventBus.on('chat:send-message', (data) => this.sendChatMessage(data));
    }

    private async loadProto() {
        try {
            const protoContent = await fetch('/proto/Chat.proto');
            const protoText = await protoContent.text();
            this.root = protobuf.parse(protoText).root;
            this.Chat = this.root.lookupType('com.kaguya.metaverse.protocol.Chat');
            console.log('[ChatSocket] Protobuf 协议加载完成');
        } catch (error) {
            console.error('[ChatSocket] Protobuf 协议加载失败:', error);
        }
    }

    public async connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            const wsToken = await api.auth.getWsToken();
            let baseUrl = import.meta.env.VITE_WS_URL;

            const token = wsToken.split('.')[0];
            const userId = wsToken.split('.')[1];

            if (!baseUrl) {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const host = window.location.host;
                baseUrl = `${protocol}//${host}`;
            }

            this.manualClose = false;
            const connectUrl = `${baseUrl}/ws/chat?userId=${userId}&token=${token}`;
            console.log(`[ChatSocket] 尝试连接: ${connectUrl}`);
            this.ws = new WebSocket(connectUrl);
            this.ws.binaryType = 'arraybuffer';

            this.ws.onopen = () => {
                console.log('%c[ChatSocket] 连接成功', 'color: green; font-weight: bold;');
                this.reconnectAttempts = 0;
                eventBus.emit('chat:connected');
            };

            this.ws.onmessage = (event) => {
                if (event.data instanceof ArrayBuffer) {
                    this.dispatch(new Uint8Array(event.data));
                }
            };

            this.ws.onerror = (err) => {
                console.error('[ChatSocket] 连接错误:', err);
                eventBus.emit('chat:error', err);
            };

            this.ws.onclose = (event) => {
                console.warn('[ChatSocket] 连接已关闭:', event.code, event.reason);
                eventBus.emit('chat:disconnected', { code: event.code, reason: event.reason });
                if (!this.manualClose) {
                    this.tryReconnect();
                }
            };
        } catch (error) {
            console.error('[ChatSocket] 获取 Token 失败:', error);
            this.tryReconnect();
        }
    }

    private tryReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[ChatSocket] 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(), this.reconnectDelay);
        } else {
            console.error('[ChatSocket] 重连次数已达上限');
        }
    }

    public disconnect() {
        this.manualClose = true;
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    private dispatch(buffer: Uint8Array) {
        if (!this.Chat) return;

        try {
            const chatData = this.Chat.decode(buffer) as any;
            console.log('[ChatSocket] 收到消息:', chatData);
            eventBus.emit('chat:received', chatData);
        } catch (error) {
            console.error('[ChatSocket] 解码失败:', error);
        }
    }

    public sendChatMessage(data: { fromId: number; toId: number; toType: number; message: string }) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('[ChatSocket] 连接未就绪');
            return;
        }
        if (!this.Chat) {
            console.error('[ChatSocket] Protobuf 未加载完成');
            return;
        }

        try {
            const chatMessage = this.Chat.create({
                from_id: data.fromId,
                to_id: data.toId,
                to_type: data.toType,
                message: data.message,
            });
            const buffer = this.Chat.encode(chatMessage).finish();
            this.ws.send(buffer as any);
            console.log('[ChatSocket] 发送消息成功');
        } catch (error) {
            console.error('[ChatSocket] 发送消息失败:', error);
        }
    }

    public isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}

export const chatSocketService = new ChatSocketService();
