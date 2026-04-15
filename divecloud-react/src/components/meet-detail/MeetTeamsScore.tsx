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
  teams: TeamScore[];
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

function formatTeamScore(score: number): string {
  if (Number.isInteger(score)) return String(score);
  return score.toFixed(2);
}

const MeetTeamsScore = ({ teams }: MeetTeamsScoreProps): React.ReactElement => {
  return (
    <div className="meet-teams-card">
      <h3 className="meet-teams-title">Teams</h3>
      {teams.length === 0 ? (
        <p className="meet-teams-empty">No team scores available.</p>
      ) : (
        <ul className="meet-teams-list">
          {teams.map((team, index) => (
            <li
              key={`${team.teamId ?? team.name}-${index}`}
              className="meet-teams-row"
            >
              <span className="meet-team-rank">#{index + 1}</span>
              <TeamBlock team={team} />
              <span className="meet-team-points">
                {formatTeamScore(team.score)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MeetTeamsScore;
