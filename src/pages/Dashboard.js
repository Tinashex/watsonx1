import React, { useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { getTrending, getTopRatedMovies } from '../utils/api';
import useFetch from '../hooks/useFetch';
import MediaCard from '../components/MediaCard';
import MediaRow from '../components/MediaRow';
import './Dashboard.css';

const STATS = [
  { label: 'Watchlist', icon: '🎬' },
  { label: 'Reviews', icon: '⭐' },
  { label: 'Hours Watched', icon: '⏱' },
  { label: 'Genres Explored', icon: '🗂' },
];

export default function Dashboard() {
  const { favorites, language } = useApp();

  // FIXED: useCallback prevents infinite refetch loop
  const fetchTrending = useCallback(() => {
    return getTrending('movie', 'week', language);
  }, [language]);

  const fetchTopRated = useCallback(() => {
    return getTopRatedMovies(1, language);
  }, [language]);

  const { data: trending, loading: trendingLoading } = useFetch(fetchTrending, [language]);
  const { data: topRated, loading: trLoading } = useFetch(fetchTopRated, [language]);

  const recentFavs = useMemo(() => {
    return [...favorites].sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
  }, [favorites]);

  const genresExplored = useMemo(() => {
    const genres = new Set();
    favorites.forEach((item) => {
      if (Array.isArray(item.genre_ids)) {
        item.genre_ids.forEach((id) => { if (id) genres.add(id); });
      }
      // Also support item.genres [{id}]
      if (Array.isArray(item.genres)) {
        item.genres.forEach((g) => { if (g?.id) genres.add(g.id); });
      }
    });
    return genres.size;
  }, [favorites]);

  // EXTRA: Calculate hours from runtime if available, else estimate 2h per title
  const hoursWatched = useMemo(() => {
    if (!favorites.length) return 0;
    const totalMinutes = favorites.reduce((acc, item) => {
      if (item.runtime) return acc + item.runtime;
      return acc + 120; // estimate 2h per movie/show
    }, 0);
    return Math.floor(totalMinutes / 60);
  }, [favorites]);

  const stats = useMemo(() => {
    return [
      favorites.length,
      0, // Reviews placeholder - will be 0 until you add reviews feature
      hoursWatched,
      genresExplored,
    ];
  }, [favorites.length, hoursWatched, genresExplored]);

  const hasFavs = recentFavs.length > 0;

  return (
    <main className="dashboard container">
      {/* Hero */}
      <section className="dashboard__hero">
        <div className="dashboard__profile">
          <div className="dashboard__avatar" aria-label="Watson Movies user">
            <span>WM</span>
            <div className="dashboard__avatar-ring" />
          </div>
          <div className="dashboard__profile-info">
            <h1 className="dashboard__username">Watson Movies</h1>
            <p className="dashboard__joined">
              {hasFavs? `${favorites.length} titles in your collection` : 'Your personal movie dashboard'}
            </p>
            <div className="dashboard__tags">
              <span className="badge badge-violet">Movie Lover</span>
              <span className="badge badge-glass">
                {genresExplored > 0? `${genresExplored} Genres` : 'Watson Movies'}
              </span>
              {hasFavs && <span className="badge badge-glass">{hoursWatched}h Estimated</span>}
            </div>
          </div>
        </div>

        <div className="dashboard__stats">
          {STATS.map((stat, index) => (
            <div key={stat.label} className="dashboard__stat">
              <span className="dashboard__stat-icon" aria-hidden="true">{stat.icon}</span>
              <span className="dashboard__stat-value">{stats[index]}</span>
              <span className="dashboard__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Favorites Grid */}
      {hasFavs && (
        <section className="dashboard__section">
          <div className="section-header">
            <h2 className="section-title">
              <span className="section-title__accent">My</span> Favorites
            </h2>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 12 }}>
              {recentFavs.length} titles • Sorted by recent
            </span>
          </div>
          <div className="grid-cards">
            {recentFavs.map((item, index) => (
              <MediaCard key={`${item.media_type}-${item.id}-${index}`} item={item} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State - Cinematic */}
      {!hasFavs && (
        <section className="dashboard__empty-favs">
          <div className="dashboard__empty-favs-inner">
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.1))',
              border: '1px solid rgba(139,92,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(139,92,246,0.15)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
            <h3 style={{ fontSize: 18, color: '#fff', margin: '8px 0 0', fontWeight: 600 }}>No favorites yet</h3>
            <p style={{ maxWidth: 320, margin: 0 }}>
              Browse movies and tap the ♥ button to save them here. Your collection will appear with a beautiful glass grid.
            </p>
          </div>
        </section>
      )}

      {/* Rows */}
      <MediaRow
        title="Trending This Week"
        accent="🔥"
        items={trending?.results || trending || []}
        loading={trendingLoading}
        seeAllLink="/movies"
        mediaType="movie"
      />

      <MediaRow
        title="Critically Acclaimed"
        accent="⭐"
        items={topRated?.results || topRated || []}
        loading={trLoading}
        seeAllLink="/movies"
        mediaType="movie"
      />
    </main>
  );
}