import * as React from 'react';
import Header from './components/header/Header';
import ProfilePage from './pages/profilePage';

function App(): React.ReactElement {
  // const [activeMainTab, setActiveMainTab] = React.useState('Home');

  return (
    <div className="App">
      <Header />
      <ProfilePage />
    </div>
  );
}

export default App;
