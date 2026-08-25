import { useState, useEffect, useCallback, useRef } from 'react';
import { attendanceApi } from '../api';
import { Attendance } from '../types';

export function useMyAttendance(filters?: Record<string, any>) {
  const [data, setData] = useState<Attendance[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const fetchData = useCallback(async () => {
    try {
      if (!data) setIsLoading(true);
      const res = await attendanceApi.getMyAttendance(filtersRef.current);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    mutate: fetchData,
  };
}

export function useTeamAttendance(filters?: Record<string, any>) {
  const [data, setData] = useState<Attendance[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const fetchData = useCallback(async () => {
    try {
      if (!data) setIsLoading(true);
      const res = await attendanceApi.getTeamAttendance(filtersRef.current);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    mutate: fetchData,
  };
}
