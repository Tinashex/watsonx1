import { useState, useEffect, useRef, useCallback } from 'react';
const MAX_PAGES = 20;
const useInfiniteScroll = (fetchFn, language) => {
  const [items, setItems] = useState([]); const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false); const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const observer = useRef(null); const requestId = useRef(0); const fetchFnRef = useRef(fetchFn);
  useEffect(() => { fetchFnRef.current = fetchFn; }, [fetchFn]);
  useEffect(() => { requestId.current += 1; setItems([]); setPage(1); setHasMore(true); setError(null); }, [language]);
  useEffect(() => {
    let cancelled = false; const currentRequest = ++requestId.current;
    if (!hasMore && page!== 1) { setLoading(false); return; }
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetchFnRef.current(page, language);
        if (cancelled || currentRequest!== requestId.current) return;
        const data = res?.data || res || {}; const results = Array.isArray(data.results)? data.results : [];
        const totalPages = Number(data.total_pages) || 1;
        setItems((prev) => {
          if (page === 1) return results;
          const existing = new Set(prev.map((i) => `${i.media_type || ''}-${i.id}`));
          const newItems = results.filter((i) => { const k = `${i.media_type || ''}-${i.id}`; if (existing.has(k)) return false; existing.add(k); return true; });
          return [...prev,...newItems];
        });
        setHasMore(page < totalPages && page < MAX_PAGES);
      } catch (err) {
        if (cancelled || currentRequest!== requestId.current) return;
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        setError(err?.message || 'Failed to load');
      } finally { if (!cancelled && currentRequest === requestId.current) setLoading(false); }
    };
    load(); return () => { cancelled = true; };
  }, [page, language, hasMore]);
  const lastItemRef = useCallback((node) => {
    if (loading ||!hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasMore &&!loading) setPage((p) => p >= MAX_PAGES? p : p + 1);
    }, { rootMargin: '400px 0px', threshold: 0.1 });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);
  useEffect(() => () => { observer.current?.disconnect(); }, []);
  return { items, loading, error, hasMore, lastItemRef };
};
export default useInfiniteScroll;