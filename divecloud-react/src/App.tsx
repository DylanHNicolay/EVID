import * as React from "react";
import ProfileCard from "./components/profile/ProfileCard";
import TeamCard from "./components/profile/TeamCard";

function App(): React.ReactElement {
  return (
    <div className="App">
      <ProfileCard
        firstName="Ian"
        lastName="Sinclair"
        location="Las Vegas, NV"
        team="California Polytechnic State University"
        avatarUrl="https://i.pravatar.cc/150"
      />
      <TeamCard />
    </div>
  );
}

export default App;