import { useState, useEffect } from "react";
import socket from "../socket";

function Chat({ user, room }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (message) {
      socket.emit("send_message", {
        room,
        author: user,
        message,
        time: new Date().toLocaleTimeString(),
      });
      setMessage("");
    }
  };

  return (
    <div>
      <h2>Hoş geldin, {user} 👋</h2>
      <h3>Oda: {room}</h3>

      <div>
        {messages.map((msg, i) => (
          <p key={i}><b>{msg.author}:</b> {msg.message}</p>
        ))}
      </div>

      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Gönder</button>
    </div>
  );
}

export default Chat;
