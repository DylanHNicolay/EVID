import React from 'react';
import TeamCard from '../components/profile/TeamCard';
import LatestResults from '../components/profile/LatestResults';
import './profile-home-tab.css';

export default function ProfileHomeTab(): React.ReactElement {
  return (
    <div className="teamAndResults">
      <TeamCard />
      <LatestResults />
    </div>
  );
}
