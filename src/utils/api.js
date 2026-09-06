import axios from 'axios';

const BASE_URL = process.env.REACT_APP_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
export const IMAGE_BASE = process.env.REACT_APP_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p';

const api = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY },
  timeout: 10000,
});

export const getPoster = (path, size = 'w500') =>
  path? `${IMAGE_BASE}/${size}${path}` : null;

export const getBackdrop = (path, size = 'w1280') =>
  path? `${IMAGE_BASE}/${size}${path}` : null;

export const getProfile = (path, size = 'w185') =>
  path? `${IMAGE_BASE}/${size}${path}` : null;

export const getTrending = (type = 'all', window = 'week', language = 'en-US') =>
  api.get(`/trending/${type}/${window}`, { params: { language } });

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
  api.get('/discover/movie', { params: { with_genres: genreId, page, language, sort_by: 'popularity.desc', include_adult: false } });

export const getSeriesByGenre = (genreId, page = 1, language = 'en-US') =>
  api.get('/discover/tv', { params: { with_genres: genreId, page, language, sort_by: 'popularity.desc', include_adult: false } });

export const getMovieDetails = (id, language = 'en-US') =>
  api.get(`/movie/${id}`, { params: { language, append_to_response: 'credits,videos,similar,reviews,images' } });

export const getSeriesDetails = (id, language = 'en-US') =>
  api.get(`/tv/${id}`, { params: { language, append_to_response: 'credits,videos,similar,reviews,images' } });

export const searchMulti = (query, page = 1, language = 'en-US') =>
  api.get('/search/multi', { params: { query, page, language, include_adult: false } });

export const getMovieGenres = (language = 'en-US') =>
  api.get('/genre/movie/list', { params: { language } });

export const getTVGenres = (language = 'en-US') =>
  api.get('/genre/tv/list', { params: { language } });

export const getPersonDetails = (id, language = 'en-US') =>
  api.get(`/person/${id}`, { params: { language, append_to_response: 'movie_credits,tv_credits' } });

export default api;
