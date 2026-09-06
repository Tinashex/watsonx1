# CINEMAX 🎬

A full-featured Netflix-style streaming discovery app built with React and the TMDb API.

## Features

- 🎞 Hero slider with trending content
- 🔍 Real-time search
- 🎭 Genre browsing (Action, Drama, Comedy, Horror, Romance, Sci-Fi)
- 🎬 Movie & TV series pages with infinite scroll
- 📄 Detail pages with cast, trailers, ratings, similar content
- ❤️ Favorites system (localStorage)
- 🌐 Language switcher (EN / FR)
- 🎤 Subtitle language selector UI
- 💀 Skeleton loading states
- 📱 Fully responsive

## Setup

### 1. Get a TMDb API Key

Sign up at [themoviedb.org](https://www.themoviedb.org/signup) and generate an API key at **Settings → API**.

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```
REACT_APP_TMDB_API_KEY=your_actual_api_key
REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3
REACT_APP_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
```

### 3. Install & Run

```bash
npm install
npm start
```

App runs at `http://localhost:3000`.

## Deployment

### Vercel

```bash
npm i -g vercel
vercel
```

Set `REACT_APP_TMDB_API_KEY` in Vercel dashboard → Project Settings → Environment Variables.

### Render / Railway / Heroku

```bash
npm run build
```

Serve the `build/` folder as a static site. Set the env var `REACT_APP_TMDB_API_KEY` in your platform's dashboard.

For SPA routing, configure your platform to redirect all routes to `index.html`. The included `vercel.json` handles this for Vercel.

## Project Structure

```
src/
├── components/       # Navbar, Sidebar, MediaCard, HeroSlider, MediaRow
├── context/          # AppContext (language, favorites, search state)
├── hooks/            # useFetch, useInfiniteScroll
├── pages/            # Home, Movies, Series, GenrePage, DetailPage, SearchPage, Dashboard
├── styles/           # globals.css
└── utils/            # api.js (all TMDb API calls)
```

## Tech Stack

- React 18
- React Router v6
- Axios
- TMDb API v3
- CSS custom properties (no CSS framework)
- Google Fonts (Bebas Neue + DM Sans + DM Serif Display)
