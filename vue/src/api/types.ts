/**
 * 统一响应体结构
 */
export interface Result<T> {
    code: string | number;
    message: string;
    data: T;
    detail?: string;
}

// ==========================================
// 2. UserService (用户服务) 相关
// ==========================================

export interface LoginParams {
    username: string;
    password: string;
}

export interface MailLoginParams {
    email: string;
    code: string;
}

export interface RegisterParams {
    username: string;
    password: string;
    email: string;
    code: string;
}

export interface ChangePasswordParams {
    username: string;
    password: string;
    email: string;
    code: string;
}

export interface UserDetailDTO {
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

export type UserDetailType = 'SELF' | 'BASIC' | 'FULL';

// ==========================================
// 3. ContentService (内容服务) 相关
// ==========================================

export interface PostDetailDTO {
    content: string;
    filenames: string[];
    files: string[];
}

export interface PostEncapsulateDTO {
    title: string;
    posterId: number;
    coverImage: string;
}

export interface PostStatsResponse {
    likeCount: number;
    collectionCount: number;
    readingCount: number;
    coinCount: number;
    liked: boolean;
    collected: boolean;
    coined: number;
}

export interface SelfPostResponse {
    postingId: number;
    approved: boolean;
}

export interface InteractionRequest {
    postingId: number;
    type: InteractionType;
    action: InteractionAction;
}

export interface InteractionResponse {
    coin: number;
    like: number;
}

export interface CommentRequest {
    postingId: number;
    content: string;
}

export interface CommentResponse {
    id: number;
    userId: number;
    content: string;
}

export type InteractionType = 'LIKE' | 'COLLECTION' | 'COIN';
export type InteractionAction = 'ADD' | 'REMOVE' | 'TOGGLE';

// ==========================================
// 4. Coin & Sign (金币与签到) 相关
// ==========================================

export interface CoinChangeRequest {
    fromUserId: number;
    toUserId: number;
    type: TradeType;
    amount: number;
}

export type TradeType = 'TIP' | 'CHECKIN' | 'MAIL' | 'CHARGE' | 'BUY';

// ==========================================
// 5. File (文件服务) 相关
// ==========================================

export interface UploadResponse {
    fileId: string;
    url: string;
}

// ==========================================
// 6. Admin (管理员) 相关
// ==========================================

export interface ReviewRequest {
    postingId: number;
    action: ReviewAction;
    reason?: string;
}

export interface PostingQueryRequest {
    status: PostingStatus;
    keyword: string;
    pageNum: number;
    pageSize: number;
}

export interface PostingResponse {
    id: number;
    userId: number;
    title: string;
    content: string;
    type: string;
    isApproved: boolean;
    createTime: string;
    score: number;
}

export interface AddColumnRequest {
    name: string;
    description: string;
    type: EssayType;
    writerId: number;
    file: File;
}

export type ReviewAction = 'APPROVE' | 'REJECT' | 'DELETE';
export type PostingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';
export type EssayType = 'SIMPLE' | 'NOVEL' | 'ACTIVITY';
