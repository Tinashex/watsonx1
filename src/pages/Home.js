import React, { useCallback } from 'react';
import HeroSlider, { HeroSkeleton } from '../components/HeroSlider';
import MediaRow from '../components/MediaRow';
import { useApp } from '../context/AppContext';
import {
  getTrending,
  getPopularMovies,
  getPopularSeries,
  getTopRatedMovies,
  getNowPlaying,
} from '../utils/api';
import useFetch from '../hooks/useFetch';

export default function Home() {
  const { language } = useApp();

  // FIXED: useCallback prevents infinite refetch
  const fetchTrending = useCallback(() => getTrending('all', 'week', language), [language]);
  const fetchPopularMovies = useCallback(() => getPopularMovies(1, language), [language]);
  const fetchPopularSeries = useCallback(() => getPopularSeries(1, language), [language]);
  const fetchTopRated = useCallback(() => getTopRatedMovies(1, language), [language]);
  const fetchNowPlaying = useCallback(() => getNowPlaying(1, language), [language]);

  const { data: trending, loading: trendingLoading } = useFetch(fetchTrending, [language]);
  const { data: popularMovies, loading: popularMoviesLoading } = useFetch(fetchPopularMovies, [language]);
  const { data: popularSeries, loading: popularSeriesLoading } = useFetch(fetchPopularSeries, [language]);
  const { data: topRated, loading: topRatedLoading } = useFetch(fetchTopRated, [language]);
  const { data: nowPlaying, loading: nowPlayingLoading } = useFetch(fetchNowPlaying, [language]);

  const trendingItems = Array.isArray(trending?.results?? trending)? (trending.results?? trending) : [];
  const heroItems = trendingItems.filter((item) => item?.backdrop_path).slice(0, 6);

  const popularMovieItems = Array.isArray(popularMovies?.results?? popularMovies)? (popularMovies.results?? popularMovies) : [];
  const popularSeriesItems = Array.isArray(popularSeries?.results?? popularSeries)
  ? (popularSeries.results?? popularSeries).map((item) => ({...item, media_type: 'tv' }))
    : [];
  const topRatedItems = Array.isArray(topRated?.results?? topRated)? (topRated.results?? topRated) : [];
  const nowPlayingItems = Array.isArray(nowPlaying?.results?? nowPlaying)? (nowPlaying.results?? nowPlaying) : [];

  return (
    <div>
      {trendingLoading? <HeroSkeleton /> : <HeroSlider items={heroItems} />}

      <div style={{ padding: '48px 0 0' }}>
        <div className="container">
          <MediaRow title="Trending" accent="🔥" items={trendingItems} loading={trendingLoading} seeAllLink="/movies" />
          <MediaRow title="Now Playing" accent="🎬" items={nowPlayingItems} loading={nowPlayingLoading} seeAllLink="/movies" />
          <MediaRow title="Popular Movies" accent="🍿" items={popularMovieItems} loading={popularMoviesLoading} seeAllLink="/movies" mediaType="movie" />
          <MediaRow title="Popular Series" accent="📺" items={popularSeriesItems} loading={popularSeriesLoading} seeAllLink="/series" mediaType="tv" />
          <MediaRow title="Top Rated" accent="⭐" items={topRatedItems} loading={topRatedLoading} seeAllLink="/movies" mediaType="movie" />
        </div>
      </div>
    </div>
  );
}