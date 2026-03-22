import ProfileCard from '../components/profile/ProfileCard';
import React, { useState } from 'react';
import ProfileHomeTab from '../tabs/profile/profile-home-tab';
import ProfileScoresTab from '../tabs/profile/profile-scores-tab';
import ProfileMeetsTab from '../tabs/profile/profile-meets-tab';

export default function ProfilePage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState('Home');
  return (
    <div>
      <ProfileCard
        firstName="Chris"
        lastName="Guiliano"
        location="Douglassville, PA"
        team="Longhorn Aquatics"
        avatarUrl="https://i.pravatar.cc/150"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'Home' && <ProfileHomeTab />}
      {activeTab === 'Meets' && <ProfileMeetsTab />}
      {activeTab === 'Scores' && <ProfileScoresTab />}
    </div>
  );
}
