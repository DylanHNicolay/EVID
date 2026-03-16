import * as React from 'react';
import ProfileCard from './components/profile/ProfileCard';
import TeamCard from './components/profile/TeamCard';
import Header from './components/header/Header';
import LatestResults from './components/profile/LatestResults';
import ScoresSection from './components/profile/ScoresSection';

function App(): React.ReactElement {
  const [activeMainTab, setActiveMainTab] = React.useState('Home');

  return (
    <div className="App">
      <Header />
      <ProfileCard
        firstName="Chris"
        lastName="Guiliano"
        location="Douglassville, PA"
        team="Longhorn Aquatics"
        avatarUrl="https://i.pravatar.cc/150"
        activeTab={activeMainTab}
        onTabChange={setActiveMainTab}
      />

      {/* Home tab: Show TeamCard and LatestResults */}
      {activeMainTab === 'Home' && (
        <>
          <TeamCard />
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
            <LatestResults />
          </div>
        </>
      )}

      {/* Meets tab: Show placeholder */}
      {activeMainTab === 'Meets' && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.12)',
            }}
          >
            <h3>Meets content goes here</h3>
          </div>
        </div>
      )}

      {/* Scores tab: Show ScoresSection */}
      {activeMainTab === 'Scores' && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
          <ScoresSection />
        </div>
      )}
    </div>
  );
}

export default App;
