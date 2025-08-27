import React, { useState } from "react";
import JoinedRooms from "../components/JoinedRooms";
import { useTheme } from "../App";

const API_URL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_SOCKET_URL?.replace(/\/$/, "") ||
  "http://localhost:3001";

function Rooms({ user, socket, setRoom, setLoadedMessages }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [createRoomId, setCreateRoomId] = useState("");
  const [createRoomPassword, setCreateRoomPassword] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinRoomPassword, setJoinRoomPassword] = useState("");
  const [joinError, setJoinError] = useState("");
  const [createMessage, setCreateMessage] = useState("");

  const createRoom = () => {
    setCreateMessage("");
    if (!createRoomId || !createRoomPassword)
      return setCreateMessage("Room ID and password are required");

    socket.emit("create_room", {
      roomId: createRoomId,
      password: createRoomPassword,
      username: user.username,
    });

    socket.once("room_created", ({ roomId,message}) => {
      
    setCreateMessage(message||'Room created: ${roomId}');
    
  });
  }

  const joinRoom = () => {
    setJoinError("");
    if (!joinRoomId || !joinRoomPassword)
      return setJoinError("Room ID and password are required");

    socket.emit("join_room", {
      roomId: joinRoomId,
      roomPassword: joinRoomPassword,
      username: user.username,
    });
    socket.once("join_success", ({ roomId }) => {
      fetch(`${API_URL}/messages/${roomId}`)
        .then((res) => res.json())
        .then((data) => setLoadedMessages(data))
        .catch((err) => console.error(err));
      
      socket.emit("ensure_room_join", {
        roomId: roomId,
        username: user.username
      });
      
      setRoom(roomId);
    });

    socket.once("join_error", ({ error }) =>
      setJoinError(error || "Join failed")
    );
  };

  return (
    <div className="joinChatContainer">
      <button 
        className="theme-toggle-btn rooms-theme-btn"
        onClick={toggleTheme}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDarkMode ? "☀️" : "🌙"}
      </button>
      <h3>Welcome {user.username}</h3>

      <JoinedRooms
        username={user.username}
        socket={socket}
        setRoom={setRoom}
        setLoadedMessages={setLoadedMessages}
      />
      <h3>Create Room</h3>
      {createMessage && <div className="error">{createMessage}</div>}
      <input
        placeholder="Room ID"
        value={createRoomId}
        onChange={(e) => setCreateRoomId(e.target.value)}
      />
      <input
        placeholder="Room Password"
        value={createRoomPassword}
        onChange={(e) => setCreateRoomPassword(e.target.value)}
      />
      <button onClick={createRoom}>Create Room</button>

      <h3>Join Room</h3>
      {joinError && <div className="error">{joinError}</div>}
      <input
        placeholder="Room ID"
        value={joinRoomId}
        onChange={(e) => setJoinRoomId(e.target.value)}
      />
      <input
        type="password"
        placeholder="Room Password"
        value={joinRoomPassword}
        onChange={(e) => setJoinRoomPassword(e.target.value)}
        autoComplete="current-password"
      />
      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
}

export default Rooms;
