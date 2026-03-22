import React from 'react';
import './TeamPageTabs.css';

interface TeamPageTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = ['Home', 'Meets', 'Roster'];

export default function TeamPageTabs({
  activeTab,
  onTabChange,
}: TeamPageTabsProps): React.ReactElement {
  return (
    <div className="team-page-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`team-page-tab ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
