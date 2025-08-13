import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

// Or as a CSS color string
function getRandomColor() {
  return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
}

function Chat({ socket, username, room, initialMessages = [] }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState(initialMessages);
  const [userColors, setUserColors] = useState({});

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
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessageList(initialMessages);
    }
  }, [initialMessages]);

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
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyDown={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
