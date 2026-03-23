import React from 'react';
import './TopEvents.css';

interface TopEventEntry {
  id: number;
  name: string;
  teamColor: string;
  event: string;
  score: number;
}

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
