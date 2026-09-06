import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPoster } from '../utils/api';
import { useApp } from '../context/AppContext';
import './MediaCard.css';

const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

export default function MediaCard({ item, index = 0 }) {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useApp();
  const [imgError, setImgError] = useState(false);
  const mediaType = item.media_type || (item.first_air_date? 'tv' : 'movie');
  const title = item.title || item.name || 'Unknown';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const rating = item.vote_average? item.vote_average.toFixed(1) : null;
  const poster = getPoster(item.poster_path);
  const fav = isFavorite(item.id, mediaType);

  return (
    <article className="media-card" style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
      onClick={() => navigate(`/${mediaType}/${item.id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/${mediaType}/${item.id}`); }}}
      role="button" tabIndex={0} aria-label={`View ${title}`}>
      <div className="media-card__poster">
        {poster &&!imgError? <img src={poster} alt={`${title} poster`} loading="lazy" onError={() => setImgError(true)} />
        : <div className="media-card__no-poster"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>}
        <div className="media-card__overlay">
          <button type="button" className={`media-card__fav ${fav? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavorite({...item, media_type: mediaType}); }} aria-pressed={fav}><HeartIcon filled={fav} /></button>
          <div className="media-card__play"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
        </div>
        {rating && <div className="media-card__rating"><StarIcon /><span>{rating}</span></div>}
        <div className={`media-card__type ${mediaType}`}>{mediaType === 'tv'? 'TV' : 'FILM'}</div>
      </div>
      <div className="media-card__info"><h3 className="media-card__title">{title}</h3>{year && <p className="media-card__year">{year}</p>}</div>
    </article>
  );
}
export function MediaCardSkeleton() {
  return (<div className="media-card media-card--skeleton" aria-hidden="true"><div className="media-card__poster skeleton" /><div className="media-card__info"><div className="skeleton" style={{ height: 14, width: '80%', borderRadius: 4 }} /><div className="skeleton" style={{ height: 11, width: '40%', borderRadius: 4, marginTop: 6 }} /></div></div>);
}