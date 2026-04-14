import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import Sidebar from './components/sidebar/Sidebar';
import HomePage from './pages/HomePage';
import TeamPage from './pages/TeamPage';
import ProfilePage from './pages/profilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MeetPage from './pages/MeetPage';
import MeetsPage from './pages/MeetsPage';
import './App.css';
import EditProfilePage from './pages/EditProfilePage';

function App(): React.ReactElement {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="App">
      <Header onMenuClick={() => setSidebarOpen((prev) => !prev)} />
      <div className="app-body">
        <Sidebar open={sidebarOpen} />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/meets" element={<MeetsPage />} />
            <Route path="/team/:teamId" element={<TeamPage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/profile/:athleteId" element={<ProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/meet/:meetId" element={<MeetPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
