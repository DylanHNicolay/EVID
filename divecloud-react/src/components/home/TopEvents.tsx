import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './TopEvents.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface TopEventEntry {
  entry_id: number;
  athlete_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  team_color: string | null;
  team_name: string | null;
  event_name: string;
  height: string;
  dives_required: number;
  total_score: number;
}

interface MeetSummary {
  id: number;
  name: string;
  meet_date: string;
  date_end: string | null;
  location: string;
  logo_url: string | null;
}

function parseDate(raw: string): Date {
  const iso = raw.includes('T') ? raw.split('T')[0] : raw;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateRange(start: string, end: string | null): string {
  const s = parseDate(start);
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const sMonth = monthNames[s.getMonth()];
  const sDay = s.getDate();
  const sYear = s.getFullYear();

  if (!end || end === start) {
    return `${sMonth} ${sDay}, ${sYear}`;
  }

  const e = parseDate(end);
  const eDay = e.getDate();
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${sMonth} ${sDay}\u2013${eDay}, ${sYear}`;
  }
  const eMonth = monthNames[e.getMonth()];
  return `${sMonth} ${sDay} \u2013 ${eMonth} ${eDay}, ${sYear}`;
}

function formatEventLabel(height: string, divesRequired: number): string {
  return `${height} ${divesRequired} dive`;
}

function dateRangeLabel(): string {
  const now = new Date();
  const yearAgo = new Date(now);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const fmt = (d: Date): string =>
    `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()} ${d.getFullYear()}`;
  return `${fmt(yearAgo)} - ${fmt(now)}`;
}

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
            <tr key={entry.entry_id}>
              <td className="top-events-rank">{i + 1}</td>
              <td className="top-events-name">
                <Link to={`/profile/${entry.athlete_id}`}>
                  {entry.first_name} {entry.last_name}
                </Link>
              </td>
              <td className="top-events-team">
                <span
                  className="top-events-team-swatch"
                  style={{
                    backgroundColor: entry.team_color || '#b0b0b0',
                  }}
                />
              </td>
              <td>{formatEventLabel(entry.height, entry.dives_required)}</td>
              <td className="top-events-score">
                {Number(entry.total_score).toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TopEvents(): React.ReactElement {
  const [meets, setMeets] = useState<MeetSummary[]>([]);
  const [men, setMen] = useState<TopEventEntry[]>([]);
  const [women, setWomen] = useState<TopEventEntry[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/home/recent-meets`)
      .then((r) => r.json())
      .then(setMeets)
      .catch(console.error);

    fetch(`${API_URL}/api/home/top-events`)
      .then((r) => r.json())
      .then((data) => {
        setMen(data.men || []);
        setWomen(data.women || []);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="top-events-card">
      <div className="top-events-country">
        <h2>Recent Events</h2>
      </div>

      <div className="top-events-meets-grid">
        {meets.map((meet) => (
          <Link
            key={meet.id}
            to={`/meet/${meet.id}`}
            className="top-events-meet-item"
          >
            <img
              className="top-events-meet-logo"
              src={meet.logo_url || 'https://flagcdn.com/w40/us.png'}
              alt=""
            />
            <div className="top-events-meet-info">
              <span className="top-events-meet-name">{meet.name}</span>
              <span className="top-events-meet-meta">
                {formatDateRange(meet.meet_date, meet.date_end)} &middot;{' '}
                {meet.location}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="top-events-header">
        <h2>Top Events</h2>
        <span className="top-events-date-range">{dateRangeLabel()}</span>
      </div>
      <div className="top-events-tables">
        <EventTable title="Men" entries={men} />
        <EventTable title="Women" entries={women} />
      </div>
    </div>
  );
}
