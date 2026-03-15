import * as React from 'react';
import { useState } from 'react';
import './TeamCard.css';

interface RankingEntry {
  id: number;
  name: string;
  location: string;
  abbr: string;
  accentColor: string;
}

const rankingsData: RankingEntry[] = [
  {
    id: 1,
    name: 'Longhorn Aquatics',
    location: 'Austin, TX',
    abbr: 'US',
    accentColor: '#c0392b',
  },
  {
    id: 2,
    name: 'USA Diving',
    location: 'Colorado Springs, CO',
    abbr: 'USA',
    accentColor: '#1a3a6b',
  },
  {
    id: 3,
    name: 'University of Texas',
    location: 'Austin, TX',
    abbr: 'STX',
    accentColor: '#0e6e45',
  },
];

// function ordinal(n: number): string {
//   const s = ["th", "st", "nd", "rd"];
//   const v = n % 100;
//   return n + (s[(v - 20) % 10] || s[v] || s[0]);
// }

interface RankingCardProps {
  season?: string;
  title?: string;
  entries?: RankingEntry[];
  onSeeAll?: () => void;
}

const TeamCard: React.FC<RankingCardProps> = ({
  season = '2025-2026',
  title = 'Team',
  entries = rankingsData,
}) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="rc-card">
      {/* Header */}
      <div className="rc-header">
        <span className="rc-title">{title}</span>
      </div>

      {/* Horizontal rule */}
      <div className="rc-divider" />

      {/* Season label */}
      <div className="rc-season">SEASON {season}</div>

      {/* Ranking rows */}
      <ul className="rc-list">
        {entries.map((entry, i) => (
          <li
            key={entry.id}
            className={`rc-item${hoveredId === entry.id ? ' rc-item--hovered' : ''}`}
            style={{ animationDelay: `${i * 70}ms` }}
            onMouseEnter={() => setHoveredId(entry.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className="rc-badge"
              style={{ backgroundColor: entry.accentColor }}
            >
              <span className="rc-badge-abbr">{entry.abbr}</span>
            </div>
            <div className="rc-team">
              <span className="rc-name">{entry.name}</span>
              <span className="rc-location">{entry.location}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamCard;
