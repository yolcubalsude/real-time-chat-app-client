import React, { useEffect, useState, useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function getRandomColor() {
  return `rgb(${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)})`;
}

function Chat({ user, room, socket, initialMessages = [] }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState(initialMessages);
  const [userColors, setUserColors] = useState({});
  const [typingUsers, setTypingUsers] = useState([]);
  const stopTypingTimer = useRef(null);

  const getUserColor = (author) => {
    if (!userColors[author]) {
      const newColor = getRandomColor();
      setUserColors(prev => ({ ...prev, [author]: newColor }));
      return newColor;
    }
    return userColors[author];
  };

  const sendMessage = () => {
    if (!currentMessage) return;
    const messageData = {
      room,
      author: user.username,
      message: currentMessage,
      time: `${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2,"0")}`
    };
    socket.emit("send_message", messageData);
    setMessageList(prev => [...prev, messageData]);
    setCurrentMessage("");
    socket.emit("stop_typing", { room, username: user.username });
  };

  useEffect(() => {
    socket.on("receive_message", data => setMessageList(prev => [...prev, data]));
    return () => socket.off("receive_message");
  }, [socket]);

  useEffect(() => setMessageList(initialMessages), [initialMessages]);

  useEffect(() => {
    const onTyping = ({ username }) => {
      if (!username || username === user.username) return;
      setTypingUsers(prev => prev.includes(username) ? prev : [...prev, username]);
    };
    const onStopTyping = ({ username }) => {
      setTypingUsers(prev => prev.filter(u => u !== username));
    };
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);
    return () => {
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
      if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
    };
  }, [socket, user.username, room]);

  const handleInputChange = (e) => {
    setCurrentMessage(e.target.value);
    socket.emit("typing", { room, username: user.username });
    if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
    stopTypingTimer.current = setTimeout(() => socket.emit("stop_typing", { room, username: user.username }), 1000);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">Logged in as {user.username}</div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((msg, i) => (
            <div key={i} className="message" id={user.username===msg.author?"you":"other"}>
              <div className="message-meta">
                <span className="message-author" style={{color:getUserColor(msg.author)}}>{msg.author}:</span>
                <span className="message-text">{msg.message}</span>
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}
        </ScrollToBottom>
        {typingUsers.length > 0 && <div className="typing-indicator">{typingUsers.join(", ")} yazıyor<span className="dot"></span><span className="dot"></span><span className="dot"></span></div>}
      </div>
      <div className="chat-footer">
        <input value={currentMessage} onChange={handleInputChange} placeholder="Type a message..." onKeyDown={e => e.key==="Enter" && sendMessage()} />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
 
