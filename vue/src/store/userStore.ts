import {defineStore} from 'pinia';
import {eventBus} from '@/utils/eventBus';
import {api} from '@/api';
import type {ChangePasswordParams, MailLoginParams, RegisterParams, UserDetailDTO} from '@/api/types';

export const useUserStore = defineStore('user', {
    state: () => ({
        userId: localStorage.getItem('userId') || '',
        token: localStorage.getItem('token') || '',
        username: localStorage.getItem('username') || '',
        userInfo: null as UserDetailDTO | null,
    }),
    getters: {
        isLoggedIn: (state) => !!state.token,
    },
    actions: {
        async login(username: string, password: string) {
            this.token = await api.auth.login({username, password});
            this.username = username;

            localStorage.setItem('token', this.token);
            localStorage.setItem('username', this.username);

            try {
                await this.loadSelfUserInfo();
            } catch (e) {
                console.warn('[Auth] Failed to load user info after login', e);
            }

            eventBus.emit('vue:login-success', {
                token: this.token
            });
        },

        async loginByMail(params: MailLoginParams) {
            this.token = await api.auth.loginByMail(params);

            localStorage.setItem('token', this.token);

            try {
                await this.loadSelfUserInfo();
            } catch (e) {
                console.warn('[Auth] Failed to load user info after login', e);
            }

            eventBus.emit('vue:login-success', {
                token: this.token
            });
        },

        async register(params: RegisterParams) {
            this.token = await api.auth.register(params);
            localStorage.setItem('token', this.token);
            localStorage.setItem('username', params.username);

            try {
                await this.loadSelfUserInfo();
            } catch (e) {
                console.warn('[Auth] Failed to load user info after register', e);
            }

            eventBus.emit('vue:login-success', {
                token: this.token
            });
        },

        async changePassword(params: ChangePasswordParams) {
            await api.auth.changePassword(params);
        },

        async sendCode(email: string) {
            await api.auth.sendCode(email);
        },

        async loadSelfUserInfo() {
            return this.userInfo = await api.user.getSelfDetail();
        },

        async refreshToken() {
            this.token = await api.auth.refreshToken(this.token);
            localStorage.setItem('token', this.token);
        },

        async validateAndRestoreSession(): Promise<boolean> {
            if (!this.token) {
                return false;
            }
            try {
                await this.loadSelfUserInfo();
                return true;
            } catch (error) {
                console.warn('[Auth] Session validation failed, clearing local state', error);
                this.logout();
                return false;
            }
        },

        logout() {
            this.token = '';
            this.username = '';
            this.userInfo = null;
            localStorage.removeItem('token');
            localStorage.removeItem('username');
        }
    }
});
