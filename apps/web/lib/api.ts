import type { ApiErrorBody } from '@saghf/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  token?: string | null;
  /** Next.js data-cache options for server components. */
  revalidate?: number | false;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, revalidate, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...(revalidate === undefined
      ? { cache: 'no-store' as RequestCache }
      : revalidate === false
        ? { cache: 'no-store' as RequestCache }
        : { next: { revalidate } }),
  });

  if (response.status === 204) return undefined as T;

  const payload = (await response.json().catch(() => null)) as T | ApiErrorBody | null;

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as ApiErrorBody).message)
        : 'ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.';
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

/** Builds a querystring, dropping empty values so URLs stay clean and cacheable. */
export function buildQuery(params: Record<string, string | number | boolean | undefined | null | string[]>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '' || value === false) continue;
    if (Array.isArray(value)) {
      if (value.length) search.set(key, value.join(','));
      continue;
    }
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}
