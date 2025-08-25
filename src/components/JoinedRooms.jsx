import { useEffect, useState } from "react";
import axios from "axios";

function JoinedRooms({ username, socket, setRoom, setLoadedMessages }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // Kullanıcının geçmiş odalarını çek
    axios
      .get(`http://localhost:3001/user/${username}/rooms`) // local test için localhost
      .then((res) => setRooms(res.data))
      .catch((err) => console.error(err));
  }, [username]);

  const joinRoom = (roomId) => {
    socket.emit("join_room", {
      username,
      roomId,
      bypassPassword: true, // şifre istemeden giriş
    });

    // Mesajları çek
    axios
      .get(`http://localhost:3001/messages/${roomId}`)
      .then((res) => setLoadedMessages(res.data))
      .catch((err) => console.error(err));

    setRoom(roomId);
  };

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      {rooms.map((room) => (
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