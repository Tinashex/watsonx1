import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBackdrop, getPoster } from '../utils/api';
import './HeroSlider.css';

export default function HeroSlider({ items = [] }) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const navigate = useNavigate();

  const slides = useMemo(() => items.slice(0, 6), [items]);

  const go = useCallback(
    (index) => {
      if (transitioning || slides.length < 2) return;
      const nextIndex = ((index % slides.length) + slides.length) % slides.length;
      if (nextIndex === current) return;

      setTransitioning(true);
      setTimeout(() => {
        setCurrent(nextIndex);
        setTransitioning(false);
      }, 300);
    },
    [transitioning, slides.length, current, slides]
  );

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      // Use transitioning animation for auto-play too
      setTransitioning(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setTransitioning(false);
      }, 300);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, slides]);

  useEffect(() => {
    if (current >= slides.length && slides.length > 0) {
      setCurrent(0);
    }
  }, [current, slides.length]);

  if (!slides.length) {
    return <div className="hero hero--empty" aria-hidden="true" />;
  }

  const item = slides[current];
  const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const title = item.title || item.name || 'Untitled';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const backdrop = getBackdrop(item.backdrop_path);
  const poster = getPoster(item.poster_path, 'w342');
  const rating = item.vote_average > 0 ? item.vote_average.toFixed(1) : null;
  const overview = item.overview
    ? `${item.overview.slice(0, 180)}${item.overview.length > 180 ? '…' : ''}`
    : '';

  const openDetails = () => {
    navigate(`/${mediaType}/${item.id}`);
  };

  return (
    <section className="hero" aria-label="Featured movies and TV shows">
      {/* CINEMATIC BACKGROUND */}
      <div className={`hero__bg ${transitioning ? 'fading' : ''}`}>
        {backdrop ? (
          <img src={backdrop} alt="" aria-hidden="true" key={item.id} loading="eager" />
        ) : (
          <div className="hero__bg-fallback" />
        )}
        <div className="hero__bg-gradient" />
        <div className="hero__bg-side" />
      </div>

      <div className={`hero__content container ${transitioning ? 'fading' : ''}`}>
        <div className="hero__meta">
          <span className={`badge ${mediaType === 'tv' ? 'badge-blue' : 'badge-red'}`}>
            {mediaType === 'tv' ? 'TV Series' : 'Movie'}
          </span>
          {year && <span className="hero__year">{year}</span>}
          {rating && (
            <span className="hero__rating" aria-label={`Rating ${rating} out of 10`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {rating}
            </span>
          )}
        </div>

        <h1 className="hero__title">{title}</h1>
        {overview && <p className="hero__overview">{overview}</p>}

        <div className="hero__actions">
          <button type="button" className="btn btn-primary" onClick={openDetails}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Watch Now
          </button>
          <button type="button" className="btn btn-ghost" onClick={openDetails}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            More Info
          </button>
        </div>
      </div>

      {poster && (
        <div className={`hero__poster ${transitioning ? 'fading' : ''}`}>
          <img src={poster} alt={`${title} poster`} loading="lazy" />
        </div>
      )}

      {slides.length > 1 && (
        <div className="hero__dots" role="tablist" aria-label="Featured content">
          {slides.map((slide, index) => (
            <button
              key={slide.id || index}
              type="button"
              className={`hero__dot ${index === current ? 'active' : ''}`}
              onClick={() => go(index)}
              aria-label={`Show slide ${index + 1}`}
              aria-selected={index === current}
              role="tab"
            />
          ))}
        </div>
      )}

      {slides.length > 1 && (
        <div className="hero__progress" aria-hidden="true">
          <div className="hero__progress-bar" key={current} />
        </div>
      )}
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <div className="hero hero--skeleton" aria-hidden="true">
      <div className="skeleton" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
      <div className="hero__content container">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 99 }} />
          <div className="skeleton" style={{ width: 40, height: 22, borderRadius: 99 }} />
        </div>
        <div className="skeleton" style={{ width: '55%', height: 56, borderRadius: 6, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: '70%', height: 14, borderRadius: 4, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '60%', height: 14, borderRadius: 4, marginBottom: 32 }} />
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="skeleton" style={{ width: 140, height: 44, borderRadius: 6 }} />
          <div className="skeleton" style={{ width: 120, height: 44, borderRadius: 6 }} />
        </div>
      </div>
    </div>
  );
}