import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MeetTeamsScore.css';

interface TeamScore {
  teamId?: number;
  name: string;
  score: number;
  logoUrl?: string;
}

interface MeetTeamsScoreProps {
  homeTeam: TeamScore;
  awayTeam: TeamScore;
}

const TeamBlock = ({ team }: { team: TeamScore }): React.ReactElement => {
  const navigate = useNavigate();
  const clickable = team.teamId != null;

  const handleClick = (): void => {
    if (clickable) navigate(`/team/${team.teamId}`);
  };

  return (
    <div
      className={`meet-team${clickable ? ' meet-team--clickable' : ''}`}
      onClick={handleClick}
    >
      <div className="meet-team-logo">
        {team.logoUrl ? (
          <img src={team.logoUrl} alt={team.name} />
        ) : (
          <div className="meet-team-logo-placeholder" />
        )}
      </div>
      <span className="meet-team-name">{team.name}</span>
    </div>
  );
};

const MeetTeamsScore = ({
  homeTeam,
  awayTeam,
}: MeetTeamsScoreProps): React.ReactElement => {
  return (
    <div className="meet-teams-card">
      <h3 className="meet-teams-title">Teams</h3>
      <div className="meet-teams-score-row">
        <TeamBlock team={homeTeam} />

        <div className="meet-score-display">
          <span className="meet-score-value">{homeTeam.score}</span>
          <span className="meet-score-separator">-</span>
          <span className="meet-score-value">{awayTeam.score}</span>
        </div>

        <TeamBlock team={awayTeam} />
      </div>
    </div>
  );
};

export default MeetTeamsScore;
