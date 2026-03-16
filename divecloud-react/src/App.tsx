import * as React from 'react';
import Header from './components/header/Header';
import ProfilePage from './pages/profilePage';

function App(): React.ReactElement {
  return (
    <div className="App">
      <Header />
      <ProfilePage />
    </div>
  );
}

export default App;
