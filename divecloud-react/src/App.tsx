import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import HomePage from './pages/HomePage';
import TeamPage from './pages/TeamPage';
import ProfilePage from './pages/profilePage';

function App(): React.ReactElement {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;
