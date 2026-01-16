'use client';

import { useState, useEffect, useCallback } from 'react';
import { ApiError } from './api';

/**
 * API 호출 상태 관리를 위한 타입
 */
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * API 호출을 위한 커스텀 훅
 * 
 * @example
 * const { data, loading, error, refetch } = useApi(() => adminApi.getStatistics(7));
 */
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: unknown[] = []
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (err) {
      const apiError = err instanceof ApiError 
        ? err 
        : new ApiError(500, { 
            code: 'UNKNOWN', 
            message: err instanceof Error ? err.message : '알 수 없는 오류' 
          });
      setState({ data: null, loading: false, error: apiError });
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    refetch: execute,
  };
}

/**
 * 지연 API 호출을 위한 커스텀 훅 (수동 실행)
 * 
 * @example
 * const { execute, loading, error } = useLazyApi(adminApi.banUser);
 * const handleBan = () => execute({ userId: 1, reason: '스팸' });
 */
export function useLazyApi<TArgs extends unknown[], TResult>(
  apiCall: (...args: TArgs) => Promise<TResult>
) {
  const [state, setState] = useState<UseApiState<TResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: TArgs) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiCall(...args);
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const apiError = err instanceof ApiError 
        ? err 
        : new ApiError(500, { 
            code: 'UNKNOWN', 
            message: err instanceof Error ? err.message : '알 수 없는 오류' 
          });
      setState({ data: null, loading: false, error: apiError });
      throw apiError;
    }
  }, [apiCall]);

  return {
    ...state,
    execute,
  };
}

/**
 * 페이지네이션 API 호출을 위한 커스텀 훅
 * 
 * @example
 * const { data, loading, page, setPage, hasMore } = usePaginatedApi(
 *   (page) => adminApi.getReports(page, 10),
 *   10
 * );
 */
export function usePaginatedApi<T>(
  apiCall: (page: number) => Promise<T[]>,
  pageSize: number = 10
) {
  const [page, setPage] = useState(0);
  const [allData, setAllData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall(pageNum);
      if (append) {
        setAllData(prev => [...prev, ...data]);
      } else {
        setAllData(data);
      }
      setHasMore(data.length >= pageSize);
    } catch (err) {
      const apiError = err instanceof ApiError 
        ? err 
        : new ApiError(500, { 
            code: 'UNKNOWN', 
            message: err instanceof Error ? err.message : '알 수 없는 오류' 
          });
      setError(apiError);
    } finally {
      setLoading(false);
    }
  }, [apiCall, pageSize]);

  useEffect(() => {
    fetchPage(0);
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPage(nextPage, true);
    }
  }, [page, loading, hasMore, fetchPage]);

  const refresh = useCallback(() => {
    setPage(0);
    setAllData([]);
    fetchPage(0);
  }, [fetchPage]);

  return {
    data: allData,
    loading,
    error,
    page,
    setPage,
    hasMore,
    loadMore,
    refresh,
  };
}
