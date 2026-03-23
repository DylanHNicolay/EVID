import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeamCard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface TeamEntry {
  id: number;
  name: string;
  location: string | null;
  abbreviation: string | null;
  accent_color: string | null;
}

interface TeamCardProps {
  athleteId: number;
}

const TeamCard: React.FC<TeamCardProps> = ({
  athleteId,
}): React.ReactElement => {
  const [entries, setEntries] = useState<TeamEntry[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/athletes/${athleteId}/teams`)
      .then((r) => r.json())
      .then(setEntries)
      .catch(console.error);
  }, [athleteId]);

  return (
    <div className="rc-card">
      <div className="rc-header">
        <span className="rc-title">Team</span>
      </div>
      <div className="rc-divider" />
      <ul className="rc-list">
        {entries.map((entry, i) => (
          <li
            key={entry.id}
            className={`rc-item${hoveredId === entry.id ? ' rc-item--hovered' : ''}`}
            style={{ animationDelay: `${i * 70}ms`, cursor: 'pointer' }}
            onMouseEnter={(): void => setHoveredId(entry.id)}
            onMouseLeave={(): void => setHoveredId(null)}
            onClick={() => navigate(`/team/${entry.id}`)}
          >
            <div
              className="rc-badge"
              style={{ backgroundColor: entry.accent_color || '#888' }}
            >
              <span className="rc-badge-abbr">
                {entry.abbreviation || entry.name.slice(0, 3).toUpperCase()}
              </span>
            </div>
            <div className="rc-team">
              <span className="rc-name">{entry.name}</span>
              <span className="rc-location">{entry.location || ''}</span>
            </div>
          </li>
        ))}
        {entries.length === 0 && (
          <li className="rc-item">
            <span className="rc-location">No team assigned</span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default TeamCard;
