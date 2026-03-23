import React, { useState } from 'react';
import './ScoresSection.css';
import ProfileScoresEventProgressionTab from '../tabs/profile-scores-eventProgression-tab';
import type { Result } from '../../../types';

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
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

const ScoresSection: React.FC = (): React.ReactElement => {
  const [activeScoresTab, setActiveScoresTab] = useState('Personal Bests');
  const mockResults: Result[] = [
    {
      id: 1,
      event: '1 Meter 6 Dive',
      score: 156.3,
      meet: 'RPI vs Union',
      date: 'January 3, 2025',
      dives: [
        {
          dive: '101C',
          award: 30,
          dd: 1.1,
          j1: 5.5,
          j2: 6.0,
          j3: 6.5,
          j4: 7.0,
          j5: 7.5,
          pr: true,
        },
        {
          dive: '201C',
          award: 30,
          dd: 1.1,
          j1: 5.5,
          j2: 6.0,
          j3: 6.5,
          j4: 7.0,
          j5: 7.5,
        },
        {
          dive: '301C',
          award: 30,
          dd: 1.1,
          j1: 5.5,
          j2: 6.0,
          j3: 6.5,
          j4: 7.0,
          j5: 7.5,
        },
      ],
    },
    {
      id: 2,
      event: '3 Meter 6 Dive',
      score: 178.5,
      meet: 'Yale Invitational',
      date: 'February 10, 2025',
      dives: [
        {
          dive: '101C',
          award: 33,
          dd: 1.2,
          j1: 6.0,
          j2: 6.5,
          j3: 7.0,
          j4: 7.5,
          j5: 8.0,
          pr: true,
        },
        {
          dive: '201C',
          award: 33,
          dd: 1.2,
          j1: 6.0,
          j2: 6.5,
          j3: 7.0,
          j4: 7.5,
          j5: 8.0,
        },
        {
          dive: '301C',
          award: 33,
          dd: 1.2,
          j1: 6.0,
          j2: 6.5,
          j3: 7.0,
          j4: 7.5,
          j5: 8.0,
        },
      ],
    },
    {
      id: 3,
      event: 'Platform 6 Dive',
      score: 201.0,
      meet: 'NCAA Regionals',
      date: 'March 1, 2025',
      dives: [
        {
          dive: '101C',
          award: 36,
          dd: 1.3,
          j1: 6.5,
          j2: 7.0,
          j3: 7.5,
          j4: 8.0,
          j5: 8.5,
        },
        {
          dive: '201C',
          award: 36,
          dd: 1.3,
          j1: 6.5,
          j2: 7.0,
          j3: 7.5,
          j4: 8.0,
          j5: 8.5,
        },
        {
          dive: '301C',
          award: 36,
          dd: 1.3,
          j1: 6.5,
          j2: 7.0,
          j3: 7.5,
          j4: 8.0,
          j5: 8.5,
        },
      ],
    },
  ];

  const renderScoresContent = (): React.ReactElement => {
    switch (activeScoresTab) {
      case 'Personal Bests':
        return (
          <div className="scores-content">
            <h3>Personal Bests</h3>
            <p>Personal bests content goes here</p>
          </div>
        );
      case 'Event History':
        return (
          <div className="scores-content">
            <h3>Event History</h3>
            <p>Event history content goes here</p>
          </div>
        );
      case 'Event Progression':
        return (
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
              {mockResults.map((result) => (
                <ProfileScoresEventProgressionTab
                  key={result.id}
                  result={result}
                />
              ))}
            </tbody>
          </table>
        );
      default:
        return <div className="scores-content">Personal Bests</div>;
    }
  };

  return (
    <div className="scores-section">
      <div className="scores-card">
        <ScoreTabs
          activeTab={activeScoresTab}
          onTabChange={setActiveScoresTab}
        />
        {renderScoresContent()}
      </div>
    </div>
  );
};

export default ScoresSection;
