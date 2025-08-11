import Chat from './Chat';
import React from "react";
import { useState } from "react";
import './App.css';
import { io } from "socket.io-client";
const socket = io("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
    }
  };
 

  return (
    <div className="App">
      <h3>Join A Chat</h3>
        <input type="text" 
        placeholder="Room ID..." 
        onChange={(event) => {
          setRoom(event.target.value)
          }}
          value={room}
          />

          <input type="text" 
          placeholder="Username..." 
          onChange={(event) => {
            setUsername(event.target.value)
            }}
            value={username}
            />
        <button onClick={joinRoom}>Join A Room</button>
        <Chat socket={socket} username={username} room={room}/>
    </div>
  ); 
}

export default App;
