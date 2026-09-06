import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getMovieDetails,
  getSeriesDetails,
  getBackdrop,
  getPoster,
  IMAGE_BASE,
} from '../utils/api';
import { useApp } from '../context/AppContext';
import useFetch from '../hooks/useFetch';
import MediaCard from '../components/MediaCard';
import './DetailPage.css';

const SUBTITLE_LANGS = ['English','French','Spanish','German','Italian','Portuguese','Japanese','Korean'];
const SERVERS = [
  { label: 'Server 1', key: '2embed' },
  { label: 'Server 2', key: 'vidsrc' },
  { label: 'Server 3', key: 'autoembed' },
];

function normalizeType(type) { return type === 'tv' || type === 'series'? 'tv' : 'movie'; }
function buildPlayerUrl(server, type, id, season = 1, episode = 1) {
  const mediaType = normalizeType(type);
  if (!id) return '';
  switch (server) {
    case '2embed': return mediaType === 'movie'? `https://www.2embed.cc/embed/${id}` : `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
    case 'vidsrc': return mediaType === 'movie'? `https://vidsrc.to/embed/movie/${id}` : `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
    case 'autoembed': return mediaType === 'movie'? `https://autoembed.co/movie/tmdb/${id}` : `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`;
    default: return '';
  }
}
function formatRuntime(minutes) {
  const v = Number(minutes); if (!Number.isFinite(v) || v <= 0) return null;
  const h = Math.floor(v/60), m = v % 60;
  if (h>0 && m>0) return `${h}h ${m}m`;
  if (h>0) return `${h}h`; return `${m}m`;
}
function formatMoney(value) {
  const a = Number(value); if (!Number.isFinite(a) || a<=0) return null;
  if (a>=1_000_000_000) return `$${(a/1_000_000_000).toFixed(1)}B`;
  if (a>=1_000_000) return `$${(a/1_000_000).toFixed(1)}M`;
  if (a>=1_000) return `$${(a/1_000).toFixed(1)}K`;
  return `$${a.toLocaleString()}`;
}

export default function DetailPage({ type }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, toggleFavorite, isFavorite } = useApp();
  const mediaType = normalizeType(type);

  const [watchMode, setWatchMode] = useState(false);
  const [server, setServer] = useState(SERVERS[0].key);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [selectedSub, setSelectedSub] = useState('English');
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  // FIXED: useCallback to prevent loop
  const fetchFn = useCallback(() => {
    if (!id) return Promise.reject(new Error('Missing media ID'));
    return mediaType === 'movie'? getMovieDetails(id, language) : getSeriesDetails(id, language);
  }, [id, mediaType, language]);

  const { data, loading } = useFetch(fetchFn, [mediaType, id, language]);

  useEffect(() => {
    setWatchMode(false); setServer(SERVERS[0].key); setSeason(1); setEpisode(1);
    setSelectedSub('English'); setSubMenuOpen(false); setTrailerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, mediaType]);

  useEffect(() => {
    if (!trailerOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setTrailerOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [trailerOpen]);

  useEffect(() => {
    if (!trailerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [trailerOpen]);

  if (loading) return <DetailSkeleton />;
  if (!data) {
    return (
      <div className="detail-page"><div className="container">
        <div className="error-state"><p>Failed to load content.</p>
        <button className="btn btn-ghost" type="button" onClick={() => navigate(-1)}>Go Back</button></div>
      </div></div>
    );
  }

  const title = data.title || data.name || 'Untitled';
  const releaseDate = data.release_date || data.first_air_date || '';
  const year = releaseDate.slice(0,4);
  const backdrop = getBackdrop(data.backdrop_path);
  const poster = getPoster(data.poster_path, 'w500');
  const rating = typeof data.vote_average === 'number'? data.vote_average.toFixed(1) : null;
  const runtime = formatRuntime(data.runtime);
  const seasons = mediaType === 'tv'? Number(data.number_of_seasons||0) : 0;
  const genres = Array.isArray(data.genres)? data.genres : [];
  const cast = Array.isArray(data.credits?.cast)? data.credits.cast.slice(0, 14) : [];
  const trailer = Array.isArray(data.videos?.results)? data.videos.results.find(v => v.type==='Trailer' && v.site==='YouTube' && v.key) : null;
  const similar = Array.isArray(data.similar?.results)? data.similar.results.filter(i=>i?.poster_path).slice(0,12) : [];
  const fav = Boolean(isFavorite(data.id, mediaType));

  const availableSeasons = mediaType==='tv'? (Array.isArray(data.seasons)? data.seasons:[]).filter(i=>Number(i.season_number)>0 && Number(i.episode_count)>0) : [];
  const selectedSeason = availableSeasons.find(i=>Number(i.season_number)===Number(season)) || availableSeasons[0];
  const currentSeasonNumber = selectedSeason? Number(selectedSeason.season_number) : 1;
  const totalEpisodes = mediaType==='tv'? Number(selectedSeason?.episode_count||0) : 0;
  const currentEpisode = totalEpisodes>0? Math.min(Math.max(Number(episode)||1,1), totalEpisodes) : 1;
  const playerUrl = buildPlayerUrl(server, mediaType, id, currentSeasonNumber, currentEpisode);

  const handleBack = () => { if (watchMode) { setWatchMode(false); return; } navigate(-1); };
  const handleWatch = () => { setWatchMode(true); setSubMenuOpen(false); window.scrollTo({ top:0, behavior:'smooth'}); };
  const handleSeasonChange = (n) => { setSeason(Number(n)); setEpisode(1); };
  const handleEpisodeChange = (n) => setEpisode(Number(n));
  const handleFavorite = () => toggleFavorite({...data, media_type: mediaType });

  return (
    <div className="detail-page">
      <div className="detail-backdrop">
        {backdrop && <img src={backdrop} alt="" aria-hidden="true" />}
        <div className="detail-backdrop__gradient" />
        <div className="detail-backdrop__vignette" />
      </div>

      <button className="detail-back" type="button" onClick={handleBack}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
        {watchMode? 'Back to details' : 'Back'}
      </button>

      {watchMode? (
        <div className="watch-container container">
          <div className="watch-header">
            <h1 className="watch-title">{title}</h1>
            {mediaType==='tv' && <p className="watch-sub">Season {currentSeasonNumber} · Episode {currentEpisode}</p>}
          </div>

          {playerUrl? (
            <div className="watch-player">
              <iframe key={`${server}-${mediaType}-${id}-${currentSeasonNumber}-${currentEpisode}`} src={playerUrl} title={`Watch ${title}`} allowFullScreen allow="fullscreen; picture-in-picture; autoplay" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          ) : <div className="error-state"><p>Unable to load player.</p></div>}

          <div className="watch-controls">
            <div className="watch-servers">
              <span className="watch-controls__label">Server</span>
              {SERVERS.map((item) => (
                <button key={item.key} className={`server-btn ${server===item.key?'active':''}`} type="button" onClick={()=>setServer(item.key)}>{item.label}</button>
              ))}
            </div>

            <div className="subtitle-selector">
              <button className="btn btn-ghost btn-sm" type="button" onClick={()=>setSubMenuOpen(o=>!o)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 11h8M8 14h5" strokeLinecap="round"/></svg>
                {selectedSub}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {subMenuOpen && (
                <div className="subtitle-menu" role="menu">
                  <p className="subtitle-menu__label">Subtitle Language</p>
                  {SUBTITLE_LANGS.map((lang) => (
                    <button key={lang} className={`subtitle-menu__item ${selectedSub===lang?'active':''}`} type="button" onClick={()=>{setSelectedSub(lang); setSubMenuOpen(false);}}>
                      {selectedSub===lang && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>}
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {mediaType==='tv' && availableSeasons.length>0 && (
            <div className="episode-picker">
              <div className="episode-picker__seasons">
                <span className="watch-controls__label">Season</span>
                <div className="episode-picker__season-btns">
                  {availableSeasons.map((item) => {
                    const sn = Number(item.season_number);
                    return <button key={sn} className={`server-btn ${currentSeasonNumber===sn?'active':''}`} type="button" onClick={()=>handleSeasonChange(sn)}>S{sn}</button>;
                  })}
                </div>
              </div>
              {totalEpisodes>0 && (
                <div className="episode-picker__eps">
                  <span className="watch-controls__label">Episode</span>
                  <div className="episode-picker__ep-grid">
                    {Array.from({length: totalEpisodes}, (_,i)=>i+1).map((ep) => (
                      <button key={ep} className={`ep-btn ${currentEpisode===ep?'active':''}`} type="button" onClick={()=>handleEpisodeChange(ep)}>{ep}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="detail-hero container">
            <div className="detail-poster">
              {poster? <img src={poster} alt={title} loading="eager" /> : <div className="detail-poster__empty" />}
              {fav && <div className="detail-poster__fav-badge">♥ Saved</div>}
            </div>

            <div className="detail-info">
              <div className="detail-meta-top">
                <span className={`badge ${mediaType==='tv'?'badge-blue':'badge-violet'}`}>{mediaType==='tv'?'TV Series':'Movie'}</span>
                {year && <span className="detail-year">{year}</span>}
                {runtime && <span className="detail-runtime">{runtime}</span>}
                {seasons>0 && <span className="detail-runtime">{seasons} {seasons===1?'Season':'Seasons'}</span>}
              </div>

              <h1 className="detail-title">{title}</h1>
              {data.tagline && <p className="detail-tagline">"{data.tagline}"</p>}

              {rating && (
                <div className="detail-ratings">
                  <div className="detail-rating">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color:'var(--accent-gold, #fbbf24)'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    <span className="detail-rating__score">{rating}</span><span className="detail-rating__max">/10</span>
                    {Number(data.vote_count)>0 && <span className="detail-rating__count">({Number(data.vote_count).toLocaleString()} votes)</span>}
                  </div>
                </div>
              )}

              {genres.length>0 && <div className="detail-genres">{genres.map((g)=><span key={g.id||g.name} className="genre-tag">{g.name}</span>)}</div>}
              {data.overview && <p className="detail-overview">{data.overview}</p>}

              <div className="detail-actions">
                <button className="btn btn-primary btn-watch-now" type="button" onClick={handleWatch}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg> Watch Now
                </button>
                {trailer && <button className="btn btn-ghost" type="button" onClick={()=>setTrailerOpen(true)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg> Trailer</button>}
                <button className={`btn btn-ghost ${fav?'btn-fav-active':''}`} type="button" onClick={handleFavorite} aria-pressed={fav}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill={fav?'currentColor':'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                  {fav?'Saved':'Favorite'}
                </button>
              </div>

              {(data.status || data.original_language || Number(data.budget)>0 || Number(data.revenue)>0) && (
                <div className="detail-extras">
                  {data.status && <div className="detail-extra"><span>Status</span><strong>{data.status}</strong></div>}
                  {data.original_language && <div className="detail-extra"><span>Language</span><strong>{String(data.original_language).toUpperCase()}</strong></div>}
                  {Number(data.budget)>0 && <div className="detail-extra"><span>Budget</span><strong>{formatMoney(data.budget)}</strong></div>}
                  {Number(data.revenue)>0 && <div className="detail-extra"><span>Revenue</span><strong>{formatMoney(data.revenue)}</strong></div>}
                </div>
              )}
            </div>
          </div>

          <div className="container detail-sections">
            {cast.length>0 && (
              <section className="detail-section"><h2 className="section-title"><span className="section-title__accent">Cast</span></h2>
                <div className="cast-grid">
                  {cast.map((person)=>(
                    <div key={person.id||person.credit_id||person.name} className="cast-card">
                      <div className="cast-card__img">
                        {person.profile_path? <img src={`${IMAGE_BASE}/w185${person.profile_path}`} alt={person.name||'Cast'} loading="lazy"/> : <div className="cast-card__no-img"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>}
                      </div>
                      <p className="cast-card__name">{person.name}</p>{person.character && <p className="cast-card__role">{person.character}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {similar.length>0 && (
              <section className="detail-section"><h2 className="section-title"><span className="section-title__accent">You May</span> Also Like</h2>
                <div className="grid-cards">{similar.map((item,index)=><MediaCard key={`${item.id}-${index}`} item={{...item, media_type: mediaType}} index={index} />)}</div>
              </section>
            )}
          </div>
        </>
      )}

      {trailerOpen && trailer && (
        <div className="trailer-modal" role="dialog" aria-modal="true" onClick={()=>setTrailerOpen(false)}>
          <div className="trailer-modal__inner" onClick={(e)=>e.stopPropagation()}>
            <button className="trailer-modal__close" type="button" onClick={()=>setTrailerOpen(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            <h3 className="trailer-modal__title">{title} — Trailer</h3>
            <div className="trailer-modal__video"><iframe key={trailer.key} src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`} title={`${title} trailer`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="detail-page">
      <div className="detail-backdrop"><div className="skeleton" style={{ width:'100%', height:'100%' }} /><div className="detail-backdrop__gradient" /></div>
      <div className="detail-hero container detail-skeleton">
        <div className="detail-poster"><div className="skeleton" style={{ width:'100%', aspectRatio:'2 / 3', borderRadius:12 }} /></div>
        <div className="detail-info" style={{ gap:16 }}>
          <div className="skeleton" style={{ width:80, height:22, borderRadius:99 }} />
          <div className="skeleton" style={{ width:'70%', height:52, borderRadius:6 }} />
          <div className="skeleton" style={{ width:'90%', height:14, borderRadius:4 }} />
          <div className="skeleton" style={{ width:'80%', height:14, borderRadius:4 }} />
          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <div className="skeleton" style={{ width:160, height:48, borderRadius:12 }} />
            <div className="skeleton" style={{ width:110, height:48, borderRadius:12 }} />
          </div>
        </div>
      </div>
    </div>
  );
}