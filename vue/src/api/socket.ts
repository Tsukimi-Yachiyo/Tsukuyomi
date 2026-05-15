import protobuf from 'protobufjs';
import { eventBus } from '../utils/eventBus';
import { api } from './index';

export enum OpCode {
    PLAYER_MOVE = 1,
    CHAT = 2,
    BLOCK_INTERACTION = 3,
    PLAYER_JOIN_LEAVE = 4,
    PLAYER_POSITION = 5,
    ROOM_SYNC_FRAME = 100
}

export class SocketService {
    private ws: WebSocket | null = null;
    private root: protobuf.Root | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;

    private SpacePacket: protobuf.Type | null = null;
    private PlayerTransform: protobuf.Type | null = null;
    private PlayerChat: protobuf.Type | null = null;
    private BlockInteraction: protobuf.Type | null = null;
    private PlayerJoinLeave: protobuf.Type | null = null;
    private PlayerPosition: protobuf.Type | null = null;
    private RoomSyncFrame: protobuf.Type | null = null;

    constructor() {
        this.loadProto().then(() => this.setupEventListeners());
    }

    private setupEventListeners() {
        eventBus.on('network:send-player-move', (data) => this.sendPlayerMove(data));
        eventBus.on('network:send-chat', (data) => this.sendChat(data));
        eventBus.on('network:send-block-interaction', (data) => this.sendBlockInteraction(data));
    }

    private async loadProto() {
        try {
            const protoContent = await fetch('/proto/MoonSpace.proto');
            const protoText = await protoContent.text();
            this.root = protobuf.parse(protoText).root;

            this.SpacePacket = this.root.lookupType('com.kaguya.metaverse.protocol.SpacePacket');
            this.PlayerTransform = this.root.lookupType('com.kaguya.metaverse.protocol.PlayerTransform');
            this.PlayerChat = this.root.lookupType('com.kaguya.metaverse.protocol.PlayerChat');
            this.BlockInteraction = this.root.lookupType('com.kaguya.metaverse.protocol.BlockInteraction');
            this.PlayerJoinLeave = this.root.lookupType('com.kaguya.metaverse.protocol.PlayerJoinLeave');
            this.PlayerPosition = this.root.lookupType('com.kaguya.metaverse.protocol.PlayerPosition');
            this.RoomSyncFrame = this.root.lookupType('com.kaguya.metaverse.protocol.RoomSyncFrame');
            
            console.log('[Socket] Protobuf 协议加载完成');
        } catch (error) {
            console.error('[Socket] Protobuf 协议加载失败:', error);
        }
    }

    public async connect(roomId: number = 101) {
        try {
            const wsToken = await api.auth.getWsToken();
            console.log(`[Socket] Connected to ${wsToken}`);
            let baseUrl = import.meta.env.VITE_WS_URL;

            const token = wsToken.split('.')[0];
            const userId = wsToken.split('.')[1];
            
            if (!baseUrl) {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const host = window.location.host;
                baseUrl = `${protocol}//${host}`;
            }
            
            const connectUrl = `${baseUrl}/ws/room?roomId=${roomId}&userId=${userId}&token=${token}`;
            
            console.log(`[Socket] 尝试连接后端: ${connectUrl}`);
            this.ws = new WebSocket(connectUrl);
            this.ws.binaryType = 'arraybuffer';

            this.ws.onopen = () => {
                console.log('%c[Socket] 连接成功！', 'color: green; font-weight: bold;');
                this.reconnectAttempts = 0;
                eventBus.emit('socket:connected');
            };

            this.ws.onmessage = (event) => {
                if (event.data instanceof ArrayBuffer) {
                    this.dispatch(new Uint8Array(event.data));
                }
            };

            this.ws.onerror = (err) => {
                console.error('[Socket] 连接错误:', err);
                eventBus.emit('socket:error', err);
            };

            this.ws.onclose = (event) => {
                console.warn('[Socket] 连接已关闭:', event.code, event.reason);
                eventBus.emit('socket:disconnected', { code: event.code, reason: event.reason });
                this.tryReconnect(roomId);
            };
        } catch (error) {
            console.error('[Socket] 获取 Token 失败，无法连接:', error);
            this.tryReconnect(roomId);
        }
    }

    private tryReconnect(roomId: number) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[Socket] 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(roomId), this.reconnectDelay);
        } else {
            console.error('[Socket] 重连次数已达上限，停止重连');
        }
    }

    public disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    private dispatch(buffer: Uint8Array) {
        if (!this.SpacePacket) return;

        try {
            const outerPacket = this.SpacePacket.decode(buffer) as any;
            const { opcode, payload } = outerPacket;

            console.log(`[Socket] 收到封包 OpCode: ${opcode}, Payload长度: ${payload.length}`);

            switch (opcode) {
                case OpCode.PLAYER_MOVE:
                    if (this.PlayerTransform) {
                        const moveData = this.PlayerTransform.decode(payload);
                        console.log('[数据-移动]', moveData);
                        eventBus.emit('cocos:player-sync', moveData);
                    }
                    break;
                case OpCode.CHAT:
                    if (this.PlayerChat) {
                        const chatData = this.PlayerChat.decode(payload);
                        console.log('[数据-聊天]', chatData);
                        eventBus.emit('vue:new-chat', chatData);
                    }
                    break;
                case OpCode.BLOCK_INTERACTION:
                    if (this.BlockInteraction) {
                        const interactData = this.BlockInteraction.decode(payload);
                        console.log('[数据-地块交互]', interactData);
                        eventBus.emit('cocos:block-interaction', interactData);
                    }
                    break;
                case OpCode.PLAYER_JOIN_LEAVE:
                    if (this.PlayerJoinLeave) {
                        const joinData = this.PlayerJoinLeave.decode(payload);
                        console.log('[数据-玩家进出]', joinData);
                        eventBus.emit('cocos:player-join-leave', joinData);
                    }
                    break;
                case OpCode.PLAYER_POSITION:
                    if (this.PlayerPosition) {
                        const posData = this.PlayerPosition.decode(payload);
                        console.log('[数据-玩家位置]', posData);
                        eventBus.emit('cocos:player-position', posData);
                    }
                    break;
                case OpCode.ROOM_SYNC_FRAME:
                    if (this.RoomSyncFrame) {
                        const syncData = this.RoomSyncFrame.decode(payload);
                        console.log('[数据-帧同步]', syncData);
                        eventBus.emit('cocos:room-sync-frame', syncData);
                    }
                    break;
                default:
                    console.warn(`[Socket] 未知的 OpCode: ${opcode}`);
            }
        } catch (error) {
            console.error('[Socket] 解码失败，请检查 Proto 协议是否与后端一致:', error);
        }
    }

    private send(opcode: OpCode, type: protobuf.Type, payload: any) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('[Socket] 连接未就绪，无法发送消息');
            return;
        }
        
        if (!this.SpacePacket) {
            console.error('[Socket] Protobuf 未加载完成');
            return;
        }

        try {
            const innerBuffer = type.encode(type.create(payload)).finish();
            const outerMessage = this.SpacePacket.create({ opcode, payload: innerBuffer });
            const finalBuffer = this.SpacePacket.encode(outerMessage).finish();
            this.ws.send(finalBuffer as any);
        } catch (error) {
            console.error('[Socket] 发送消息失败:', error);
        }
    }

    public sendPlayerMove(data: any) {
        if (this.PlayerTransform) {
            this.send(OpCode.PLAYER_MOVE, this.PlayerTransform, data);
        }
    }

    public sendChat(data: any) {
        if (this.PlayerChat) {
            this.send(OpCode.CHAT, this.PlayerChat, data);
        }
    }

    public sendBlockInteraction(data: any) {
        if (this.BlockInteraction) {
            this.send(OpCode.BLOCK_INTERACTION, this.BlockInteraction, data);
        }
    }

    public isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}

export const socketService = new SocketService();
