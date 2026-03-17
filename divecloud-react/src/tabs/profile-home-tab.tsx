import React from 'react';
import TeamCard from '../components/profile/TeamCard';
import LatestResults from '../components/profile/LatestResults';
import Progression from '../components/profile/Progression';
import './profile-home-tab.css';

export default function ProfileHomeTab(): React.ReactElement {
  return (
    <div className="teamAndResults">
        <div className="teamAndProgression">
            <TeamCard />
            <Progression/>
        </div>
      
      <LatestResults />
    </div>
  );
}
