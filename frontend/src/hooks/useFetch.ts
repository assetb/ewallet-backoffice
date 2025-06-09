import { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>(url: string, dependents: any[] = []) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;
    setState({ data: null, loading: true, error: null });
    axios
      .get<T>(url)
      .then((resp: AxiosResponse<T>) => {
        if (isMounted) {
          setState({ data: resp.data, loading: false, error: null });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setState({ data: null, loading: false, error: err.message });
        }
      });
    return () => {
      isMounted = false;
    };
  }, dependents);

  return state;
}
