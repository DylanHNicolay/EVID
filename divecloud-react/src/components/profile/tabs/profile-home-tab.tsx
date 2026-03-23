import React from 'react';
import TeamCard from '../TeamCard';
import LatestResults from '../LatestResults';
import Progression from '../Progression';
import './profile-home-tab.css';

export default function ProfileHomeTab(): React.ReactElement {
  return (
    <div className="teamAndResults">
      <div className="teamAndProgression">
        <TeamCard />
        <Progression />
      </div>

      <LatestResults />
    </div>
  );
}
