import React, { useEffect, useRef, useState } from 'react';
import MediaCard, { MediaCardSkeleton } from '../components/MediaCard';
import { useApp } from '../context/AppContext';
import { searchMulti } from '../utils/api';
import './BrowsePage.css';
import './SearchPage.css';

export default function SearchPage() {
  const { searchQuery, language } = useApp();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const requestIdRef = useRef(0);

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setResults([]);
      setPage(1);
      setTotalPages(0);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;

    setResults([]);
    setPage(1);
    setTotalPages(0);
    setLoading(true);

    searchMulti(query, 1, language)
     .then((res) => {
        if (requestId!== requestIdRef.current) return;

        const data = res?.data || res || {};
        const filteredResults = (data.results || []).filter(
          (item) =>
            item.media_type!== 'person' &&
            item.poster_path
        );

        setResults(filteredResults);
        setTotalPages(Number(data.total_pages) || 0);
      })
     .catch(() => {
        if (requestId!== requestIdRef.current) return;

        setResults([]);
        setTotalPages(0);
      })
     .finally(() => {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      });
  }, [searchQuery, language]);

  const loadMore = async () => {
    const query = searchQuery.trim();

    if (
    !query ||
      loading ||
      loadingMore ||
      page >= totalPages
    ) {
      return;
    }

    const nextPage = page + 1;
    const requestId = requestIdRef.current;

    setLoadingMore(true);

    try {
      const res = await searchMulti(
        query,
        nextPage,
        language
      );

      if (requestId!== requestIdRef.current) return;

      const data = res?.data || res || {};
      const newResults = (data.results || []).filter(
        (item) =>
          item.media_type!== 'person' &&
          item.poster_path
      );

      setResults((previous) => [
      ...previous,
      ...newResults,
      ]);

      setPage(nextPage);
    } catch {
      // Keep existing results when loading another page fails.
    } finally {
      if (requestId === requestIdRef.current) {
        setLoadingMore(false);
      }
    }
  };

  const hasQuery = Boolean(searchQuery.trim());

  return (
    <div className="browse-page container">
      <div className="browse-page__header">
        {hasQuery? (
          <h1 className="browse-page__title">
            Results for{' '}
            <span style={{
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 15px rgba(139,92,246,0.3))',
            }}>
              "{searchQuery.trim()}"
            </span>
            <span style={{
              display: 'inline-flex',
              marginLeft: 12,
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.45)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '4px 10px',
              borderRadius: 99,
              backdropFilter: 'blur(8px)',
              verticalAlign: 'middle',
            }}>
              {results.length > 0? `${results.length} found` : ''}
            </span>
          </h1>
        ) : (
          <h1 className="browse-page__title">
            <span style={{
              background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.6))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Search</span>
          </h1>
        )}

        {/* Cinematic underline */}
        <div style={{
          width: 60,
          height: 3,
          background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
          borderRadius: 99,
          boxShadow: '0 0 12px rgba(139,92,246,0.4)',
          marginTop: 8,
        }} />
      </div>

      {!hasQuery && (
        <div className="search-empty" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px dashed rgba(255,255,255,0.12)',
          borderRadius: 24,
          padding: '64px 32px',
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))',
            border: '1px solid rgba(139,92,246,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 30px rgba(139,92,246,0.15)',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" style={{ opacity: 0.9 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, textAlign: 'center', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
            Use the search bar above to find movies & shows.<br/>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Try "Inception", "Breaking Bad" or "Marvel"</span>
          </p>
        </div>
      )}

      <div className="grid-cards">
        {loading &&
          Array.from({ length: 12 }).map((_, index) => (
            <MediaCardSkeleton key={`search-skeleton-${index}`} />
          ))}

        {!loading &&
          results.map((item, index) => (
            <MediaCard
              key={`${item.media_type}-${item.id}-${index}`}
              item={item}
              index={index % 20}
            />
          ))}

        {loadingMore &&
          Array.from({ length: 6 }).map((_, index) => (
            <MediaCardSkeleton
              key={`more-skeleton-${index}`}
            />
          ))}
      </div>

      {!loading &&
        results.length === 0 &&
        hasQuery && (
          <div className="error-state" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: '48px 24px',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.25, margin: '0 auto 16px', display: 'block' }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
              No results for "{searchQuery.trim()}"
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center', marginTop: 6 }}>
              Try different keywords or check spelling.
            </p>
          </div>
        )}

      {!loading &&
        results.length > 0 &&
        page < totalPages && (
          <div className="search-load-more" style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                minWidth: 160,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '12px 24px',
                color: '#fff',
                fontWeight: 600,
                boxShadow: loadingMore? 'none' : '0 4px 16px rgba(0,0,0,0.2)',
                opacity: loadingMore? 0.6 : 1,
              }}
            >
              {loadingMore? 'Loading...' : `Load More • ${totalPages - page} left`}
            </button>
          </div>
        )}

      {!loading && results.length > 0 && page >= totalPages && totalPages > 1 && (
        <div style={{ textAlign: 'center', padding: '40px 0 20px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
          <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)', margin: '0 auto 12px' }} />
          End • {results.length} results for "{searchQuery.trim()}"
        </div>
      )}
    </div>
  );
}