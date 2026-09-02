'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthTokensDto, AuthUserDto } from '@saghf/types';
import { apiFetch } from './api';

interface AuthState {
  user: AuthUserDto | null;
  accessToken: string | null;
  hydrated: boolean;
  setSession: (session: AuthTokensDto) => void;
  setUser: (user: AuthUserDto) => void;
  clear: () => void;
  refresh: () => Promise<boolean>;
}

/**
 * The refresh token lives in an HttpOnly cookie set by the API. Only the
 * short-lived access token is kept in the client store.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      hydrated: false,
      setSession: (session) => set({ user: session.user, accessToken: session.accessToken }),
      setUser: (user) => set({ user }),
      clear: () => set({ user: null, accessToken: null }),
      refresh: async () => {
        try {
          const session = await apiFetch<AuthTokensDto>('/auth/refresh', { method: 'POST' });
          set({ user: session.user, accessToken: session.accessToken });
          return true;
        } catch {
          set({ user: null, accessToken: null });
          return false;
        }
      },
    }),
    {
      name: 'saghf-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

export function isStaff(role?: string): boolean {
  return role === 'ADMIN' || role === 'MANAGER' || role === 'EDITOR';
}
