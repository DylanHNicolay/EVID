import React from 'react';
import './TopEvents.css';

interface TopEventEntry {
  id: number;
  name: string;
  teamColor: string;
  event: string;
  score: number;
}

interface MeetSummary {
  id: number;
  name: string;
  date: string;
  location: string;
  logoUrl: string;
}

const mockMeets: MeetSummary[] = [
  {
    id: 1,
    name: 'YMCA New England Championships',
    date: 'Mar 21\u201322, 2026',
    location: 'Worcester, MA',
    logoUrl: 'https://flagcdn.com/w40/us.png',
  },
  {
    id: 2,
    name: 'Sprint Sprint Series #6 - Championship',
    date: 'Mar 21, 2026',
    location: 'Otsego, MI',
    logoUrl: 'https://flagcdn.com/w40/us.png',
  },
  {
    id: 3,
    name: 'Downriver Recreational Swim League...',
    date: 'Mar 21, 2026',
    location: 'Wyandotte, MI',
    logoUrl: 'https://flagcdn.com/w40/us.png',
  },
  {
    id: 4,
    name: 'LC04-26 - Mayores y Menores 50',
    date: 'Mar 21\u201322, 2026',
    location: 'Morovis, PR',
    logoUrl: 'https://flagcdn.com/w40/us.png',
  },
  {
    id: 5,
    name: 'Maryland 11&O Championships (25y)',
    date: 'Mar 21\u201322, 2026',
    location: 'Baltimore, MD',
    logoUrl: 'https://flagcdn.com/w40/us.png',
  },
  {
    id: 6,
    name: "St. Patrick's Day Invitational",
    date: 'Mar 21, 2026',
    location: 'Cullowhee, NC',
    logoUrl: 'https://flagcdn.com/w40/us.png',
  },
];

const mockMen: TopEventEntry[] = [
  {
    id: 1,
    name: 'Dylan Nicolay',
    teamColor: '#b0b0b0',
    event: '1 meter 6 dive',
    score: 156.3,
  },
  {
    id: 2,
    name: 'Dylan Nicolay',
    teamColor: '#b0b0b0',
    event: '1 meter 6 dive',
    score: 156.3,
  },
  {
    id: 3,
    name: 'Dylan Nicolay',
    teamColor: '#b0b0b0',
    event: '1 meter 6 dive',
    score: 156.3,
  },
  {
    id: 4,
    name: 'Dylan Nicolay',
    teamColor: '#b0b0b0',
    event: '1 meter 6 dive',
    score: 156.3,
  },
  {
    id: 5,
    name: 'Dylan Nicolay',
    teamColor: '#b0b0b0',
    event: '1 meter 6 dive',
    score: 156.3,
  },
];

const mockWomen: TopEventEntry[] = [
  {
    id: 1,
    name: 'Dylan Nicolay',
    teamColor: '#b0b0b0',
    event: '1 meter 6 dive',
    score: 156.3,
  },
  {
    id: 2,
    name: 'Dylan Nicolay',
    teamColor: '#b0b0b0',
    event: '1 meter 6 dive',
    score: 156.3,
  },
  {
    id: 3,
    name: 'Dylan Nicolay',
    teamColor: '#b0b0b0',
    event: '1 meter 6 dive',
    score: 156.3,
  },
  {
    id: 4,
    name: 'Dylan Nicolay',
    teamColor: '#b0b0b0',
    event: '1 meter 6 dive',
    score: 156.3,
  },
  {
    id: 5,
    name: 'Dylan Nicolay',
    teamColor: '#b0b0b0',
    event: '1 meter 6 dive',
    score: 156.3,
  },
];

interface EventTableProps {
  title: string;
  entries: TopEventEntry[];
}

function EventTable({ title, entries }: EventTableProps): React.ReactElement {
  return (
    <div className="top-events-table-section">
      <h3>{title}</h3>
      <table className="top-events-table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Team</th>
            <th>Event</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={entry.id}>
              <td className="top-events-rank">{i + 1}</td>
              <td className="top-events-name">{entry.name}</td>
              <td className="top-events-team">
                <span
                  className="top-events-team-swatch"
                  style={{ backgroundColor: entry.teamColor }}
                />
              </td>
              <td>{entry.event}</td>
              <td className="top-events-score">{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TopEvents(): React.ReactElement {
  return (
    <div className="top-events-card">
      <div className="top-events-country">
        <img
          className="top-events-flag"
          src="https://flagcdn.com/w80/us.png"
          alt="United States"
        />
        <h2>United States</h2>
      </div>

      <div className="top-events-meets-grid">
        {mockMeets.map((meet) => (
          <div key={meet.id} className="top-events-meet-item">
            <img className="top-events-meet-logo" src={meet.logoUrl} alt="" />
            <div className="top-events-meet-info">
              <span className="top-events-meet-name">{meet.name}</span>
              <span className="top-events-meet-meta">
                {meet.date} &middot; {meet.location}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="top-events-header">
        <h2>Top Events</h2>
        <span className="top-events-date-range">Jan 3 2026 - Jan 17 2026</span>
      </div>
      <div className="top-events-tables">
        <EventTable title="Men" entries={mockMen} />
        <EventTable title="Women" entries={mockWomen} />
      </div>
    </div>
  );
}
