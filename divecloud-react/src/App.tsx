import Header from './components/header/Header';
import ProfileCard from './components/profile/ProfileCard';
import LatestResults from './components/profile/LatestResults';

function App(): React.ReactElement {
  return (
    <div className="App">
      <Header />
      <ProfileCard
        firstName="Chris"
        lastName="Guiliano"
        location="Douglassville, PA"
        team="Longhorn Aquatics"
        avatarUrl="https://i.pravatar.cc/150"
      />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
        <LatestResults />
      </div>
    </div>
  );
}

export default App;
