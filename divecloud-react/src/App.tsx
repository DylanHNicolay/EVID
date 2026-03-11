import Header from './components/header/Header';
import ProfileCard from './components/profile/ProfileCard';
import LatestResults from './components/profile/LatestResults';

const sampleMeets = [
  {
    name: 'TYR Pro Swim Series - Westmont',
    date: 'Mar 4–7, 2026',
    results: [
      {
        event: '50 L Free',
        round: 'Finals',
        time: '21.43',
        badge: 'PB' as const,
        improvement: -0.14,
        place: 1,
      },
      {
        event: '50 L Free',
        round: 'Prelims',
        time: '21.86',
        improvement: 0.29,
        place: 2,
      },
      {
        event: '100 L Free',
        round: 'Finals',
        time: '47.84',
        improvement: 0.21,
        place: 1,
      },
      {
        event: '100 L Free',
        round: 'Semifinals',
        time: '47.54',
        badge: 'SB' as const,
        improvement: -0.09,
        place: 1,
      },
      {
        event: '100 L Free',
        round: 'Prelims',
        time: '47.38',
        badge: 'SB' as const,
        improvement: -0.25,
        place: 1,
      },
      {
        event: '200 L Free',
        round: 'Finals',
        time: '1:45.53',
        badge: 'SB' as const,
        improvement: -0.14,
        place: 1,
      },
      {
        event: '200 L Free',
        round: 'Prelims',
        time: '1:45.38',
        badge: 'SB' as const,
        improvement: -0.29,
        place: 1,
      },
    ],
  },
];

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
        <LatestResults meets={sampleMeets} />
      </div>
    </div>
  );
}

export default App;
