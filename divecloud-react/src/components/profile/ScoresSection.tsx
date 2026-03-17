import React, { useState } from 'react';
import './ScoresSection.css';
import ProfileScoresEventProgressionTab from '../../tabs/profile-scores-eventProgression-tab';

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
        return <ProfileScoresEventProgressionTab />;
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
