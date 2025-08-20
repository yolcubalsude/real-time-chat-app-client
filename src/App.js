import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import io from "socket.io-client";

import Auth from "./pages/Auth";
import Rooms from "./pages/Rooms";
import Chat from "./pages/Chat";

import "./App.css";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  "https://real-time-chat-app-server-uh7v.onrender.com/";
const socket = io.connect(SOCKET_URL);

function App() {
  const [user, setUser] = useState(null); // { username, password }
  const [room, setRoom] = useState("");
  const [loadedMessages, setLoadedMessages] = useState([]);

  if (!user) {
    return <Auth setUser={setUser} />;
  }

  if (!room) {
    return (
      <Rooms
        user={user}
        setRoom={setRoom}
        socket={socket}
        setLoadedMessages={setLoadedMessages}
      />
    );
  }

  return (
    <Chat
      user={user}
      room={room}
      socket={socket}
      initialMessages={loadedMessages}
    />
  );
}

export default App;
