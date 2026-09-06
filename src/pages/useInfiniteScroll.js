import { useState, useEffect, useRef, useCallback } from 'react';

/*
 * Max pages we allow to load.
 * TMDB API limits deep pagination, and this
 * prevents infinite background requests that
 * freeze the UI / background hero.
 */
const MAX_PAGES = 20;

/*
 * useInfiniteScroll - Full cinematic fixed version
 *
 * Supports two signatures:
 * 1) useInfiniteScroll(fetchFn, language)
 * 2) useInfiniteScroll(fetchFn, [genre, query, language,...])
 *
 * The old version re-created fetchFn every render
 * causing infinite loops and background flicker.
 * This version uses fetchFnRef to keep latest
 * function without resetting the list.
 */
const useInfiniteScroll = (fetchFn, dependencies = []) => {
  /*
   * Normalize dependencies.
   * If user passes string 'en-US', wrap it as array.
   * If user passes array [genre, query, lang], keep it.
   * This allows the hook to work in Dashboard AND Movies page.
   */
  const normalizedDeps = Array.isArray(dependencies)
   ? dependencies
    : [dependencies];

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const observer = useRef(null);
  const requestId = useRef(0);

  /*
   * Keep latest fetchFn in a ref.
   * This prevents the effect from re-running
   * when parent re-renders and creates new arrow function.
   * Without this, your background keeps reloading.
   */
  const fetchFnRef = useRef(fetchFn);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  /*
   * Reset everything when dependencies change.
   * Example: language changes from en-US to fr-FR
   * or genre changes from Action to Comedy.
   *
   * We increment requestId so any in-flight
   * request is ignored (race condition fix).
   */
  useEffect(() => {
    requestId.current += 1;

    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setLoading(false);

    if (observer.current) {
      observer.current.disconnect();
      observer.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, normalizedDeps);

  /*
   * Fetch the current page.
   * This is the core loading logic.
   *
   * We use Promise.resolve().then(() => fetchFn)
   * to support both sync and async fetchFns.
   *
   * Data can be in res.data (axios) or direct res.
   * Results can be in data.results or data itself.
   */
  useEffect(() => {
    let cancelled = false;
    const currentRequest = ++requestId.current;

    /*
     * Stop if we already know there's no more
     * or we hit MAX_PAGES limit.
     */
    if (!hasMore || page > MAX_PAGES) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);

    Promise.resolve()
     .then(() => fetchFnRef.current(page))
     .then((res) => {
        if (cancelled || currentRequest!== requestId.current) {
          return;
        }

        /*
         * Support both axios response and direct data:
         * res.data = axios style
         * res = direct data style (from fixed useFetch)
         */
        const data = res?.data || res || {};

        /*
         * Support both paginated and array responses
         */
        const results = Array.isArray(data.results)
         ? data.results
          : Array.isArray(data)
           ? data
            : [];

        const totalPages = Number(data.total_pages) || 1;

        setItems((previous) => {
          /*
           * If page 1, replace everything.
           * If page > 1, append without duplicates.
           */
          if (page === 1) {
            return results;
          }

          /*
           * Prevent duplicate movies/shows when API
           * returns overlapping results or user
           * scrolls fast.
           */
          const existingIds = new Set(
            previous.map(
              (item) =>
                `${item.media_type || 'unknown'}-${item.id}`
            )
          );

          const newItems = results.filter((item) => {
            const key = `${item.media_type || 'unknown'}-${item.id}`;

            if (existingIds.has(key)) {
              return false;
            }

            existingIds.add(key);
            return true;
          });

          return [...previous,...newItems];
        });

        /*
         * Check if we should load more.
         * page < totalPages AND page < MAX_PAGES
         */
        setHasMore(page < totalPages && page < MAX_PAGES);
        setLoading(false);
      })
     .catch((err) => {
        if (cancelled || currentRequest!== requestId.current) {
          return;
        }

        /*
         * Ignore abort / cancel errors
         * These happen when language changes quickly
         */
        if (
          err?.name === 'CanceledError' ||
          err?.code === 'ERR_CANCELED' ||
          err?.name === 'AbortError'
        ) {
          return;
        }

        setError(
          err?.message || 'Failed to load results. Please try again.'
        );
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, hasMore]);

  /*
   * Observe the last item.
   * When last item becomes visible (with 400px margin),
   * we load next page.
   *
   * 400px rootMargin = loads earlier = smoother
   * No white gap when scrolling fast.
   */
  const lastItemRef = useCallback(
    (node) => {
      if (!node || loading ||!hasMore) {
        return;
      }

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (!entry?.isIntersecting) {
            return;
          }

          if (loading ||!hasMore) {
            return;
          }

          setPage((previous) => {
            if (previous >= MAX_PAGES) {
              return previous;
            }

            return previous + 1;
          });
        },
        {
          root: null,
          rootMargin: '400px 0px',
          threshold: 0.1,
        }
      );

      observer.current.observe(node);
    },
    [loading, hasMore]
  );

  /*
   * Clean up the observer when the component unmounts.
   * Prevents memory leaks and background observers
   * running after page change.
   */
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
    };
  }, []);

  return {
    items,
    loading,
    error,
    hasMore,
    lastItemRef,
  };
};

export default useInfiniteScroll;