import React, { useState } from 'react';
import TeamPageCard from '../components/teams/TeamPageCard';
import TeamHomeTab from '../components/teams/tabs/team-home-tab';
import TeamMeetsTab from '../components/teams/tabs/team-meets-tab';
import TeamRosterTab from '../components/teams/tabs/team-roster-tab';

export default function TeamPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <>
      <TeamPageCard
        teamName="University of Virginia"
        division="Division 1"
        conference="ACC"
        bannerUrl="https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=1200"
        logoUrl="https://media.cnn.com/api/v1/images/stellar/prod/200617131110-02-uva-reworked-logo-0616.jpg?q=w_1110,c_fill"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'Home' && <TeamHomeTab />}
      {activeTab === 'Meets' && <TeamMeetsTab />}
      {activeTab === 'Roster' && <TeamRosterTab />}
    </>
  );
}
