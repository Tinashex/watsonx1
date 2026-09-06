import React, { useState, useCallback } from 'react';
import MediaCard, { MediaCardSkeleton } from '../components/MediaCard';
import { useApp } from '../context/AppContext';
import {
  getPopularSeries,
  getSeriesByGenre,
} from '../utils/api';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import './BrowsePage.css';

/*
 * Series filters with cinematic emojis
 * Genre IDs for TV are different than movies
 */
const FILTERS = [
  {
    label: 'Popular',
    emoji: '🔥',
    fn: (page, language) => getPopularSeries(page, language),
  },
  {
    label: 'Action',
    emoji: '💥',
    fn: (page, language) => getSeriesByGenre(10759, page, language),
  },
  {
    label: 'Drama',
    emoji: '🎭',
    fn: (page, language) => getSeriesByGenre(18, page, language),
  },
  {
    label: 'Comedy',
    emoji: '😄',
    fn: (page, language) => getSeriesByGenre(35, page, language),
  },
  {
    label: 'Crime',
    emoji: '🕵️',
    fn: (page, language) => getSeriesByGenre(80, page, language),
  },
  {
    label: 'Sci-Fi',
    emoji: '🚀',
    fn: (page, language) => getSeriesByGenre(10765, page, language),
  },
  {
    label: 'Mystery',
    emoji: '🔍',
    fn: (page, language) => getSeriesByGenre(9648, page, language),
  },
];

export default function Series() {
  const { language } = useApp();
  const [activeFilter, setActiveFilter] = useState(0);

  /*
   * FIXED: Same bug as Movies.js
   * Old hook never reset when activeFilter changed
   * because dependency was only `language`.
   * This caused old series to stay + blank after click.
   *
   * New: useCallback captures activeFilter + language
   * and deps [activeFilter, language] force reset.
   */
  const fetchSeries = useCallback(
    (page) => {
      const current = FILTERS[activeFilter];
      if (!current) {
        return Promise.resolve({ results: [], total_pages: 0 });
      }
      return current.fn(page, language);
    },
    [activeFilter, language]
  );

  const { items, loading, error, hasMore, lastItemRef } = useInfiniteScroll(
    fetchSeries,
    [activeFilter, language]
  );

  const handleFilter = (index) => {
    if (index!== activeFilter) {
      setActiveFilter(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeLabel = FILTERS[activeFilter]?.label || 'Series';

  return (
    <div className="browse-page container">
      <div className="browse-page__header">
        <h1 className="browse-page__title">
          <span style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 20px rgba(59,130,246,0.3))',
          }}>
            {FILTERS[activeFilter]?.emoji || '📺'} {activeLabel}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.9)', marginLeft: 8 }}>Series</span>
        </h1>

        <div className="filter-pills">
          {FILTERS.map((filter, index) => (
            <button
              key={filter.label}
              type="button"
              className={`filter-pill ${
                index === activeFilter? 'active' : ''
              }`}
              onClick={() => handleFilter(index)}
              aria-pressed={index === activeFilter}
            >
              <span style={{ marginRight: 4 }}>{filter.emoji}</span>
              {filter.label}
            </button>
          ))}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 4,
        }}>
          <div style={{
            width: 40,
            height: 2,
            background: 'linear-gradient(90deg, #3b82f6, transparent)',
            borderRadius: 99,
          }} />
          <p style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: 13,
            margin: 0,
          }}>
            {items.length > 0? `${items.length} series loaded` : 'Browse cinematic TV collection'} • {FILTERS[activeFilter]?.label}
          </p>
        </div>
      </div>

      {error && (
        <div className="error-state" style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          backdropFilter: 'blur(12px)',
        }}>
          <p style={{ color: '#fca5a5' }}>{error}</p>
        </div>
      )}

      <div className="grid-cards">
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            ref={index === items.length - 1? lastItemRef : null}
          >
            <MediaCard
              item={{...item, media_type: 'tv' }}
              index={index % 20}
            />
          </div>
        ))}

        {loading &&
          Array.from({ length: 12 }).map((_, index) => (
            <MediaCardSkeleton key={`series-skeleton-${index}`} />
          ))}
      </div>

      {!loading && items.length === 0 &&!error && (
        <div className="error-state" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
          backdropFilter: 'blur(16px)',
          border: '1px dashed rgba(255,255,255,0.12)',
          borderRadius: 20,
          padding: '48px 24px',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>No results found for {activeLabel} series.</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 6 }}>
            Try another filter or change language.
          </p>
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 0 20px',
          color: 'rgba(255,255,255,0.3)',
          fontSize: 13,
        }}>
          <div style={{
            width: 40,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)',
            margin: '0 auto 12px',
          }} />
          End of {activeLabel.toLowerCase()} • {items.length} series
        </div>
      )}
    </div>
  );
}