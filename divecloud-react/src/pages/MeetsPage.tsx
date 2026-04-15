import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MeetsPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface Meet {
  id: number;
  name: string;
  meet_date: string;
  date_end: string | null;
  location: string;
  status: string;
  logo_url: string | null;
  meet_type: string | null;
}

type SortMode = 'latest' | 'top';
type DateMode = 'past' | 'upcoming';

function formatDate(raw: string): string {
  const iso = raw.includes('T') ? raw.split('T')[0] : raw;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function MeetsPage(): React.ReactElement {
  const navigate = useNavigate();

  const [meets, setMeets] = useState<Meet[]>([]);
  const [nameFilter, setNameFilter] = useState('');
  const [sort, setSort] = useState<SortMode>('latest');
  const [dateMode, setDateMode] = useState<DateMode>('past');

  useEffect(() => {
    const params = new URLSearchParams();
    if (nameFilter) params.set('name', nameFilter);
    params.set('sort', sort);
    params.set('date', dateMode);

    const controller = new AbortController();
    fetch(`${API_URL}/api/meets?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then(setMeets)
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      });
    return (): void => {
      controller.abort();
    };
  }, [nameFilter, sort, dateMode]);

  return (
    <div className="meets-page">
      <div className="meets-page-inner">
        <div className="meets-main">
          <h1 className="meets-title">Meets</h1>
          <div className="meets-list">
            {meets.map((meet) => (
              <div
                key={meet.id}
                className="meets-item"
                onClick={() => navigate(`/meet/${meet.id}`)}
              >
                {meet.logo_url ? (
                  <img src={meet.logo_url} alt="" className="meets-item-logo" />
                ) : (
                  <div className="meets-item-logo-placeholder" />
                )}
                <div className="meets-item-info">
                  <span className="meets-item-name">{meet.name}</span>
                  <span className="meets-item-meta">
                    <span
                      className={`meets-item-status ${meet.status === 'completed' ? 'completed' : 'upcoming'}`}
                    >
                      {meet.status === 'completed' ? 'Completed' : 'Upcoming'}
                    </span>
                    {' \u2022 '}
                    {formatDate(meet.meet_date)}
                    {meet.location && ` \u2022 ${meet.location}`}
                  </span>
                </div>
              </div>
            ))}
            {meets.length === 0 && (
              <div className="meets-empty">No meets found</div>
            )}
          </div>
        </div>

        <aside className="meets-filters">
          <label className="meets-filter-label">Name</label>
          <input
            type="text"
            className="meets-filter-input"
            placeholder="Search..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />

          <label className="meets-filter-label">Sort</label>
          <div className="meets-toggle-group">
            <button
              className={`meets-toggle-btn ${sort === 'latest' ? 'active' : ''}`}
              onClick={() => setSort('latest')}
            >
              Latest
            </button>
            <button
              className={`meets-toggle-btn ${sort === 'top' ? 'active' : ''}`}
              onClick={() => setSort('top')}
            >
              Top
            </button>
          </div>

          <label className="meets-filter-label">Date</label>
          <div className="meets-toggle-group">
            <button
              className={`meets-toggle-btn ${dateMode === 'past' ? 'active' : ''}`}
              onClick={() => setDateMode('past')}
            >
              Past
            </button>
            <button
              className={`meets-toggle-btn ${dateMode === 'upcoming' ? 'active' : ''}`}
              onClick={() => setDateMode('upcoming')}
            >
              Upcoming
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
