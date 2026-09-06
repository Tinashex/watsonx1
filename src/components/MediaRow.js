import React, { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import MediaCard, { MediaCardSkeleton } from './MediaCard';
import './MediaRow.css';

export default function MediaRow({ title, accent, items = [], loading, seeAllLink, mediaType }) {
  const rowRef = useRef(null);
  const scroll = useCallback((dir) => {
    rowRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  }, []);

  return (
    <section className="media-row" aria-label={title}>
      <div className="section-header">
        <h2 className="section-title">
          {accent? <><span className="section-title__accent">{accent}</span> {title}</> : title}
        </h2>
        <div className="media-row__controls">
          {seeAllLink && (
            <Link to={seeAllLink} className="see-all">See all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          )}
          <div className="media-row__arrows">
            <button type="button" className="row-arrow" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg></button>
            <button type="button" className="row-arrow" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg></button>
          </div>
        </div>
      </div>
      <div className="media-row__track" ref={rowRef} role="list">
        {loading? Array.from({ length: 8 }).map((_, i) => <MediaCardSkeleton key={`skeleton-${i}`} />)
        : items.length > 0? items.map((item, index) => (
            <div className="media-row__item" key={`${item.id}-${index}`} role="listitem">
              <MediaCard item={item} index={index} mediaType={mediaType} />
            </div>
          ))
        : <div className="media-row__empty"><p>No movies available right now.</p></div>}
      </div>
    </section>
  );
}