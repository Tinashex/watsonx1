import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Sidebar.css';

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 18, name: 'Drama' },
  { id: 35, name: 'Comedy' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
];

const NavIcon = ({ path, filled }) => {
  const icons = {
    home: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
    movie: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
      </>
    ),
    tv: (
      <>
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
        <polyline points="17 2 12 7 7 2" />
      </>
    ),
    dashboard: (
      <>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    heart: (
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
  };

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[path]}
    </svg>
  );
};

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, favorites } = useApp();
  const navigate = useNavigate();

  const handleNavClick = () => {
    if (window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
  };

  const goToGenre = (genre) => {
    navigate(`/genre/${genre.id}/${genre.name.toLowerCase()}`);
    handleNavClick();
  };

  return (
    <>
      <aside className={`sidebar ${sidebarOpen? 'sidebar--open' : ''}`}>
        <div className="sidebar__logo">
          WATSON<span>MOVIES</span>
        </div>

        <nav className="sidebar__nav">
          <p className="sidebar__label">MENU</p>

          <NavLink to="/" end className={({ isActive }) => `sidebar__link ${isActive? 'active' : ''}`} onClick={handleNavClick}>
            <NavIcon path="home" />
            <span>Home</span>
          </NavLink>

          <NavLink to="/movies" className={({ isActive }) => `sidebar__link ${isActive? 'active' : ''}`} onClick={handleNavClick}>
            <NavIcon path="movie" />
            <span>Movies</span>
          </NavLink>

          <NavLink to="/series" className={({ isActive }) => `sidebar__link ${isActive? 'active' : ''}`} onClick={handleNavClick}>
            <NavIcon path="tv" />
            <span>Series</span>
          </NavLink>

          <NavLink to="/search" className={({ isActive }) => `sidebar__link ${isActive? 'active' : ''}`} onClick={handleNavClick}>
            <NavIcon path="search" />
            <span>Search</span>
          </NavLink>

          <NavLink to="/dashboard" className={({ isActive }) => `sidebar__link ${isActive? 'active' : ''}`} onClick={handleNavClick}>
            <NavIcon path="dashboard" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/dashboard" className={({ isActive }) => `sidebar__link ${isActive? 'active' : ''}`} onClick={handleNavClick}>
            <NavIcon path="heart" filled={favorites.length > 0} />
            <span>Favorites</span>
            {favorites.length > 0 && <span className="sidebar__badge">{favorites.length}</span>}
          </NavLink>
        </nav>

        <nav className="sidebar__nav">
          <p className="sidebar__label">GENRES</p>
          {GENRES.map((genre) => (
            <button key={genre.id} className="sidebar__link sidebar__genre" onClick={() => goToGenre(genre)}>
              <span className="genre-dot" />
              <span>{genre.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          <p>© 2026 Watson Movies</p>
          <p>MADE WITH ❤️ BY WATSON FOURPENCE</p>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
    </>
  );
}