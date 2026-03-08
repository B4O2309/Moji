import {create} from 'zustand';
import {toast} from 'sonner';
import { authService } from '@/services/authService';
import type { AuthState } from '@/types/store';
import { persist } from 'zustand/middleware';
import { useChatStore } from './useChatStore';

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
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
                localStorage.clear();
                useChatStore.getState().reset();
            },

            signUp: async (username, password, firstname, lastname, email) => {
                try {
                    set({loading: true});

                    // Call API
                    await authService.signUp(username, password, firstname, lastname, email);
                    useChatStore.getState().reset();
                    toast.success('Sign up successful! Directing to sign in page...');
                }
                catch (error) {
                    console.error(error);
                    toast.error('Sign up failed. Please try again.');
                }
                finally {
                    set({loading: false});
                }
            },

            signIn: async (username, password) => {
                try {
                    set({loading: true});

                    localStorage.clear();
                    useChatStore.getState().reset();

                    const {accessToken} = await authService.signIn(username, password);
                    get().setAccessToken(accessToken);

                    await get().fetchMe();
                    useChatStore.getState().fetchConversations();

                    toast.success('Sign in successful!');
                }
                catch (error) {
                    console.error(error);
                    toast.error('Sign in failed. Please try again.');
                }
                finally {
                    set({loading: false});
                }
            },

            signOut: async () => {
                try {
                    get().clearState();
                    await authService.signOut();
                    toast.success('Sign out successful!');

                }
                catch (error) {
                    console.error(error);
                    toast.error('Sign out failed. Please try again.');
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
                    toast.error('Session has expired. Please sign in again.');
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
                    toast.error('Session has expired. Please sign in again.');
                    get().clearState();
                }
                finally {
                    set({loading: false});
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user })
        }
    )
);
