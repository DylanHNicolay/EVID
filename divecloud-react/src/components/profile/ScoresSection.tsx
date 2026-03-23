import React, { useState } from 'react';
import './ScoresSection.css';
import ProfileScoresEventProgressionTab from './tabs/profile-scores-eventProgression-tab';
import ProfileScoresPBs from './tabs/profile-scores-pbs';
import type { Result } from '../../types';

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
  const mockEventProgressionResult: Result = {
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
      },
    ],
  };

  const renderScoresContent = (): React.ReactElement => {
    switch (activeScoresTab) {
      case 'Personal Bests':
        return (
          <div className="scores-content">
            <h3>Personal Bests</h3>
            <ProfileScoresPBs />;
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
          <ProfileScoresEventProgressionTab
            result={mockEventProgressionResult}
          />
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
