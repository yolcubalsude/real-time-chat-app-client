import { useState } from "react";
import socket from "../socket";
import { useNavigate } from "react-router-dom";

function Rooms({ user, setRoom }) {
  const [roomId, setRoomId] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const navigate = useNavigate();

  const joinRoom = () => {
    socket.emit("join_room", { roomId, password: roomPassword, username: user });

    socket.on("join_success", (data) => {
      setRoom(data.roomId);
      navigate("/chat");
    });

    socket.on("join_error", (err) => {
      alert(err.error);
    });
  };

  return (
    <div>
      <h2>Merhaba {user} 👋</h2>
      <h3>Odaya Katıl</h3>
      <input placeholder="Oda ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
      <input placeholder="Oda Şifresi" value={roomPassword} onChange={(e) => setRoomPassword(e.target.value)} />
      <button onClick={joinRoom}>Katıl</button>
    </div>
  );
}

export default Rooms;
