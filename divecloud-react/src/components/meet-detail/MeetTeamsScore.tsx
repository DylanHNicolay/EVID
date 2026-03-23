import React from 'react';
import './MeetTeamsScore.css';

interface TeamScore {
  name: string;
  score: number;
  logoUrl?: string;
}

interface MeetTeamsScoreProps {
  homeTeam: TeamScore;
  awayTeam: TeamScore;
}

const MeetTeamsScore = ({
  homeTeam,
  awayTeam,
}: MeetTeamsScoreProps): React.ReactElement => {
  return (
    <div className="meet-teams-card">
      <h3 className="meet-teams-title">Teams</h3>
      <div className="meet-teams-score-row">
        <div className="meet-team">
          <div className="meet-team-logo">
            {homeTeam.logoUrl ? (
              <img src={homeTeam.logoUrl} alt={homeTeam.name} />
            ) : (
              <div className="meet-team-logo-placeholder" />
            )}
          </div>
          <span className="meet-team-name">{homeTeam.name}</span>
        </div>

        <div className="meet-score-display">
          <span className="meet-score-value">{homeTeam.score}</span>
          <span className="meet-score-separator">-</span>
          <span className="meet-score-value">{awayTeam.score}</span>
        </div>

        <div className="meet-team">
          <div className="meet-team-logo">
            {awayTeam.logoUrl ? (
              <img src={awayTeam.logoUrl} alt={awayTeam.name} />
            ) : (
              <div className="meet-team-logo-placeholder" />
            )}
          </div>
          <span className="meet-team-name">{awayTeam.name}</span>
        </div>
      </div>
    </div>
  );
};

export default MeetTeamsScore;
