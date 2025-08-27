import { useEffect, useState } from "react";
import axios from "axios";

function JoinedRooms({ username, socket, setRoom, setLoadedMessages }) {
  const [rooms, setRooms] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/user/${username}/rooms`
        );
        const data = await res.json();
        setRooms(data);
        console.log()
      } catch (err) {
        console.error(err);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [username]);

  const joinRoom = (roomId) => {
    socket.emit("join_room", {
      username,
      roomId,
      bypassPassword: true, 
    });

    
    axios
    .get(`${process.env.REACT_APP_API_URL}/messages/${roomId}`)
    .then((res) => setLoadedMessages(res.data))
    .catch((err) => console.error(err));
  
  setRoom(roomId);
  };

  if (loading) return <div>Loading rooms...</div>;

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      {(rooms || []).map((room) => (
        <button
          key={room.roomId}
          onClick={() => joinRoom(room.roomId)}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {room.roomId}
        </button>
      ))}
    </div>
  );
}

export default JoinedRooms;