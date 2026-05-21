import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import * as T from './types';
import {useStore} from "@/store/userStore";

const baseURL = import.meta.env.VITE_API_URL || '';

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

const processQueue = () => {
    refreshQueue.forEach(cb => cb());
    refreshQueue = [];
};

const service: AxiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
});

service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const userStore = useStore();
        const token = userStore.token;
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

service.interceptors.response.use(
    (response: AxiosResponse) => {
        // 健康检查接口特殊处理保持不变
        if (response.config.url?.includes('/test/hello')) {
            return response.data;
        }

        const { code, data, message } = response.data;

        if (code === 200 || code === 0 || String(code) === '200') {
            return data;
        }

        // 401/403 自动重试逻辑（带锁防竞态）
        if (response.status === 401 || response.status === 403 || String(code) === '401' || String(code) === '403') {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    refreshQueue.push(() => {
                        const userStore = useStore();
                        response.config.headers['Authorization'] = `Bearer ${userStore.token}`;
                        resolve(service(response.config));
                    });
                });
            }

            isRefreshing = true;
            const userStore = useStore();

            return userStore.refreshToken().then(() => {
                processQueue();
                response.config.headers['Authorization'] = `Bearer ${userStore.token}`;
                return service(response.config);
            }).catch((refreshError) => {
                processQueue();
                userStore.logout();
                return Promise.reject(refreshError);
            }).finally(() => {
                isRefreshing = false;
            });
        }
        return Promise.reject(new Error(message || 'Server Error'));
    },
    (error) => {
        const msg = error.response?.data?.message || '网络通讯异常';
        return Promise.reject(new Error(msg));
    }
);

export const api = {
    system: {
        hello: (): Promise<string> =>
            service.get('/api/v3/test/hello'),
    },
    auth: {
        sendCode: (email: string): Promise<boolean> =>
            service.post('/api/v1/auth/send-code', null, { params: { email } }),

        login: (params: T.LoginParams): Promise<string> =>
            service.post('/api/v1/auth/login', params),

        loginByMail: (params: T.MailLoginParams): Promise<string> =>
            service.post('/api/v1/auth/login-by-email', params),

        register: (params: T.RegisterParams): Promise<string> =>
            service.post('/api/v1/auth/register', params),

        changePassword: (params: T.ChangePasswordParams): Promise<boolean> =>
            service.post('/api/v1/auth/change-password', params),

        refreshToken: (refreshToken: string): Promise<string> =>
            service.post('/api/v1/auth/refresh-token', null, { params: { refreshToken } }),

        getWsToken: (): Promise<string> =>
            service.get('/api/v1/auth/ws-token'),

        logout: (): Promise<boolean> =>
            service.post('/api/v1/auth/logout'),

        freeze: (): Promise<boolean> =>
            service.post('/api/v1/auth/freeze'),
    },

    user: {
        getSelfDetail: (): Promise<T.UserDetailDTO> =>
            service.get(`/api/v2/user/detail`),

        getDetail: (detailType: T.UserDetailType, userId: number): Promise<T.UserDetailDTO> =>
            service.get(`/api/v2/user/detail/${detailType}`, { params: { userId } }),

        search: (userName: string, pageNum: number, pageSize: number): Promise<T.UserDetailDTO[]> =>
            service.post('/api/v2/user/search', null, { params: { userName, pageNum, pageSize } }),

        getFollowees: (): Promise<number[]> =>
            service.get('/api/v2/user/followee'),

        getFollowers: (): Promise<number[]> =>
            service.get('/api/v2/user/follower'),

        follow: (followeeId: number): Promise<boolean> =>
            service.post('/api/v2/user/follow', null, { params: { followeeId } }),

        getAvatar: (): Promise<string> =>
            service.get('/api/v2/user/avatar'),

        updateAvatar: (formData: FormData): Promise<boolean> =>
            service.put('/api/v2/user/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }),

        updateDetail: (data: Partial<T.UserDetailDTO>): Promise<boolean> =>
            service.put('/api/v2/user/detail', data),
    },

    posting: {
        getDetail: (id: number): Promise<T.PostDetailDTO> =>
            service.get(`/api/v2/posting/${id}`),

        getStats: (postingId: number): Promise<T.PostStatsResponse> =>
            service.get('/api/v2/posting/stats', { params: { postingId } }),

        search: (keyword: string, pageNum: number, pageSize: number): Promise<T.PostEncapsulateDTO[]> =>
            service.get('/api/v2/posting/search', { params: { keyword, pageNum, pageSize } }),

        getLiked: (): Promise<number[]> =>
            service.post('/api/v2/posting/like'),

        getCollected: (): Promise<number[]> =>
            service.post('/api/v2/posting/collection'),

        getEncapsulate: (postingId: number): Promise<T.PostEncapsulateDTO> =>
            service.get('/api/v2/posting/encapsulate', { params: { postingId } }),

        getUserPosts: (userId: number): Promise<number[]> =>
            service.get('/api/v2/posting/user', { params: { userId } }),

        interact: (data: T.InteractionRequest): Promise<boolean> =>
            service.post('/api/v2/posting/interaction', data),

        upload: (title: string, content: string, type: string, coverImage?: File, files?: File[]): Promise<boolean> => {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('type', type);
            if (coverImage) formData.append('coverImage', coverImage);
            if (files) files.forEach(f => formData.append('files', f));
            return service.post('/api/v2/posting/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },

        delete: (id: number): Promise<boolean> =>
            service.delete(`/api/v2/posting/${id}`),

        getMyPosts: (): Promise<T.SelfPostResponse[]> =>
            service.get('/api/v2/posting/my'),
    },

    comment: {
        getList: (postingId: number): Promise<T.CommentResponse[]> =>
            service.get('/api/v2/posting/comment', { params: { postingId } }),

        add: (data: T.CommentRequest): Promise<boolean> =>
            service.put('/api/v2/posting/comment', data),

        delete: (commentId: number): Promise<boolean> =>
            service.delete('/api/v2/posting/comment', { params: { commentId } }),
    },

    column: {
        search: (keyword: string, pageNum: number, pageSize: number): Promise<any[]> =>
            service.get('/api/v2/column/search', { params: { keyword, pageNum, pageSize } }),

        getInteractionStatus: (columnId: number): Promise<T.InteractionResponse> =>
            service.get('/api/v2/column/interaction', { params: { columnId } }),

        interact: (data: T.InteractionRequest): Promise<boolean> =>
            service.put('/api/v2/column/interaction', data),
    },

    coin: {
        get: (): Promise<number> =>
            service.get('/api/v2/coin'),

        update: (fromUserId: number, toUserId: number, type: T.TradeType, amount: number): Promise<boolean> =>
            service.put('/api/v2/coin', { fromUserId, toUserId, type, amount }),
    },

    sign: {
        checkIn: (): Promise<boolean> =>
            service.post('/api/v2/sign/check-in'),

        getStatus: (): Promise<boolean> =>
            service.post('/api/v2/sign/status'),
    },

    admin: {
        login: (username: string, password: string): Promise<string> =>
            service.post('/api/yachiyo/168/mini/admin/login', null, { params: { username, password } }),

        review: (data: T.ReviewRequest): Promise<boolean> =>
            service.post('/api/yachiyo/168/mini/admin/review', data),

        queryPostings: (status: T.PostingStatus, keyword: string, pageNum: number, pageSize: number): Promise<T.PostingResponse[]> =>
            service.post('/api/yachiyo/168/mini/admin/query-postings', { status, keyword, pageNum, pageSize }),

        addColumn: (name: string, description: string, type: T.EssayType, writerId: number, file: File): Promise<boolean> => {
            const formData = new FormData();
            const request = { name, description, type, writerId };
            formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
            formData.append('file', file);
            return service.post('/api/yachiyo/168/mini/admin/add-column', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },

        deleteColumn: (id: number): Promise<boolean> =>
            service.delete('/api/yachiyo/168/mini/admin/delete-column', { params: { id } }),
    },

    file: {
        downloadPublic: (fileName: string, bucket?: string): Promise<Blob> =>
            service.get('/file/public', { params: { fileName, bucket }, responseType: 'blob' }),
    }
};

export default api;
