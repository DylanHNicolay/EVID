import React, { useState } from 'react';
import './LatestResults.css';

interface ResultRow {
  event: string;
  round: string;
  time: string;
  badge?: 'PB' | 'SB';
  improvement: number;
  place: number;
}

interface Meet {
  name: string;
  date: string;
  logoUrl?: string;
  results: ResultRow[];
}

const sampleMeets: Meet[] = [
  {
    name: 'TYR Pro Swim Series - Westmont',
    date: 'Mar 4–7, 2026',
    results: [
      {
        event: '50 L Free',
        round: 'Finals',
        time: '21.43',
        badge: 'PB',
        improvement: -0.14,
        place: 1,
      },
      {
        event: '50 L Free',
        round: 'Prelims',
        time: '21.86',
        improvement: 0.29,
        place: 2,
      },
      {
        event: '100 L Free',
        round: 'Finals',
        time: '47.84',
        improvement: 0.21,
        place: 1,
      },
      {
        event: '100 L Free',
        round: 'Semifinals',
        time: '47.54',
        badge: 'SB',
        improvement: -0.09,
        place: 1,
      },
      {
        event: '100 L Free',
        round: 'Prelims',
        time: '47.38',
        badge: 'SB',
        improvement: -0.25,
        place: 1,
      },
      {
        event: '200 L Free',
        round: 'Finals',
        time: '1:45.53',
        badge: 'SB',
        improvement: -0.14,
        place: 1,
      },
      {
        event: '200 L Free',
        round: 'Prelims',
        time: '1:45.38',
        badge: 'SB',
        improvement: -0.29,
        place: 1,
      },
    ],
  },
];

const formatImprovement = (value: number): string => {
  if (value < 0) return value.toFixed(2);
  return `+${value.toFixed(2)}`;
};

const formatPlace = (place: number): string => {
  if (place === 1) return '1st';
  if (place === 2) return '2nd';
  if (place === 3) return '3rd';
  return `${place}th`;
};

export default function LatestResults(): React.ReactElement {
  const meets = sampleMeets;
  const [selectedMeetIndex, setSelectedMeetIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedMeet = meets[selectedMeetIndex];

  return (
    <div className="latest-results">
      <div className="latest-results-header">
        <h3 className="latest-results-title">Latest Results</h3>
        <button className="latest-results-see-all">See all</button>
      </div>

      {/* Meet selector */}
      <div className="meet-selector-wrapper">
        <button
          className="meet-selector"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {selectedMeet.logoUrl && (
            <img
              src={selectedMeet.logoUrl}
              alt={selectedMeet.name}
              className="meet-logo"
            />
          )}
          <div className="meet-selector-text">
            <span className="meet-name">{selectedMeet.name}</span>
            <span className="meet-date">{selectedMeet.date}</span>
          </div>
          <span className={`meet-chevron ${dropdownOpen ? 'open' : ''}`}>
            ▾
          </span>
        </button>

        {dropdownOpen && meets.length > 1 && (
          <div className="meet-dropdown">
            {meets.map((meet, idx) => (
              <button
                key={idx}
                className={`meet-dropdown-item ${idx === selectedMeetIndex ? 'active' : ''}`}
                onClick={() => {
                  setSelectedMeetIndex(idx);
                  setDropdownOpen(false);
                }}
              >
                <span className="meet-name">{meet.name}</span>
                <span className="meet-date">{meet.date}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results table */}
      <table className="results-table">
        <thead>
          <tr>
            <th className="col-event">Event</th>
            <th className="col-time">Time</th>
            <th className="col-imp">Imp</th>
            <th className="col-place">Place</th>
          </tr>
        </thead>
        <tbody>
          {selectedMeet.results.map((row, idx) => (
            <tr key={idx} className="results-row">
              <td className="col-event">
                <span className="event-name">{row.event}</span>{' '}
                <span className="event-round">{row.round}</span>
              </td>
              <td className="col-time">
                <span className="time-value">{row.time}</span>
                {row.badge && (
                  <span className={`badge badge-${row.badge.toLowerCase()}`}>
                    {row.badge}
                  </span>
                )}
              </td>
              <td
                className={`col-imp ${row.improvement <= 0 ? 'imp-negative' : 'imp-positive'}`}
              >
                {formatImprovement(row.improvement)}
              </td>
              <td className="col-place">{formatPlace(row.place)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
