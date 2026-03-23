import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import Sidebar from './components/sidebar/Sidebar';
import HomePage from './pages/HomePage';
import TeamPage from './pages/TeamPage';
import ProfilePage from './pages/profilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

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
            <Route path="/team" element={<TeamPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
