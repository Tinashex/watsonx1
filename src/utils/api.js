import axios from 'axios';

const BASE_URL = process.env.REACT_APP_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
export const IMAGE_BASE = process.env.REACT_APP_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p';

// Simple in-memory cache to prevent flicker
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const api = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY },
  timeout: 10000,
});

// Request interceptor - add timestamp to bust aggressive browser cache on language change
api.interceptors.request.use((config) => {
  // Don't cache details pages aggressively
  if (config.url?.includes('/movie/') || config.url?.includes('/tv/') || config.url?.includes('/person/')) {
    config.params = { ...config.params, _t: Date.now() };
  }
  return config;
});

// Response cache interceptor
api.interceptors.response.use(
  (response) => {
    const key = `${response.config.url}?${new URLSearchParams(response.config.params).toString()}`;
    cache.set(key, { data: response.data, ts: Date.now() });
    return response;
  },
  (error) => {
    // Silent fail for abort
    if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
      return Promise.reject(error);
    }
    console.error('[TMDB API Error]', error?.response?.status, error?.config?.url, error?.message);
    return Promise.reject(error);
  }
);

function getCacheKey(url, params) {
  return `${url}?${new URLSearchParams(params).toString()}`;
}

function withCache(fn) {
  return async (...args) => {
    // Build cache key from fn args
    try {
      const res = await fn(...args);
      return res;
    } catch (e) {
      throw e;
    }
  };
}

/* Images - Now with fallback handling */
export const getPoster = (path, size = 'w500') =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;

export const getBackdrop = (path, size = 'w1280') =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;

export const getProfile = (path, size = 'w185') =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;

/* Trending */
export const getTrending = (type = 'all', window = 'week', language = 'en-US') =>
  api.get(`/trending/${type}/${window}`, { params: { language } });

/* Movies */
export const getPopularMovies = (page = 1, language = 'en-US') =>
  api.get('/movie/popular', { params: { page, language } });

export const getPopularSeries = (page = 1, language = 'en-US') =>
  api.get('/tv/popular', { params: { page, language } });

export const getTopRatedMovies = (page = 1, language = 'en-US') =>
  api.get('/movie/top_rated', { params: { page, language } });

export const getUpcomingMovies = (page = 1, language = 'en-US') =>
  api.get('/movie/upcoming', { params: { page, language } });

export const getNowPlaying = (page = 1, language = 'en-US') =>
  api.get('/movie/now_playing', { params: { page, language } });

export const getMoviesByGenre = (genreId, page = 1, language = 'en-US') =>
  api.get('/discover/movie', { 
    params: { 
      with_genres: genreId, 
      page, 
      language, 
      sort_by: 'popularity.desc',
      include_adult: false,
      include_video: false,
    } 
  });

export const getSeriesByGenre = (genreId, page = 1, language = 'en-US') =>
  api.get('/discover/tv', { 
    params: { 
      with_genres: genreId, 
      page, 
      language, 
      sort_by: 'popularity.desc',
      include_adult: false,
    } 
  });

/* Details - Cinematic append */
export const getMovieDetails = (id, language = 'en-US') =>
  api.get(`/movie/${id}`, { 
    params: { 
      language, 
      append_to_response: 'credits,videos,similar,reviews,images,external_ids' 
    } 
  });

export const getSeriesDetails = (id, language = 'en-US') =>
  api.get(`/tv/${id}`, { 
    params: { 
      language, 
      append_to_response: 'credits,videos,similar,reviews,images,external_ids' 
    } 
  });

export const searchMulti = (query, page = 1, language = 'en-US') =>
  api.get('/search/multi', { 
    params: { 
      query, 
      page, 
      language,
      include_adult: false,
    } 
  });

export const getMovieGenres = (language = 'en-US') =>
  api.get('/genre/movie/list', { params: { language } });

export const getTVGenres = (language = 'en-US') =>
  api.get('/genre/tv/list', { params: { language } });

export const getPersonDetails = (id, language = 'en-US') =>
  api.get(`/person/${id}`, { 
    params: { 
      language,
      append_to_response: 'movie_credits,tv_credits,images,external_ids' 
    } 
  });

/* Extra cinematic endpoints */
export const getMovieVideos = (id, language = 'en-US') =>
  api.get(`/movie/${id}/videos`, { params: { language } });

export const getSeriesVideos = (id, language = 'en-US') =>
  api.get(`/tv/${id}/videos`, { params: { language } });

export const getRecommendations = (id, type = 'movie', language = 'en-US') =>
  api.get(`/${type}/${id}/recommendations`, { params: { language } });

export default api;