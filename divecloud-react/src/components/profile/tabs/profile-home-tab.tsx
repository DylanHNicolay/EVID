import React from 'react';
import TeamCard from '../TeamCard';
import LatestResults from '../LatestResults';
import Progression from '../Progression';
import './profile-home-tab.css';

interface ProfileHomeTabProps {
  athleteId: number;
}

export default function ProfileHomeTab({
  athleteId,
}: ProfileHomeTabProps): React.ReactElement {
  return (
    <div className="teamAndResults">
      <div className="teamAndProgression">
        <TeamCard athleteId={athleteId} />
        <Progression athleteId={athleteId} />
      </div>

      <LatestResults athleteId={athleteId} />
    </div>
  );
}
