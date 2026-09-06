import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Navbar.css';

export default function Navbar() {
  const {
    language,
    setLanguage,
    setSidebarOpen,
    sidebarOpen,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() && location.pathname !== '/search') {
      navigate('/search');
    }
    if (!val.trim() && location.pathname === '/search') {
      navigate('/'); // FIX: was navigate(-1) which breaks history
    }
  };

  const handleSearchToggle = () => {
    if (searchOpen && !searchQuery) {
      setSearchOpen(false);
    } else {
      setSearchOpen(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchOpen(false);
    if (location.pathname === '/search') {
      navigate('/');
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__left">
        <button
          className="hamburger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
          aria-expanded={sidebarOpen}
        >
          <span className={`hamburger__line ${sidebarOpen ? 'open' : ''}`} />
          <span className={`hamburger__line ${sidebarOpen ? 'open' : ''}`} />
          <span className={`hamburger__line ${sidebarOpen ? 'open' : ''}`} />
        </button>

        <Link to="/" className="navbar__logo" aria-label="Watson Movies home">
          WATSON<span>MOVIES</span>
        </Link>
      </div>

      <div className="navbar__right">
        <div className={`search-bar ${searchOpen ? 'search-bar--open' : ''}`}>
          <button
            className="search-bar__icon"
            onClick={handleSearchToggle}
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <input
            ref={inputRef}
            type="text"
            placeholder={language === 'fr-FR' ? 'Rechercher…' : 'Search movies, shows…'}
            value={searchQuery}
            onChange={handleSearch}
            onBlur={() => {
              if (!searchQuery) setSearchOpen(false);
            }}
            className="search-bar__input"
            aria-label="Search movies and shows"
          />

          {searchQuery && (
            <button className="search-bar__clear" onClick={clearSearch} aria-label="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="lang-switcher">
          <button className={`lang-btn ${language === 'en-US' ? 'active' : ''}`} onClick={() => setLanguage('en-US')}>EN</button>
          <span className="lang-divider" />
          <button className={`lang-btn ${language === 'fr-FR' ? 'active' : ''}`} onClick={() => setLanguage('fr-FR')}>FR</button>
        </div>

        <Link to="/dashboard" className="nav-avatar" aria-label="Dashboard"><span>WM</span></Link>
      </div>
    </nav>
  );
}