import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface HeaderProps {
  onMenuClick?: () => void;
}

interface SearchResults {
  athletes: {
    id: number;
    first_name: string;
    last_name: string;
    hometown: string | null;
  }[];
  teams: { id: number; name: string; location: string | null }[];
  meets: {
    id: number;
    name: string;
    meet_date: string;
    location: string | null;
  }[];
}

const Header = ({ onMenuClick }: HeaderProps): React.ReactElement => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`${API_URL}/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
        .then((r) => r.json())
        .then((data: SearchResults) => {
          setResults(data);
          setShowResults(true);
        })
        .catch(console.error);
    }, 300);
    return (): void => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return (): void => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNav = (path: string): void => {
    setShowResults(false);
    setSearchQuery('');
    navigate(path);
  };

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  const hasResults =
    results &&
    (results.athletes.length > 0 ||
      results.teams.length > 0 ||
      results.meets.length > 0);

  return (
    <header className="header">
      <div className="header-left">
        <button
          className="header-menu-btn"
          onClick={onMenuClick}
          aria-label="Open menu"
          type="button"
        >
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
            <path
              d="M1 1h20M1 8h20M1 15h20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <a href="/" className="header-logo" aria-label="divecloud home">
          <span className="header-logo-swim">dive</span>
          <span className="header-logo-cloud">
            cloud
            <svg
              className="header-logo-cloud-icon"
              width="28"
              height="16"
              viewBox="0 0 28 16"
              fill="none"
            >
              <path
                d="M6 14c-2.8 0-5-2-5-4.5S3.2 5 6 5c.3 0 .6 0 .9.1C8.1 2.6 10.8 1 14 1c4 0 7.3 2.9 7.9 6.6.3 0 .7-.1 1.1-.1 2.5 0 4.5 1.8 4.5 4s-2 4-4.5 4H6z"
                stroke="#c0392b"
                strokeWidth="1.5"
                fill="none"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      </div>

      <div className="header-search-wrapper" ref={dropdownRef}>
        <form
          className="header-search"
          onSubmit={(e): void => e.preventDefault()}
        >
          <input
            type="text"
            className="header-search-input"
            placeholder="Search athletes, teams, meets..."
            value={searchQuery}
            onChange={(e): void => setSearchQuery(e.target.value)}
            onFocus={(): void => {
              if (results) setShowResults(true);
            }}
            aria-label="Search"
          />
          <button
            className="header-search-btn"
            type="submit"
            aria-label="Submit search"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="7.5" cy="7.5" r="6" stroke="#999" strokeWidth="2" />
              <path
                d="M12 12l4.5 4.5"
                stroke="#999"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </form>

        {showResults && hasResults && (
          <div className="search-dropdown">
            {results!.athletes.length > 0 && (
              <div className="search-group">
                <div className="search-group-label">Athletes</div>
                {results!.athletes.map((a) => (
                  <button
                    key={a.id}
                    className="search-item"
                    onClick={(): void => handleNav(`/profile/${a.id}`)}
                  >
                    {a.first_name} {a.last_name}
                    {a.hometown && (
                      <span className="search-item-meta">{a.hometown}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {results!.teams.length > 0 && (
              <div className="search-group">
                <div className="search-group-label">Teams</div>
                {results!.teams.map((t) => (
                  <button
                    key={t.id}
                    className="search-item"
                    onClick={(): void => handleNav(`/team/${t.id}`)}
                  >
                    {t.name}
                    {t.location && (
                      <span className="search-item-meta">{t.location}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {results!.meets.length > 0 && (
              <div className="search-group">
                <div className="search-group-label">Meets</div>
                {results!.meets.map((m) => (
                  <button
                    key={m.id}
                    className="search-item"
                    onClick={(): void => handleNav(`/meet/${m.id}`)}
                  >
                    {m.name}
                    {m.location && (
                      <span className="search-item-meta">{m.location}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="header-right">
        {isAuthenticated ? (
          <button
            className="header-auth-btn"
            onClick={handleLogout}
            type="button"
          >
            LOGOUT
          </button>
        ) : (
          <>
            <button
              className="header-auth-btn"
              onClick={() => navigate('/login')}
              type="button"
            >
              LOGIN
            </button>
            <button
              className="header-auth-btn"
              onClick={() => navigate('/register')}
              type="button"
            >
              REGISTER
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
