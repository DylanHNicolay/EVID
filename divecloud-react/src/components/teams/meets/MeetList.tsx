import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MeetList.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface Meet {
  id: number;
  name: string;
  status: string;
  meet_date: string;
  date_end: string | null;
  location: string;
  logo_url: string | null;
  meet_type: string | null;
  season: string | null;
}

interface MeetListProps {
  teamId: number;
  nameFilter: string;
  typeFilter: string;
  seasonFilter: string;
}

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

const MeetList = ({
  teamId,
  nameFilter,
  typeFilter,
  seasonFilter,
}: MeetListProps): React.ReactElement => {
  const navigate = useNavigate();
  const [meets, setMeets] = useState<Meet[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (seasonFilter) params.set('season', seasonFilter);
    fetch(`${API_URL}/api/teams/${teamId}/meets?${params.toString()}`)
      .then((r) => r.json())
      .then(setMeets)
      .catch(console.error);
  }, [teamId, seasonFilter]);

  const filtered = meets.filter((meet) => {
    const matchesName = meet.name
      .toLowerCase()
      .includes(nameFilter.toLowerCase());
    const matchesType = typeFilter === 'All' || meet.meet_type === typeFilter;
    return matchesName && matchesType;
  });

  return (
    <div className="meet-list">
      {filtered.map((meet) => (
        <div
          key={meet.id}
          className="meet-item"
          onClick={() => navigate(`/meet/${meet.id}`)}
        >
          {meet.logo_url ? (
            <img src={meet.logo_url} alt="" className="meet-logo-img" />
          ) : (
            <div className="meet-logo-placeholder" />
          )}
          <div className="meet-info">
            <span className="meet-name">{meet.name}</span>
            <span className="meet-meta">
              <span
                className={`meet-status ${meet.status === 'upcoming' ? 'upcoming' : 'completed'}`}
              >
                {meet.status === 'completed' ? 'Completed' : 'Upcoming'}
              </span>{' '}
              &bull; {formatDate(meet.meet_date)} &bull; {meet.location}
            </span>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <div style={{ padding: 20, color: '#888', textAlign: 'center' }}>
          No meets found
        </div>
      )}
    </div>
  );
};

export default MeetList;
