# API 接口文档

## 1. 概述

本文档定义了《超时空辉夜姬》项目的所有 HTTP API 接口和 WebSocket + Protobuf 通信协议。

### 1.1 基础信息

| 项目 | 说明 |
|------|------|
| 基础路径 | `/api` |
| 认证方式 | Bearer Token (JWT) |
| 数据格式 | JSON (HTTP) / Protobuf (WebSocket) |
| 超时时间 | 10 秒 |

### 1.2 统一响应格式

```typescript
interface Result<T> {
    code: string | number;   // 业务状态码
    message: string;         // 提示信息
    data: T;                 // 响应数据
    detail?: string;         // 详细信息
}
```

**状态码说明：**

| 状态码 | 说明 |
|--------|------|
| 200 / 0 | 成功 |
| 401 | 未授权/Token 过期 |
| 403 | 权限不足 |

---

## 2. HTTP API

### 2.1 系统接口

#### 健康检查

```
GET /api/v3/test/hello
```

**响应：** `string`

---

### 2.2 认证接口 (Auth)

#### 发送邮箱验证码

```
POST /api/v1/auth/send-code?email={email}
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |

**响应：** `boolean`

---

#### 密码登录

```
POST /api/v1/auth/login
```

**请求体：**

```typescript
interface LoginParams {
    username: string;
    password: string;
}
```

**响应：** `string` (JWT Token)

---

#### 邮箱验证码登录

```
POST /api/v1/auth/login-by-email
```

**请求体：**

```typescript
interface MailLoginParams {
    email: string;
    code: string;
}
```

**响应：** `string` (JWT Token)

---

#### 用户注册

```
POST /api/v1/auth/register
```

**请求体：**

```typescript
interface RegisterParams {
    username: string;
    password: string;
    email: string;
    code: string;
}
```

**响应：** `string` (JWT Token)

---

#### 修改密码

```
POST /api/v1/auth/change-password
```

**请求体：**

```typescript
interface ChangePasswordParams {
    username: string;
    password: string;   // 新密码
    email: string;
    code: string;       // 邮箱验证码
}
```

**响应：** `boolean`

---

#### 刷新令牌

```
POST /api/v1/auth/refresh-token?refreshToken={token}
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| refreshToken | string | 是 | 刷新令牌 |

**响应：** `string` (新 JWT Token)

---

#### 获取 WebSocket 令牌

```
GET /api/v1/auth/ws-token
```

**响应：** `string` (WebSocket 认证令牌)

---

#### 登出

```
POST /api/v1/auth/logout
```

**响应：** `boolean`

---

#### 冻结账户

```
POST /api/v1/auth/freeze
```

**响应：** `boolean`

---

### 2.3 用户接口 (User)

#### 获取自身详情

```
GET /api/v2/user/detail
```

**响应：**

```typescript
interface UserDetailDTO {
    userName: string;
    userIntroduction: string;
    userCity: string;
    userAvatar: string;
    userGender: string;
    userPhone: string;
    userQQ: string;
    userMail: string;
    userBirthday: string;
    followerCount: number;
    followeeCount: number;
    isFollowing: boolean;
    isFollowed: boolean;
}
```

---

#### 获取用户详情

```
GET /api/v2/user/detail/{detailType}?userId={userId}
```

**路径参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| detailType | `SELF` \| `BASIC` \| `FULL` | 详情类型 |

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | number | 是 | 用户 ID |

**响应：** `UserDetailDTO`

---

#### 搜索用户

```
POST /api/v2/user/search?userName={name}&pageNum={page}&pageSize={size}
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userName | string | 是 | 用户名（模糊搜索） |
| pageNum | number | 是 | 页码 |
| pageSize | number | 是 | 每页数量 |

**响应：** `UserDetailDTO[]`

---

#### 获取关注列表

```
GET /api/v2/user/followee
```

**响应：** `number[]` (关注的用户 ID)

---

#### 获取粉丝列表

```
GET /api/v2/user/follower
```

**响应：** `number[]` (粉丝用户 ID)

---

#### 关注用户

```
POST /api/v2/user/follow?followeeId={id}
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| followeeId | number | 是 | 被关注用户 ID |

**响应：** `boolean`

---

#### 获取头像

```
GET /api/v2/user/avatar
```

**响应：** `string` (头像 URL)

---

#### 更新头像

```
PUT /api/v2/user/avatar
```

**请求体：** `FormData` (文件上传)

**响应：** `boolean`

---

#### 更新用户详情

```
PUT /api/v2/user/detail
```

**请求体：** `Partial<UserDetailDTO>`

**响应：** `boolean`

---

### 2.4 帖子接口 (Posting)

#### 获取帖子详情

```
GET /api/v2/posting/{id}
```

**响应：**

```typescript
interface PostDetailDTO {
    content: string;
    filenames: string[];
    files: string[];
}
```

---

#### 获取帖子统计

```
GET /api/v2/posting/stats?postingId={id}
```

**响应：**

```typescript
interface PostStatsResponse {
    likeCount: number;        // 点赞数
    collectionCount: number;  // 收藏数
    readingCount: number;     // 阅读数
    coinCount: number;        // 投币数
    liked: boolean;           // 是否已点赞
    collected: boolean;       // 是否已收藏
    coined: number;           // 已投币数
}
```

---

#### 搜索帖子

```
GET /api/v2/posting/search?keyword={kw}&pageNum={page}&pageSize={size}
```

**响应：**

```typescript
interface PostEncapsulateDTO {
    title: string;
    posterId: number;
    coverImage: string;
}
```

---

#### 获取点赞列表

```
POST /api/v2/posting/like
```

**响应：** `number[]` (已点赞帖子 ID)

---

#### 获取收藏列表

```
POST /api/v2/posting/collection
```

**响应：** `number[]` (已收藏帖子 ID)

---

#### 获取帖子封装信息

```
GET /api/v2/posting/encapsulate?postingId={id}
```

**响应：** `PostEncapsulateDTO`

---

#### 获取用户帖子

```
GET /api/v2/posting/user?userId={id}
```

**响应：** `number[]` (用户帖子 ID 列表)

---

#### 帖子互动

```
POST /api/v2/posting/interaction
```

**请求体：**

```typescript
interface InteractionRequest {
    postingId: number;
    type: 'LIKE' | 'COLLECTION' | 'COIN';
    action: 'ADD' | 'REMOVE' | 'TOGGLE';
}
```

**响应：** `boolean`

---

#### 上传帖子

```
POST /api/v2/posting/upload
```

**请求体：** `FormData`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 帖子标题 |
| content | string | 是 | 帖子内容 |
| type | string | 是 | 帖子类型 |
| coverImage | File | 否 | 封面图片 |
| files | File[] | 否 | 附件列表 |

**响应：** `boolean`

---

#### 删除帖子

```
DELETE /api/v2/posting/{id}
```

**响应：** `boolean`

---

#### 获取我的帖子

```
GET /api/v2/posting/my
```

**响应：**

```typescript
interface SelfPostResponse {
    postingId: number;
    approved: boolean;
}
```

---

### 2.5 评论接口 (Comment)

#### 获取评论列表

```
GET /api/v2/posting/comment?postingId={id}
```

**响应：**

```typescript
interface CommentResponse {
    id: number;
    userId: number;
    content: string;
}
```

---

#### 添加评论

```
PUT /api/v2/posting/comment
```

**请求体：**

```typescript
interface CommentRequest {
    postingId: number;
    content: string;
}
```

**响应：** `boolean`

---

#### 删除评论

```
DELETE /api/v2/posting/comment?commentId={id}
```

**响应：** `boolean`

---

### 2.6 专栏接口 (Column)

#### 搜索专栏

```
GET /api/v2/column/search?keyword={kw}&pageNum={page}&pageSize={size}
```

**响应：** `any[]`

---

#### 获取专栏互动状态

```
GET /api/v2/column/interaction?columnId={id}
```

**响应：**

```typescript
interface InteractionResponse {
    coin: number;
    like: number;
}
```

---

#### 专栏互动

```
PUT /api/v2/column/interaction
```

**请求体：** `InteractionRequest`

**响应：** `boolean`

---

### 2.7 金币接口 (Coin)

#### 获取金币数量

```
GET /api/v2/coin
```

**响应：** `number`

---

#### 金币交易

```
PUT /api/v2/coin
```

**请求体：**

```typescript
interface CoinChangeRequest {
    fromUserId: number;
    toUserId: number;
    type: 'TIP' | 'CHECKIN' | 'MAIL' | 'CHARGE' | 'BUY';
    amount: number;
}
```

**响应：** `boolean`

---

### 2.8 签到接口 (Sign)

#### 签到

```
POST /api/v2/sign/check-in
```

**响应：** `boolean`

---

#### 签到状态

```
POST /api/v2/sign/status
```

**响应：** `boolean` (今日是否已签到)

---

### 2.9 管理接口 (Admin)

#### 管理员登录

```
POST /api/yachiyo/168/mini/admin/login?username={name}&password={pwd}
```

**响应：** `string` (管理员 Token)

---

#### 审核帖子

```
POST /api/yachiyo/168/mini/admin/review
```

**请求体：**

```typescript
interface ReviewRequest {
    postingId: number;
    action: 'APPROVE' | 'REJECT' | 'DELETE';
    reason?: string;
}
```

**响应：** `boolean`

---

#### 查询帖子

```
POST /api/yachiyo/168/mini/admin/query-postings
```

**请求体：**

```typescript
interface PostingQueryRequest {
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';
    keyword: string;
    pageNum: number;
    pageSize: number;
}
```

**响应：** `PostingResponse[]`

---

#### 添加专栏

```
POST /api/yachiyo/168/mini/admin/add-column
```

**请求体：** `FormData`

**响应：** `boolean`

---

#### 删除专栏

```
DELETE /api/yachiyo/168/mini/admin/delete-column?id={id}
```

**响应：** `boolean`

---

### 2.10 文件接口 (File)

#### 下载公共文件

```
GET /file/public?fileName={name}&bucket={bucket}
```

**响应：** `Blob`

---

## 3. WebSocket + Protobuf

### 3.1 连接方式

```
ws://{host}/ws/room?roomId={roomId}&userId={userId}&token={token}
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| roomId | number | 是 | 房间 ID (默认 101) |
| userId | string | 是 | 用户 ID (从 wsToken 解析) |
| token | string | 是 | 认证令牌 (从 wsToken 解析) |

**二进制类型：** `arraybuffer`

---

### 3.2 OpCode 枚举

```typescript
enum OpCode {
    PLAYER_MOVE = 1,        // 玩家移动
    CHAT = 2,               // 聊天消息
    BLOCK_INTERACTION = 3,  // 地块交互
    PLAYER_JOIN_LEAVE = 4,  // 玩家进出
    PLAYER_POSITION = 5,    // 玩家位置
    ROOM_SYNC_FRAME = 100   // 房间帧同步
}
```

---

### 3.3 消息格式

**外层协议：** `SpacePacket`

```protobuf
message SpacePacket {
    uint32 opcode = 1;      // 消息类型 (OpCode)
    bytes payload = 2;      // 内层 Protobuf 编码数据
}
```

**内层协议：**

| OpCode | 消息类型 | 说明 |
|--------|----------|------|
| 1 | PlayerTransform | 玩家移动数据 |
| 2 | PlayerChat | 聊天消息 |
| 3 | BlockInteraction | 地块交互 |
| 4 | PlayerJoinLeave | 玩家进出通知 |
| 5 | PlayerPosition | 玩家位置 |
| 100 | RoomSyncFrame | 房间帧同步 |

---

### 3.4 消息发送流程

```
1. 使用 inner type.encode(type.create(payload)).finish() 编码内层数据
2. 使用 SpacePacket.create({ opcode, payload: innerBuffer }) 创建外层消息
3. 使用 SpacePacket.encode(outerMessage).finish() 编码完整封包
4. 通过 WebSocket.send() 发送二进制数据
```

### 3.5 消息接收流程

```
1. 接收 ArrayBuffer 数据
2. 使用 SpacePacket.decode(buffer) 解码外层封包
3. 根据 opcode 选择对应的 inner type
4. 使用 inner type.decode(payload) 解码内层数据
5. 通过 eventBus 分发到对应组件
```

---

## 4. 错误处理

### 4.1 HTTP 错误

| HTTP 状态码 | 说明 | 处理方式 |
|-------------|------|----------|
| 401 | 未授权 | 自动刷新 Token，刷新失败则登出 |
| 403 | 权限不足 | 自动刷新 Token，刷新失败则登出 |
| 404 | 资源不存在 | 提示用户 |
| 500 | 服务器错误 | 提示用户重试 |
| 超时 | 请求超时 (10s) | 提示网络异常 |

### 4.2 WebSocket 错误

| 情况 | 处理方式 |
|------|----------|
| 连接断开 | 自动重连 (最多 5 次，间隔 3 秒) |
| Protobuf 加载失败 | 控制台报错，无法发送消息 |
| 消息解码失败 | 控制台提示，检查协议一致性 |

---

## 5. 类型定义汇总

### 5.1 枚举类型

```typescript
type UserDetailType = 'SELF' | 'BASIC' | 'FULL';
type InteractionType = 'LIKE' | 'COLLECTION' | 'COIN';
type InteractionAction = 'ADD' | 'REMOVE' | 'TOGGLE';
type TradeType = 'TIP' | 'CHECKIN' | 'MAIL' | 'CHARGE' | 'BUY';
type ReviewAction = 'APPROVE' | 'REJECT' | 'DELETE';
type PostingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';
type EssayType = 'SIMPLE' | 'NOVEL' | 'ACTIVITY';
```

---

## 6. 使用示例

### 6.1 HTTP 请求

```typescript
import { api } from '@/api';

// 登录
const token = await api.auth.login({
    username: 'user',
    password: 'pass'
});

// 获取用户信息
const user = await api.user.getSelfDetail();

// 搜索帖子
const posts = await api.posting.search('关键词', 1, 20);
```

### 6.2 WebSocket 通信

```typescript
import { socketService } from '@/api/socket';
import { eventBus } from '@/utils/eventBus';

// 连接
socketService.connect(101);

// 发送消息
eventBus.emit('network:send-chat', {
    content: 'Hello World'
});

// 接收消息
eventBus.on('cocos:new-chat', (data) => {
    console.log('收到聊天:', data);
});
```
