import * as React from 'react';
import Header from './components/header/Header';
import ProfilePage from './pages/profilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

type PageKey = 'profile' | 'login' | 'register';

function App(): React.ReactElement {
  const [activePage, setActivePage] = React.useState<PageKey>('profile');

  return (
    <div className="App">
      <Header
        onLoginClick={() => setActivePage('login')}
        onRegisterClick={() => setActivePage('register')}
      />

      {activePage === 'profile' && <ProfilePage />}
      {activePage === 'login' && (
        <LoginPage onRegister={() => setActivePage('register')} />
      )}
      {activePage === 'register' && (
        <RegisterPage onLogin={() => setActivePage('login')} />
      )}
    </div>
  );
}

export default App;
