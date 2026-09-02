'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type {
  AdminBannerDto,
  AdminDashboardDto,
  AdminPropertyDto,
  AdminUserDto,
  AmenityDto,
  AuthUserDto,
  CityDto,
  CompanyContactDto,
  MyPropertyDto,
  NeighborhoodDto,
  Paginated,
  PropertyCardDto,
  PropertyTypeDto,
  TransactionTypeDto,
} from '@saghf/types';
import { apiFetch, buildQuery } from './api';
import { useAuthStore } from './auth-store';

export function useToken(): string | null {
  return useAuthStore((state) => state.accessToken);
}

/* --------------------------- Taxonomy --------------------------- */

export function usePropertyTypes() {
  return useQuery({
    queryKey: ['property-types'],
    queryFn: () => apiFetch<PropertyTypeDto[]>('/taxonomy/property-types'),
    staleTime: 3_600_000,
  });
}

export function useTransactionTypes() {
  return useQuery({
    queryKey: ['transaction-types'],
    queryFn: () => apiFetch<TransactionTypeDto[]>('/taxonomy/transaction-types'),
    staleTime: 3_600_000,
  });
}

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: () => apiFetch<CityDto[]>('/taxonomy/cities'),
    staleTime: 3_600_000,
  });
}

/** Neighbourhoods are always scoped to a city, so the select stays short. */
export function useNeighborhoods(query?: string, city?: string) {
  return useQuery({
    queryKey: ['neighborhoods', query ?? '', city ?? ''],
    queryFn: () =>
      apiFetch<NeighborhoodDto[]>(`/taxonomy/neighborhoods${buildQuery({ q: query, city })}`),
    staleTime: 3_600_000,
  });
}

export function useAmenities() {
  return useQuery({
    queryKey: ['amenities'],
    queryFn: () => apiFetch<AmenityDto[]>('/taxonomy/amenities'),
    staleTime: 3_600_000,
  });
}

export function useCompanyContact() {
  return useQuery({
    queryKey: ['company-contact'],
    queryFn: () => apiFetch<CompanyContactDto>('/settings/contact'),
    staleTime: 600_000,
  });
}

/* -------------------------- Favourites -------------------------- */

export function useFavoriteIds() {
  const token = useToken();
  return useQuery({
    queryKey: ['favorite-ids', Boolean(token)],
    queryFn: () => apiFetch<string[]>('/me/favorites/ids', { token }),
    enabled: Boolean(token),
    staleTime: 60_000,
  });
}

export function useFavorites() {
  const token = useToken();
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiFetch<PropertyCardDto[]>('/me/favorites', { token }),
    enabled: Boolean(token),
  });
}

export function useToggleFavorite() {
  const token = useToken();
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async ({ propertyId, favorited }: { propertyId: string; favorited: boolean }) =>
      apiFetch(`/favorites/${propertyId}`, { method: favorited ? 'DELETE' : 'POST', token }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['favorite-ids'] });
      void queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const toggle = useCallback(
    (propertyId: string, favorited: boolean) => {
      if (!token) {
        router.push(`/auth?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      mutation.mutate({ propertyId, favorited });
    },
    [mutation, router, token],
  );

  return { toggle, isPending: mutation.isPending };
}

/* ------------------------- My listings -------------------------- */

export function useMyProperties(status?: string) {
  const token = useToken();
  return useQuery({
    queryKey: ['my-properties', status ?? 'all'],
    queryFn: () => apiFetch<MyPropertyDto[]>(`/me/properties${buildQuery({ status })}`, { token }),
    enabled: Boolean(token),
  });
}

export function usePropertyAction() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: 'renew' | 'deactivate' | 'activate' | 'delete';
    }): Promise<MyPropertyDto | null> => {
      if (action === 'delete') {
        await apiFetch<void>(`/properties/${id}`, { method: 'DELETE', token });
        return null;
      }
      return apiFetch<MyPropertyDto>(`/properties/${id}/${action}`, { method: 'PATCH', token });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-properties'] }),
  });
}

/* ---------------------------- Profile --------------------------- */

export function useProfile() {
  const token = useToken();
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiFetch<AuthUserDto>('/me/profile', { token }),
    enabled: Boolean(token),
  });
}

export function useUpdateProfile() {
  const token = useToken();
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<AuthUserDto> & { preferredTransaction?: string }) =>
      apiFetch<AuthUserDto>('/me/profile', { method: 'PATCH', token, body }),
    onSuccess: (user) => {
      setUser(user);
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

/* ---------------------------- Banners --------------------------- */

export function useAdminBanners() {
  const token = useToken();
  return useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => apiFetch<AdminBannerDto[]>('/admin/banners', { token }),
    enabled: Boolean(token),
  });
}

export function useBannerMutation() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      payload,
    }: {
      id?: string;
      action: 'create' | 'update' | 'delete';
      payload?: Record<string, unknown>;
    }): Promise<AdminBannerDto | null> => {
      if (action === 'create') {
        return apiFetch<AdminBannerDto>('/admin/banners', { method: 'POST', token, body: payload });
      }
      if (action === 'delete') {
        await apiFetch<void>(`/admin/banners/${id}`, { method: 'DELETE', token });
        return null;
      }
      return apiFetch<AdminBannerDto>(`/admin/banners/${id}`, {
        method: 'PATCH',
        token,
        body: payload,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-banners'] }),
  });
}

/* ----------------------------- Admin ---------------------------- */

export function useAdminDashboard() {
  const token = useToken();
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiFetch<AdminDashboardDto>('/admin/dashboard', { token }),
    enabled: Boolean(token),
  });
}

export function useAdminProperties(params: { status?: string; q?: string; page?: number }) {
  const token = useToken();
  return useQuery({
    queryKey: ['admin-properties', params],
    queryFn: () =>
      apiFetch<Paginated<AdminPropertyDto>>(`/admin/properties${buildQuery({ ...params })}`, { token }),
    enabled: Boolean(token),
  });
}

export function useAdminPropertyAction() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      payload,
    }: {
      id: string;
      action: 'approve' | 'reject' | 'feature' | 'expire' | 'delete';
      payload?: Record<string, unknown>;
    }): Promise<AdminPropertyDto | null> => {
      if (action === 'delete') {
        await apiFetch<void>(`/admin/properties/${id}`, { method: 'DELETE', token });
        return null;
      }
      return apiFetch<AdminPropertyDto>(`/admin/properties/${id}/${action}`, {
        method: 'PATCH',
        token,
        body: payload,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}

export function useAdminUsers(params: { q?: string; status?: string; page?: number }) {
  const token = useToken();
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => apiFetch<Paginated<AdminUserDto>>(`/admin/users${buildQuery({ ...params })}`, { token }),
    enabled: Boolean(token),
  });
}

export function useAdminUserStatus() {
  const token = useToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch<AdminUserDto>(`/admin/users/${id}/status`, { method: 'PATCH', token, body: { status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}
