import {create} from 'zustand';
import {toast} from 'sonner';
import { authService } from '@/services/authService';
import type { AuthState } from '@/types/store';

export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: null,
    user: null,
    loading: false,

    setAccessToken (accessToken) {
        set({accessToken});
    },

    clearState () {
        set({
            accessToken: null,
            user: null,
            loading: false
        });
    },

    signUp: async (username, password, firstname, lastname, email) => {
        try {
            set({loading: true});

            // Call API
            await authService.signUp(username, password, firstname, lastname, email);
            
            toast.success('Đăng ký thành công! Bạn sẽ được chuyển sang trang đăng nhập.');
        }
        catch (error) {
            console.error(error);
            toast.error('Đăng ký thất bại. Vui lòng thử lại.');
        }
        finally {
            set({loading: false});
        }
    },

    signIn: async (username, password) => {
        try {
            set({loading: true});

            const {accessToken} = await authService.signIn(username, password);
            get().setAccessToken(accessToken);

            await get().fetchMe();

            toast.success('Đăng nhập thành công!');
        }
        catch (error) {
            console.error(error);
            toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
        }
        finally {
            set({loading: false});
        }
    },

    signOut: async () => {
        try {
            get().clearState();
            await authService.signOut();
            toast.success('Đăng xuất thành công!');

        }
        catch (error) {
            console.error(error);
            toast.error('Đăng xuất thất bại. Vui lòng thử lại.');
        }
    },

    fetchMe: async () => {
        try {
            set({loading: true});
            const user =  await authService.fetchMe();
            set({user});
        }
        catch (error) {
            console.error(error);
            set({user: null, accessToken: null});
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        finally {
            set({loading: false});
        }
    },

    refresh: async () => {
        try {
            set({loading: true});
            const {user, fetchMe, setAccessToken} = get();
            const accessToken = await authService.refresh();

            setAccessToken(accessToken);

            if (!user) {
                await fetchMe();
            }
        }
        catch (error) {
            console.error(error);
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            get().clearState();
        }
        finally {
            set({loading: false});
        }
    }
}));
