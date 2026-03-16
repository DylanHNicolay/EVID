import TeamCard from "../components/profile/TeamCard";
import LatestResults from "../components/profile/LatestResults";
import './profile-home-tab.css'

export default function ProfileHomeTab(){
    return (
        <div
            className="teamAndResults"
        >
            <TeamCard/>
            <LatestResults/>
        </div>
    )
}