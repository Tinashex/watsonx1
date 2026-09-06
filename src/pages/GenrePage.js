import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import MediaCard, { MediaCardSkeleton } from '../components/MediaCard';
import { useApp } from '../context/AppContext';
import { getMoviesByGenre } from '../utils/api';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import './BrowsePage.css';

/*
 * Genre labels with cinematic colors
 * Now using violet/pink system instead of flat orange
 */
const GENRE_LABELS = {
  action: {
    label: 'Action',
    emoji: '💥',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  },
  drama: {
    label: 'Drama',
    emoji: '🎭',
    color: '#63b3ed',
    gradient: 'linear-gradient(135deg, #63b3ed, #8b5cf6)',
  },
  comedy: {
    label: 'Comedy',
    emoji: '😄',
    color: '#f6e05e',
    gradient: 'linear-gradient(135deg, #f6e05e, #f59e0b)',
  },
  horror: {
    label: 'Horror',
    emoji: '👻',
    color: '#9f7aea',
    gradient: 'linear-gradient(135deg, #9f7aea, #6b46c1)',
  },
  romance: {
    label: 'Romance',
    emoji: '💕',
    color: '#fc8181',
    gradient: 'linear-gradient(135deg, #fc8181, #ec4899)',
  },
  'sci-fi': {
    label: 'Sci-Fi',
    emoji: '🚀',
    color: '#68d391',
    gradient: 'linear-gradient(135deg, #68d391, #3b82f6)',
  },
};

export default function GenrePage() {
  const { id, name } = useParams();
  const { language } = useApp();

  const genreKey = decodeURIComponent(name || '')
  .trim()
  .toLowerCase();

  const genreInfo = GENRE_LABELS[genreKey] || {
    label: genreKey
    ? genreKey.charAt(0).toUpperCase() + genreKey.slice(1)
      : 'Genre',
    emoji: '🎬',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
  };

  const genreId = Number(id);

  /*
   * FIXED: useInfiniteScroll signature
   * Old: (page, lang) => getMoviesByGenre(genreId, page, lang)
   * This caused double lang and broken fetch.
   *
   * New: useCallback that captures genreId + language
   * Dependencies array handles reset when language changes.
   * useInfiniteScroll now calls fetchFn(page) only.
   */
  const fetchByGenre = useCallback(
    (page) => {
      if (!Number.isFinite(genreId) || genreId <= 0) {
        return Promise.resolve({ results: [], total_pages: 0 });
      }
      return getMoviesByGenre(genreId, page, language);
    },
    [genreId, language]
  );

  const { items, loading, error, lastItemRef, hasMore } = useInfiniteScroll(
    fetchByGenre,
    [genreId, language]
  );

  return (
    <div className="browse-page container">
      <div className="browse-page__header">
        <h1
          className="browse-page__title"
          style={{
            background: genreInfo.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: `drop-shadow(0 0 20px ${genreInfo.color}40)`,
          }}
        >
          {genreInfo.emoji} {genreInfo.label}
        </h1>

        <p
          style={{
            color: 'rgba(255,255,255,0.5)',
            marginTop: -12,
            marginBottom: 8,
            fontSize: 14,
          }}
        >
          Browse all {genreInfo.label.toLowerCase()} movies • {items.length > 0? `${items.length} loaded` : 'Cinematic collection'}
        </p>

        {/* Genre accent line */}
        <div
          style={{
            width: 60,
            height: 3,
            background: genreInfo.gradient,
            borderRadius: 99,
            boxShadow: `0 0 10px ${genreInfo.color}60`,
            marginTop: 4,
            marginBottom: 8,
          }}
        />
      </div>

      {/* Error state */}
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
            <MediaCardSkeleton key={`genre-skeleton-${index}`} />
          ))}
      </div>

      {/* Empty state */}
      {!loading && items.length === 0 &&!error && (
        <div className="error-state">
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: `${genreInfo.color}15`,
            border: `1px solid ${genreInfo.color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: `0 0 30px ${genreInfo.color}20`,
          }}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke={genreInfo.color}
              strokeWidth="1.5"
              style={{ opacity: 0.8 }}
            >
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <path d="M8 15l2.5-3 2 2 2.5-3 2 4" />
            </svg>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
            No {genreInfo.label.toLowerCase()} movies found.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
            Try another genre or check back later for new additions.
          </p>
        </div>
      )}

      {/* End of results */}
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
            background: `linear-gradient(90deg, transparent, ${genreInfo.color}60, transparent)`,
            margin: '0 auto 12px',
          }} />
          You've reached the end • {items.length} titles
        </div>
      )}
    </div>
  );
}