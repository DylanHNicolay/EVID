import React from 'react';
import './TeamPageCard.css';
import TeamPageTabs from './TeamPageTabs';

interface TeamPageCardProps {
  teamName: string;
  division: string;
  conference: string;
  logoUrl?: string;
  bannerUrl?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TeamPageCard = ({
  teamName,
  division,
  conference,
  logoUrl,
  bannerUrl,
  activeTab,
  onTabChange,
}: TeamPageCardProps): React.ReactElement => {
  return (
    <div className="team-page-card">
      {/* Banner */}
      <div
        className="team-banner"
        style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : {}}
      />

      {/* Info row */}
      <div className="team-info-row">
        <div className="team-logo-wrapper">
          {logoUrl && (
            <img src={logoUrl} alt={teamName} className="team-logo" />
          )}
        </div>

        <div className="team-info">
          <h2 className="team-name">{teamName}</h2>
          <p className="team-meta">
            {division} · {conference}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <TeamPageTabs activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default TeamPageCard;
