import React, { useState, useEffect } from 'react';
import './ScoresSection.css';
import DiveChart from './DiveChart';
import type { DiveScore } from '../../../types';
import Progression from '../Progression';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';

interface PersonalBest {
  height: string;
  event_name: string;
  dives_required: number;
  total_score: number;
  meet_name: string;
  meet_date: string;
  course: string | null;
  season: string | null;
  dives: {
    dive_code: string;
    dd: number;
    award: number;
    score: number;
    j1: number;
    j2: number;
    j3: number;
    j4: number;
    j5: number;
    is_personal_best: boolean;
  }[];
}

interface ResultEntry {
  entry_id: number;
  event_name: string;
  height: string;
  total_score: number;
  meet_name: string;
  meet_date: string;
  dives: {
    dive_code: string;
    dd: number;
    award: number;
    j1: number;
    j2: number;
    j3: number;
    j4: number;
    j5: number;
  }[];
}

interface ScoresSectionProps {
  athleteId: number;
}

interface ScoreTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ScoreTabs: React.FC<ScoreTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = ['Personal Bests', 'Event History', 'Event Progression'];
  return (
    <div className="score-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`score-tab ${activeTab === tab ? 'active' : ''}`}
          onClick={(): void => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

function formatDate(raw: string): string {
  const iso = raw.includes('T') ? raw.split('T')[0] : raw;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const ScoresSection: React.FC<ScoresSectionProps> = ({
  athleteId,
}): React.ReactElement => {
  const [activeTab, setActiveTab] = useState('Personal Bests');
  const [pbs, setPbs] = useState<PersonalBest[]>([]);
  const [results, setResults] = useState<ResultEntry[]>([]);
  const [expandedPb, setExpandedPb] = useState<number[]>([]);
  const [expandedResult, setExpandedResult] = useState<number[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/athletes/${athleteId}/personal-bests`)
      .then((r) => r.json())
      .then(setPbs)
      .catch(console.error);

    fetch(`${API_URL}/api/athletes/${athleteId}/results`)
      .then((r) => r.json())
      .then(setResults)
      .catch(console.error);
  }, [athleteId]);

  const togglePb = (idx: number): void => {
    setExpandedPb((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleResult = (idx: number): void => {
    setExpandedResult((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const renderPBs = (): React.ReactElement => (
    <table
      style={{ width: '100%', borderCollapse: 'collapse' }}
      className="scores-table"
    >
      <thead>
        <tr>
          <th></th>
          <th>Event</th>
          <th>Score</th>
          <th>Meet</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {pbs.map((pb, idx) => (
          <React.Fragment key={idx}>
            <tr
              className="result-row"
              onClick={(): void => togglePb(idx)}
              style={{ cursor: 'pointer' }}
            >
              <td>{expandedPb.includes(idx) ? '\u25BC' : '\u25B6'}</td>
              <td>
                {pb.height} {pb.dives_required} dive
              </td>
              <td style={{ fontWeight: 600 }}>
                {Number(pb.total_score).toFixed(1)}
              </td>
              <td>{pb.meet_name}</td>
              <td>{formatDate(pb.meet_date)}</td>
            </tr>
            {expandedPb.includes(idx) && pb.dives.length > 0 && (
              <tr>
                <td colSpan={5}>
                  <DiveChart
                    dives={pb.dives.map(
                      (d): DiveScore => ({
                        dive: d.dive_code || '',
                        award: Number(d.award),
                        dd: Number(d.dd),
                        j1: Number(d.j1),
                        j2: Number(d.j2),
                        j3: Number(d.j3),
                        j4: Number(d.j4),
                        j5: Number(d.j5),
                        pr: d.is_personal_best,
                      })
                    )}
                  />
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
        {pbs.length === 0 && (
          <tr>
            <td
              colSpan={5}
              style={{ textAlign: 'center', padding: 20, color: '#888' }}
            >
              No personal bests
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  const renderProgression = (): React.ReactElement => (
    <table
      style={{ width: '100%', borderCollapse: 'collapse' }}
      className="scores-table"
    >
      <thead>
        <tr>
          <th></th>
          <th>Event</th>
          <th>Score</th>
          <th>Meet</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {results.map((r, idx) => (
          <React.Fragment key={idx}>
            <tr
              className="result-row"
              onClick={(): void => toggleResult(idx)}
              style={{ cursor: 'pointer' }}
            >
              <td>{expandedResult.includes(idx) ? '\u25BC' : '\u25B6'}</td>
              <td>
                {r.height} {r.event_name}
              </td>
              <td style={{ fontWeight: 600 }}>
                {Number(r.total_score).toFixed(1)}
              </td>
              <td>{r.meet_name}</td>
              <td>{formatDate(r.meet_date)}</td>
            </tr>
            {expandedResult.includes(idx) && r.dives.length > 0 && (
              <tr>
                <td colSpan={5}>
                  <DiveChart
                    dives={r.dives.map(
                      (d): DiveScore => ({
                        dive: d.dive_code || '',
                        award: Number(d.award),
                        dd: Number(d.dd),
                        j1: Number(d.j1),
                        j2: Number(d.j2),
                        j3: Number(d.j3),
                        j4: Number(d.j4),
                        j5: Number(d.j5),
                      })
                    )}
                  />
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
        {results.length === 0 && (
          <tr>
            <td
              colSpan={5}
              style={{ textAlign: 'center', padding: 20, color: '#888' }}
            >
              No results
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="scores-section">
      <div className="scores-card">
        <ScoreTabs activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'Personal Bests' && renderPBs()}
        {activeTab === 'Event History' && renderProgression()}
        {activeTab === 'Event Progression' && (
          <Progression athleteId={athleteId} />
        )}
      </div>
    </div>
  );
};

export default ScoresSection;
