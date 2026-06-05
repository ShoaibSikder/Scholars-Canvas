import { useEffect, useState } from "react";

export function useApiData(fetcher, fallbackValue) {
  const [data, setData] = useState(fallbackValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const payload = await fetcher();
        if (isMounted && payload) {
          setData(payload);
        }
      } catch {
        if (isMounted) {
          setData(fallbackValue);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [fetcher, fallbackValue]);

  return { data, loading };
}

