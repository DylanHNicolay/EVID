/* PersonalBestScores.tsx */
import React, { useState } from 'react';
import './profile-scores-pbs.css';

// Types for the personal bests data
interface DiveScore {
  category: string;
  score: number;
  isPB?: boolean;
}

interface PersonalBestEntry {
  event: string;
  totalScore: number;
  meet: string;
  date: string;
  course: string;
  season: string;
  diveScores: DiveScore[];
}

// Sample data
const samplePersonalBests: PersonalBestEntry[] = [
  {
    event: '1 Meter 6 Dive',
    totalScore: 156.3,
    meet: 'RPI vs Union',
    date: 'January 3, 2025',
    course: 'SCY',
    season: '2024-2025',
    diveScores: [
      { category: '101C', score: 31 },
      { category: '103C', score: 32, isPB: true },
      { category: '203C', score: 15 },
      { category: '301C', score: 30 },
      { category: '403C', score: 28 },
      { category: '5221C', score: 25 },
    ],
  },
  {
    event: '1 Meter 11 Dive',
    totalScore: 156.3,
    meet: 'RPI vs Union',
    date: 'January 3, 2025',
    course: 'SCY',
    season: '2024-2025',
    diveScores: [
      { category: '101C', score: 31 },
      { category: '103C', score: 32, isPB: true },
      { category: '203C', score: 15 },
      { category: '301C', score: 30 },
      { category: '403C', score: 28 },
      { category: '5221C', score: 25 },
    ],
  },
];

const courses = ['All', 'SCY', 'LCM'];
const seasons = ['All', '2024-2025', '2023-2024'];
const sortOptions = ['Event', 'Score', 'Date'];

const PersonalBestScores: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedSeason, setSelectedSeason] = useState('All');
  const [sortBy, setSortBy] = useState('Event');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  // Filtering and sorting logic
  let filtered = samplePersonalBests.filter(
    (pb) =>
      (selectedCourse === 'All' || pb.course === selectedCourse) &&
      (selectedSeason === 'All' || pb.season === selectedSeason)
  );
  if (sortBy === 'Event') {
    filtered = filtered.sort((a, b) => a.event.localeCompare(b.event));
  } else if (sortBy === 'Score') {
    filtered = filtered.sort((a, b) => b.totalScore - a.totalScore);
  } else if (sortBy === 'Date') {
    filtered = filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  const toggleRow = (idx: number): void => {
    setExpandedRows((rows) =>
      rows.includes(idx) ? rows.filter((i) => i !== idx) : [...rows, idx]
    );
  };

  return (
    <div className="pbs-container">
      <div className="pbs-filters">
        <div className="pbs-filter-group">
          <label htmlFor="pbs-course-select">Course</label>
          <select
            id="pbs-course-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
        <div className="pbs-filter-group">
          <label htmlFor="pbs-season-select">Season</label>
          <select
            id="pbs-season-select"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            {seasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </div>
        <div className="pbs-filter-group">
          <label htmlFor="pbs-sortby-select">Sort By</label>
          <select
            id="pbs-sortby-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <table className="pbs-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Score</th>
            <th>Meet</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((pb, idx) => (
            <React.Fragment key={idx}>
              <tr className="pbs-main-row">
                <td>
                  <button
                    className="pbs-expand-btn"
                    onClick={() => toggleRow(idx)}
                  >
                    {expandedRows.includes(idx) ? '▼' : '▶'}
                  </button>
                  <span className="pbs-event-name">{pb.event}</span>
                </td>
                <td className="pbs-score">{pb.totalScore}</td>
                <td className="pbs-meet">{pb.meet}</td>
                <td className="pbs-date">{pb.date}</td>
              </tr>
              {expandedRows.includes(idx) && (
                <tr className="pbs-detail-row">
                  <td colSpan={4}>
                    <div className="pbs-detail-table">
                      <div className="pbs-detail-header">
                        {pb.diveScores.map((d, i) => (
                          <span key={i} className="pbs-detail-category">
                            {d.category}
                          </span>
                        ))}
                      </div>
                      <div className="pbs-detail-scores">
                        {pb.diveScores.map((d, i) => (
                          <span key={i} className="pbs-detail-score">
                            {d.score}{' '}
                            {d.isPB && <span className="pbs-badge">PB</span>}
                          </span>
                        ))}
                      </div>
                      <div className="pbs-detail-footer">
                        <button className="pbs-fullsheet-btn">
                          Show Full Sheet
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PersonalBestScores;
