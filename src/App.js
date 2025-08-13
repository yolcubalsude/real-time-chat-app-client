
import "./App.css";
import io from "socket.io-client";
import { useState } from "react";
import Chat from "./Chat";


  
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:3001";
const socket = io.connect(SOCKET_URL);

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [loadedMessages, setLoadedMessages] = useState([]);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);


      // get all messages of that room via HTTP
      fetch(`${SOCKET_URL}/messages/${room}`)
        .then(res => res.json())
        .then(messages => {
          socket.emit("load_messages", messages);
          setLoadedMessages(messages);
          console.log("Loaded messages for room:", messages);
        })
        .catch(err => {
          console.error("Failed to fetch messages:", err);
        });
      
  
      // Bilgilendirme mesajı gönder
      socket.emit("send_message", {
        room: room,
        author: "System",
        message: `${username} joined the room.`,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      });
  
      setShowChat(true);
    }
  };
  

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Join A Chat</h3>
          <input
            type="text"
            placeholder="John..."
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Room ID..."
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />
          <button onClick={joinRoom}>Join A Room</button>
        </div>
      ) : (
        <Chat socket={socket} username={username} room={room} initialMessages={loadedMessages} />
      )}
    </div>
  );
}

export default App;