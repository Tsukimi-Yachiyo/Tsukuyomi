import protobuf from 'protobufjs';
import { eventBus } from '../utils/eventBus';
import { api } from './index';

export enum OpCode {
    CHAT = 0,
    PLAYER_MOVE = 1,
    BLOCK_INTERACTION = 3,
    PLAYER_JOIN_LEAVE = 4,
    PLAYER_POSITION = 5,
    ROOM_SYNC_FRAME = 100,
}

class SocketService {
    private ws: WebSocket | null = null;
    private SpacePacket: protobuf.Type | null = null;
    private PlayerTransform: protobuf.Type | null = null;
    private Chat: protobuf.Type | null = null;
    private BlockInteraction: protobuf.Type | null = null;
    private PlayerJoinLeave: protobuf.Type | null = null;
    private PlayerPosition: protobuf.Type | null = null;
    private RoomSyncFrame: protobuf.Type | null = null;

    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;
    private manualClose = false;
    private protoLoaded = false;
    private currentRoomId = 101;

    constructor() {
        this.loadProto();
    }

    private setupEventListeners() {
        eventBus.on('network:send-player-move', (data) => this.sendPlayerMove(data));
        eventBus.on('network:send-chat', (data) => this.sendChat(data));
        eventBus.on('network:send-block-interaction', (data) => this.sendBlockInteraction(data));
    }

    private async loadProto() {
        try {
            const spaceRes = await fetch('/proto/MoonSpace.proto');
            const spaceRoot = protobuf.parse(await spaceRes.text()).root;

            this.SpacePacket = spaceRoot.lookupType('com.kaguya.metaverse.protocol.SpacePacket');
            this.PlayerTransform = spaceRoot.lookupType('com.kaguya.metaverse.protocol.PlayerTransform');
            this.BlockInteraction = spaceRoot.lookupType('com.kaguya.metaverse.protocol.BlockInteraction');
            this.PlayerJoinLeave = spaceRoot.lookupType('com.kaguya.metaverse.protocol.PlayerJoinLeave');
            this.PlayerPosition = spaceRoot.lookupType('com.kaguya.metaverse.protocol.PlayerPosition');
            this.RoomSyncFrame = spaceRoot.lookupType('com.kaguya.metaverse.protocol.RoomSyncFrame');
            this.Chat = spaceRoot.lookupType('com.kaguya.metaverse.protocol.Chat');

            this.protoLoaded = true;
            this.setupEventListeners();
            console.log('[Socket] Protobuf 加载完成');
        } catch (error) {
            console.error('[Socket] Protobuf 加载失败:', error);
        }
    }

    public async connect(roomId: number = 101) {
        // 先断开已有连接
        this.cleanup();

        this.manualClose = false;
        this.currentRoomId = roomId;

        if (!this.protoLoaded) {
            console.warn('[Socket] Proto 未加载，等待...');
            await new Promise<void>((resolve) => {
                const check = () => {
                    if (this.protoLoaded) resolve();
                    else setTimeout(check, 100);
                };
                check();
            });
        }

        try {
            const wsToken = await api.auth.getWsToken();
            let baseUrl = import.meta.env.VITE_WS_URL;

            const token = wsToken.split('.')[0];
            const userId = wsToken.split('.')[1];

            if (!baseUrl) {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                baseUrl = `${protocol}//${window.location.host}`;
            }

            const connectUrl = `${baseUrl}/ws?roomId=${roomId}&userId=${userId}&token=${token}`;
            console.log(`[Socket] 连接: ${connectUrl}`);

            this.ws = new WebSocket(connectUrl);
            this.ws.binaryType = 'arraybuffer';

            this.ws.onopen = () => {
                console.log('%c[Socket] 连接成功', 'color: green; font-weight: bold;');
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
            };

            this.ws.onclose = (event) => {
                console.warn(`[Socket] 关闭: code=${event.code} reason=${event.reason} wasClean=${event.wasClean}`);
                console.warn(`[Socket] 连接URL: ${connectUrl}`);
                console.warn(`[Socket] wsToken原始值: ${wsToken}`);
                this.ws = null;
                eventBus.emit('socket:disconnected', { code: event.code, reason: event.reason });
                if (!this.manualClose) {
                    this.scheduleReconnect();
                }
            };
        } catch (error) {
            console.error('[Socket] 连接失败:', error);
        }
    }

    private scheduleReconnect() {
        if (this.reconnectTimer) return;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[Socket] 重连次数耗尽');
            return;
        }

        this.reconnectAttempts++;
        console.log(`[Socket] ${this.reconnectDelay / 1000}s 后重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect(this.currentRoomId);
        }, this.reconnectDelay);
    }

    private cleanup() {
        this.manualClose = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.onclose = null;
            this.ws.close();
            this.ws = null;
        }
    }

    public disconnect() {
        this.reconnectAttempts = this.maxReconnectAttempts; // 阻止重连
        this.cleanup();
    }

    private dispatch(buffer: Uint8Array) {
        if (!this.SpacePacket) return;

        try {
            const packet = this.SpacePacket.decode(buffer) as any;
            const { opcode, payload } = packet;

            switch (opcode) {
                case OpCode.CHAT:
                    if (this.Chat) eventBus.emit('cocos:new-chat', this.Chat.decode(payload));
                    break;
                case OpCode.PLAYER_MOVE:
                    if (this.PlayerTransform) eventBus.emit('cocos:player-sync', this.PlayerTransform.decode(payload));
                    break;
                case OpCode.BLOCK_INTERACTION:
                    if (this.BlockInteraction) eventBus.emit('cocos:block-interaction', this.BlockInteraction.decode(payload));
                    break;
                case OpCode.PLAYER_JOIN_LEAVE:
                    if (this.PlayerJoinLeave) eventBus.emit('cocos:player-join-leave', this.PlayerJoinLeave.decode(payload));
                    break;
                case OpCode.PLAYER_POSITION:
                    if (this.PlayerPosition) eventBus.emit('cocos:player-position', this.PlayerPosition.decode(payload));
                    break;
                case OpCode.ROOM_SYNC_FRAME:
                    if (this.RoomSyncFrame) eventBus.emit('cocos:room-sync-frame', this.RoomSyncFrame.decode(payload));
                    break;
            }
        } catch (error) {
            console.error('[Socket] 解码失败:', error);
        }
    }

    private send(opcode: OpCode, type: protobuf.Type, payload: any) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.SpacePacket) return;
        try {
            const inner = type.encode(type.create(payload)).finish();
            const outer = this.SpacePacket.create({ opcode, payload: inner });
            this.ws.send(this.SpacePacket.encode(outer).finish() as any);
        } catch (error) {
            console.error('[Socket] 发送失败:', error);
        }
    }

    public sendPlayerMove(data: any) {
        if (this.PlayerTransform) this.send(OpCode.PLAYER_MOVE, this.PlayerTransform, data);
    }

    public sendChat(data: any) {
        if (this.Chat) this.send(OpCode.CHAT, this.Chat, data);
    }

    public sendBlockInteraction(data: any) {
        if (this.BlockInteraction) this.send(OpCode.BLOCK_INTERACTION, this.BlockInteraction, data);
    }

    public isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }
}

// 单例：模块级唯一实例
export const socketService = new SocketService();
