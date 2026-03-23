import React, { useEffect, useState } from 'react';
import './LatestResults.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface DiveDetail {
  dive_number: number;
  dive_code: string;
  dd: number;
  j1: number;
  j2: number;
  j3: number;
  j4: number;
  j5: number;
  award: number;
  score: number;
  is_personal_best: boolean;
}

interface ResultEntry {
  entry_id: number;
  event_name: string;
  height: string;
  dives_required: number;
  total_score: number;
  final_rank: number | null;
  points: number | null;
  meet_name: string;
  meet_date: string;
  dives: DiveDetail[];
}

interface LatestResultsProps {
  athleteId: number;
}

function formatPlace(rank: number | null): string {
  if (!rank) return '—';
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
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

export default function LatestResults({
  athleteId,
}: LatestResultsProps): React.ReactElement {
  const [results, setResults] = useState<ResultEntry[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/athletes/${athleteId}/results`)
      .then((r) => r.json())
      .then(setResults)
      .catch(console.error);
  }, [athleteId]);

  if (results.length === 0) {
    return (
      <div className="latest-results">
        <h3 className="latest-results-title">Latest Results</h3>
        <p style={{ color: '#888', fontSize: 14, padding: '0 8px' }}>
          No results yet
        </p>
      </div>
    );
  }

  const meetName = results[0]?.meet_name || '';
  const meetDate = results[0]?.meet_date
    ? formatDate(results[0].meet_date)
    : '';

  return (
    <div className="latest-results">
      <div className="latest-results-header">
        <h3 className="latest-results-title">Latest Results</h3>
      </div>

      <div className="meet-selector-wrapper">
        <div className="meet-selector">
          <div className="meet-selector-text">
            <span className="meet-name">{meetName}</span>
            <span className="meet-date">{meetDate}</span>
          </div>
        </div>
      </div>

      <table className="results-table">
        <thead>
          <tr>
            <th className="col-event">Event</th>
            <th className="col-time">Score</th>
            <th className="col-place">Place</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row) => (
            <tr key={row.entry_id} className="results-row">
              <td className="col-event">
                <span className="event-name">{row.height}</span>{' '}
                <span className="event-round">{row.dives_required} dive</span>
              </td>
              <td className="col-time">
                <span className="time-value">
                  {Number(row.total_score).toFixed(1)}
                </span>
              </td>
              <td className="col-place">{formatPlace(row.final_rank)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
