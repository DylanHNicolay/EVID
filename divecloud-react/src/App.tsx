import * as React from 'react';
import Header from './components/header/Header';
import TeamPage from './pages/TeamPage';

function App(): React.ReactElement {
  // const [activeMainTab, setActiveMainTab] = React.useState('Home');

  return (
    <div className="App">
      <Header />
      <TeamPage />
    </div>
  );
}

export default App;
