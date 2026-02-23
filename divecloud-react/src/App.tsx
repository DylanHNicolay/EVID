import Header from './components/header/Header';
import ProfileCard from './components/profile/ProfileCard';

function App(): React.ReactElement {
  return (
    <div className="App">
      <Header />
      <ProfileCard
        firstName="Ian"
        lastName="Sinclair"
        location="Las Vegas, NV"
        team="California Polytechnic State University"
        avatarUrl="https://i.pravatar.cc/150"
      />
    </div>
  );
}

export default App;
