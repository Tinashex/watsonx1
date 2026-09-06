import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
const AppContext = createContext(null);
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside an AppProvider');
  return ctx;
};
export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => { try { return localStorage.getItem('watson_movies_lang') || 'en-US'; } catch { return 'en-US'; }});
  const [favorites, setFavorites] = useState(() => { try { const s = localStorage.getItem('watson_movies_favorites'); if (!s) return []; const p = JSON.parse(s); return Array.isArray(p)? p : []; } catch { return []; }});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => { try { localStorage.setItem('watson_movies_lang', language); } catch {} }, [language]);
  useEffect(() => { try { localStorage.setItem('watson_movies_favorites', JSON.stringify(favorites)); } catch {} }, [favorites]);
  const toggleFavorite = useCallback((item) => {
    if (!item ||!item.id) return;
    const mediaType = item.media_type || (item.first_air_date? 'tv' : 'movie');
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === item.id && f.media_type === mediaType);
      return exists? prev.filter((f) =>!(f.id === item.id && f.media_type === mediaType)) : [...prev, {...item, media_type: mediaType, savedAt: Date.now() }];
    });
  }, []);
  const isFavorite = useCallback((id, mediaType) =>!id? false : favorites.some((f) => f.id === id && f.media_type === mediaType), [favorites]);
  const clearFavorites = useCallback(() => setFavorites([]), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const langCode = language === 'fr-FR'? 'fr-FR' : 'en-US';
  const value = useMemo(() => ({ language, setLanguage, langCode, favorites, toggleFavorite, isFavorite, clearFavorites, sidebarOpen, setSidebarOpen, closeSidebar, searchQuery, setSearchQuery }), [language, langCode, favorites, toggleFavorite, isFavorite, clearFavorites, sidebarOpen, closeSidebar, searchQuery]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};