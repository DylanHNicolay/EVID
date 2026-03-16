import * as React from 'react';
import ProfileCard from './components/profile/ProfileCard';
import TeamCard from './components/profile/TeamCard';
import Header from './components/header/Header';
import LatestResults from './components/profile/LatestResults';
import ProfilePage from './pages/profilePage';

function App(): React.ReactElement {
  return (
    <div className="App">
      <Header />
      <ProfilePage/>
    </div>
  );
}

export default App;
