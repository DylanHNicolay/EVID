import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MeetCard from '../MeetCard';
import './profile-meets-tab.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface Meet {
  meet_id: number;
  meet_name: string;
  meet_date: string;
  location: string;
  logo_url: string | null;
  event: string;
  dives: number;
  score: number;
  rank: number | null;
}

interface ProfileMeetsTabProps {
  athleteId: number;
}

function formatPlace(rank: number | null): string {
  if (!rank) return '—';
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
}

export default function ProfileMeetsTab({
  athleteId,
}: ProfileMeetsTabProps): React.ReactElement {
  const navigate = useNavigate();
  const [nameFilter, setNameFilter] = useState('');
  const [sortBy, setSortBy] = useState('None');
  const [meets, setMeets] = useState<Meet[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/athletes/${athleteId}/meets`)
      .then((r) => r.json())
      .then(setMeets)
      .catch(console.error);
  }, [athleteId]);

  const handleMeetClick = (meetId: string): void => {
    navigate(`/meet/${meetId}`);
  };

  const filtered = meets
    .filter(
      (m) =>
        !nameFilter ||
        m.meet_name.toLowerCase().includes(nameFilter.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'Name') return a.meet_name.localeCompare(b.meet_name);
      return 0;
    });

  return (
    <div className="meets-tab-layout">
      <div className="meets-results-card">
        <div className="meets-grid">
          {filtered.map((m, i) => (
            <MeetCard
              key={`${m.meet_id}-${m.event}-${i}`}
              id={String(m.meet_id)}
              name={m.meet_name}
              event={m.event}
              dives={m.dives}
              score={Number(m.score)}
              place={formatPlace(m.rank)}
              avatarUrl={m.logo_url || undefined}
              onClick={handleMeetClick}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="no-meets-message">No meets found</div>
        )}
      </div>

      <aside className="meets-filter-card">
        <div className="filter-group">
          <label htmlFor="name-filter">Name</label>
          <input
            id="name-filter"
            type="text"
            placeholder="Search Name"
            value={nameFilter}
            onChange={(e): void => setNameFilter(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="sort-filter">Sort By</label>
          <select
            id="sort-filter"
            value={sortBy}
            onChange={(e): void => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option>None</option>
            <option>Name</option>
          </select>
        </div>
      </aside>
    </div>
  );
}
