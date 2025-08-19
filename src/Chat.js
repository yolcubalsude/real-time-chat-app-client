import React, { useEffect, useState , useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";



// Or as a CSS color string
function getRandomColor() {
  return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
}

function Chat({ socket, username, room, initialMessages = [] }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState(initialMessages);
  const [userColors, setUserColors] = useState({});
  const [typingUsers, setTypingUsers] = useState([]); 
  const stopTypingTimer = useRef(null);



  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCurrentMessage(value);

    // yazıyor bilgisini hemen yayınla
    socket.emit("typing", { room, username });

    // 1 sn sonra yazmayı bıraktı olarak bildir (debounce)
    if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
    stopTypingTimer.current = setTimeout(() => {
      socket.emit("stop_typing", { room, username });
    }, 1000);
  };
  

  // Generate consistent colors for users
  const getUserColor = (author) => {
    if (!userColors[author]) {
      const newColor = getRandomColor();
      setUserColors(prev => ({ ...prev, [author]: newColor }));
      return newColor;
    }
    return userColors[author];
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {    
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          (new Date(Date.now()).getMinutes() < 10
            ? "0" + new Date(Date.now()).getMinutes()
            : new Date(Date.now()).getMinutes()),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
    socket.emit("stop_typing", { room, username });
  };

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };
    socket.on("receive_message", handleReceiveMessage);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket]);

  // Update messageList when initialMessages are loaded
// 1. initialMessages load
useEffect(() => {
  if (initialMessages.length > 0) {
    setMessageList(initialMessages);
  }
}, [initialMessages]);

// 2. typing event listener
useEffect(() => {
  const onTyping = ({ username: u }) => {
    if (!u || u === username) return;
    setTypingUsers((prev) => (prev.includes(u) ? prev : [...prev, u]));
  };

  const onStopTyping = ({ username: u }) => {
    if (!u) return;
    setTypingUsers((prev) => prev.filter((name) => name !== u));
  };

  socket.on("typing", onTyping);
  socket.on("stop_typing", onStopTyping);

  return () => {
    socket.off("typing", onTyping);
    socket.off("stop_typing", onStopTyping);
    if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
  };
}, [socket, username, room]);


  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => {
            return (
              <div
                key={index}
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div className="message-meta">
                  <span className="message-author" style={{color: getUserColor(messageContent.author)}}>{messageContent.author}:</span>{" "}
                  <span className="message-text">{messageContent.message}</span>
                  <span className="message-time">{messageContent.time}</span>
                </div>
                
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={handleInputChange}
          onKeyDown={(event) => {
            event.key === "Enter" && sendMessage();
          }}
          
        />{typingUsers.length > 0 && (
          <div className="typing-indicator">
             {typingUsers.join(", ")} yazıyor
             <span className="dot"></span><span className="dot"></span><span className="dot"></span>
          </div>
            )}
        <button onClick={sendMessage}>&#9658;</button>
      </div>
      
    </div>
  );
}

export default Chat;
