import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const [link, setLink] = useState("");

    const navigate = useNavigate();

    const handleJoinRoom = () => {
        if (roomId.trim() && username.trim()) {
          navigate(`/room/${roomId.trim()}/${username.trim()}`);
        }
      };
      
      const handleGenerateLink = () => {
        if (roomId.trim() && username.trim()) {
          setLink(`${window.location.origin}/room/${roomId.trim()}/${username.trim()}`);
        }
      };
      

    return(
        <div className="home-container">
            <div className="home-content"> 
                <h1 className="home-title">join room</h1>
                <input type='text' placeholder="enter room id" value={roomId} onChange={(e) => setRoomId(e.target.value)}/>
                <input type='text' placeholder="enter username" value={username} onChange={(e) => setUsername(e.target.value)}/>
                <div>
                    <button className="home-button" onClick={handleGenerateLink}>generate invitation link</button>
                </div>
                <button className="home-button" onClick={handleJoinRoom}>Join Room</button>

                {link && (
                    <div className="invitation-link">
                        <p>Invitation Link: {link}</p>
                        <button className="copy-button" onClick={() => navigator.clipboard.writeText(link)}>Copy</button>
                    </div>
                )}
            </div>

        </div>
    )
}

export default Home;