import React from 'react';
import './ProfileTabs.css';

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = ['Home', 'Meets', 'Times', 'Rankings'];

export default function ProfileTabs({
  activeTab,
  onTabChange,
}: ProfileTabsProps): React.ReactElement {
  return (
    <div className="profile-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`profile-tab ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
