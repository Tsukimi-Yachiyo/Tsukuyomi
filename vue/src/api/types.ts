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

export interface PostSearchDTO {
    title: string;
    posterId: number;
    coverImage: string;
}

export interface InteractionRequest {
    postingId: number;
    type: 'LIKE' | 'COLLECTION' | 'COIN';
    action: 'ADD' | 'REMOVE' | 'TOGGLE';
}

export interface CommentRequest {
    postingId: number;
    content: string;
}

// ==========================================
// 4. Coin & Sign (金币与签到) 相关
// ==========================================

export interface SignStatusVO {
    isSigned: boolean;
    continuousDays: number;
    lastSignTime: string;
}

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
    action: 'APPROVE' | 'REJECT' | 'DELETE';
    reason?: string;
}
