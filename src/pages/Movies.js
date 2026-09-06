import React, { useState, useCallback } from 'react';
import MediaCard, { MediaCardSkeleton } from '../components/MediaCard';
import { useApp } from '../context/AppContext';
import {
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlaying,
  getMoviesByGenre,
} from '../utils/api';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import './BrowsePage.css';

/*
 * Filters with cinematic icons
 * Same IDs but upgraded with emoji for glass pills
 */
const FILTERS = [
  {
    label: 'Popular',
    emoji: '🔥',
    fn: (page, language) => getPopularMovies(page, language),
  },
  {
    label: 'Top Rated',
    emoji: '⭐',
    fn: (page, language) => getTopRatedMovies(page, language),
  },
  {
    label: 'Upcoming',
    emoji: '📅',
    fn: (page, language) => getUpcomingMovies(page, language),
  },
  {
    label: 'Now Playing',
    emoji: '🎬',
    fn: (page, language) => getNowPlaying(page, language),
  },
  {
    label: 'Action',
    emoji: '💥',
    fn: (page, language) => getMoviesByGenre(28, page, language),
  },
  {
    label: 'Drama',
    emoji: '🎭',
    fn: (page, language) => getMoviesByGenre(18, page, language),
  },
  {
    label: 'Comedy',
    emoji: '😄',
    fn: (page, language) => getMoviesByGenre(35, page, language),
  },
  {
    label: 'Horror',
    emoji: '👻',
    fn: (page, language) => getMoviesByGenre(27, page, language),
  },
  {
    label: 'Sci-Fi',
    emoji: '🚀',
    fn: (page, language) => getMoviesByGenre(878, page, language),
  },
];

export default function Movies() {
  const { language } = useApp();
  const [activeFilter, setActiveFilter] = useState(0);

  /*
   * FIXED: Old code did:
   * useInfiniteScroll((page, lang) => FILTERS[active].fn(page, lang), language)
   *
   * Problem: activeFilter changes, but hook only saw `language` deps,
   * so grid never reset + caused duplicate requests and background flicker.
   *
   * New: useCallback capturing activeFilter + language
   * and dependencies [activeFilter, language] so hook resets correctly.
   */
  const fetchMovies = useCallback(
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
    fetchMovies,
    [activeFilter, language]
  );

  const handleFilter = (index) => {
    if (index!== activeFilter) {
      setActiveFilter(index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeLabel = FILTERS[activeFilter]?.label || 'Movies';

  return (
    <div className="browse-page container">
      <div className="browse-page__header">
        <h1 className="browse-page__title">
          <span style={{
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {FILTERS[activeFilter]?.emoji || '🎬'} {activeLabel}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.9)', marginLeft: 8 }}>Movies</span>
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

        {/* Result count + glass accent */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 4,
        }}>
          <div style={{
            width: 40,
            height: 2,
            background: 'linear-gradient(90deg, #8b5cf6, transparent)',
            borderRadius: 99,
          }} />
          <p style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: 13,
            margin: 0,
          }}>
            {items.length > 0? `${items.length} titles loaded` : 'Browse cinematic collection'} • {FILTERS[activeFilter]?.label}
          </p>
        </div>
      </div>

      {/* Error */}
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
              item={{...item, media_type: 'movie' }}
              index={index % 20}
            />
          </div>
        ))}

        {loading &&
          Array.from({ length: 12 }).map((_, index) => (
            <MediaCardSkeleton key={`movie-skeleton-${index}`} />
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
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>No results found for {activeLabel}.</p>
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
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)',
            margin: '0 auto 12px',
          }} />
          End of {activeLabel.toLowerCase()} • {items.length} titles
        </div>
      )}
    </div>
  );
}