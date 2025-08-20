import React, { useState } from "react";

function Rooms({ user, socket, setRoom, setLoadedMessages }) {
  const [createRoomId, setCreateRoomId] = useState("");
  const [createRoomPassword, setCreateRoomPassword] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinRoomPassword, setJoinRoomPassword] = useState("");
  const [joinError, setJoinError] = useState("");

  const createRoom = () => {
    if (!createRoomId || !createRoomPassword)
      return alert("Oda ID ve şifre gerekli");

    socket.emit("create_room", {
      roomId: createRoomId,
      password: createRoomPassword,
      username: user.username,
    });

    socket.once("room_created", ({ roomId }) => {
      setRoom(roomId);
    });

    socket.once("room_exists", ({ message }) => alert(message));
  };

  const joinRoom = () => {
    if (!joinRoomId || !joinRoomPassword)
      return alert("Oda ID ve şifre gerekli");

    socket.emit("join_room", {
      roomId: joinRoomId,
      roomPassword: joinRoomPassword,
      username: user.username,
    });

    socket.once("join_success", ({ roomId }) => {
      fetch(`${process.env.REACT_APP_SOCKET_URL}/messages/${roomId}`)
        .then((res) => res.json())
        .then((data) => setLoadedMessages(data))
        .catch((err) => console.error(err));
      setRoom(roomId);
    });

    socket.once("join_error", ({ error }) =>
      setJoinError(error || "Join failed")
    );
  };

  return (
    <div className="joinChatContainer">
      <h3>Welcome, {user.username}</h3>

      <h3>Create Room</h3>
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
        placeholder="Room Password"
        value={joinRoomPassword}
        onChange={(e) => setJoinRoomPassword(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
}

export default Rooms;
