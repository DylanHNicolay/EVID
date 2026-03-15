import React, { useState } from 'react';
import './Header.css';

interface HeaderProps {
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

const Header = ({
  onMenuClick,
  onSearch,
  onLoginClick,
  onRegisterClick,
}: HeaderProps): React.ReactElement => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

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
        <a href="/" className="header-logo" aria-label="swimcloud home">
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
                stroke="#1a7c8f"
                strokeWidth="1.5"
                fill="none"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      </div>

      <form className="header-search" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          className="header-search-input"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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

      <nav className="header-right">
        <button
          className="header-auth-btn"
          onClick={onLoginClick}
          type="button"
        >
          LOGIN
        </button>
        <button
          className="header-auth-btn"
          onClick={onRegisterClick}
          type="button"
        >
          REGISTER
        </button>
      </nav>
    </header>
  );
};

export default Header;
