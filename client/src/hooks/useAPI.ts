import { useState, useEffect, useRef } from "react";
import apiClient from "@/lib/api-client";

interface FetchOptions {
  limit?: number;
  offset?: number;
  where?: string;
}

interface APIResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  total: number;
}

export function useAPI<T>(endpoint: string, options?: FetchOptions): APIResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Serialize options to detect real changes
  const optsRef = useRef(JSON.stringify(options));
  const serialized = JSON.stringify(options);
  if (optsRef.current !== serialized) optsRef.current = serialized;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (options?.limit) params.set("limit", String(options.limit));
        if (options?.offset) params.set("offset", String(options.offset));
        if (options?.where) params.set("where", options.where);

        const qs = params.toString() ? `?${params}` : "";
        const res = await apiClient.get<{ list?: T[]; pageInfo?: { totalRows?: number } }>(
          `${endpoint}${qs}`
        );

        if (!cancelled) {
          setData(res.data.list ?? []);
          setTotal(res.data.pageInfo?.totalRows ?? res.data.list?.length ?? 0);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erro ao buscar dados");
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, optsRef.current]);

  return { data, loading, error, total };
}
