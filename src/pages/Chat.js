import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "../App";

function getRandomColor() {
  return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
    Math.random() * 256
  )}, ${Math.floor(Math.random() * 256)})`;
}

function formatLastSeen(timestamp) {
  const now = new Date();
  const lastSeen = new Date(timestamp);
  const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return "Az önce ayrıldı";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} saat önce`;
  } else {
    return `${lastSeen.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })} ${lastSeen.toLocaleTimeString('tr-TR', {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
}

function Chat({ socket, user, room, initialMessages = [] }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState(initialMessages);
  const [userColors, setUserColors] = useState({});
  const [typingUsers, setTypingUsers] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [roomUsers, setRoomUsers] = useState([]);

  const stopTypingTimer = useRef(null);
  const textareaRef = useRef(null);
  const listRef = useRef(null);
  const wasAtBottomRef = useRef(true);

  const maxChars = 2000;
  const warningThreshold = 1500;

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setCurrentMessage(value);
      socket.emit("typing", { room, username: user.username });

      if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
      stopTypingTimer.current = setTimeout(() => {
        socket.emit("stop_typing", { room, username: user.username });
      }, 1000);
    }
  };

  const getUserColor = (author) => {
    if (!userColors[author]) {
      const newColor = getRandomColor();
      setUserColors((prev) => ({ ...prev, [author]: newColor }));
      return newColor;
    }
    return userColors[author];
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room,
        author: user.username,
        message: currentMessage,
        time:
          new Date().getHours() +
          ":" +
          (new Date().getMinutes() < 10
            ? "0" + new Date().getMinutes()
            : new Date().getMinutes()),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");

      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
    socket.emit("stop_typing", { room, username: user.username });
  };

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };
    socket.on("receive_message", handleReceiveMessage);
    return () => socket.off("receive_message", handleReceiveMessage);
  }, [socket]);

  useEffect(() => {
    if (initialMessages.length > 0) setMessageList(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const atBottom = distance <= 4;
      setShowScrollButton(!atBottom);
      wasAtBottomRef.current = atBottom;
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollToBottom = () => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (wasAtBottomRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
    }
  }, [messageList.length]);

  useEffect(() => {
    const onTyping = ({ username: u }) => {
      if (!u || u === user.username) return;
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
  }, [socket, user.username, room]);

  useEffect(() => {
    // Listen for room users updates from server
    socket.on("room_users", (users) => {
      console.log("Received room users:", users);
      setRoomUsers(users || []);
    });

    // Optional: Refresh users data periodically (every 30 seconds)
    const refreshInterval = setInterval(() => {
      // Since there's no get_room_users event, we rely on server's automatic updates
      console.log("Periodic check - room users are being updated automatically");
    }, 30000);

    return () => {
      socket.off("room_users");
      clearInterval(refreshInterval);
    };
  }, [socket, room]);

  return (
    <div className="chat-window" data-theme={isDarkMode ? 'dark' : 'light'}>
      <div className="chat-header">
        <div className="header-bar">
          <div className="room-box">{room}</div>
          
          <div className="user-section">
            <button 
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            <span className="user-box">{user.username}</span>
            <button
              className="users-btn"
              onClick={() => {
                setShowUsers(!showUsers);
              }}
            >
              👥 Users ({(() => {
                const userMap = new Map();
                roomUsers.forEach(u => {
                  const existing = userMap.get(u.username);
                  if (!existing || (!u.leftAt && existing.leftAt)) {
                    userMap.set(u.username, u);
                  }
                });
                const uniqueUsers = Array.from(userMap.values());
                const onlineCount = uniqueUsers.filter(u => !u.leftAt).length;
                return uniqueUsers.length > 0 ? `${onlineCount}/${uniqueUsers.length}` : '...';
              })()}) 
            </button>

            {showUsers && (
              <div className="user-popup">
                {(() => {
                  // Create a map to get the latest status for each user
                  const userMap = new Map();
                  roomUsers.forEach(u => {
                    const existing = userMap.get(u.username);
                    // Keep the entry without leftAt (online) or the most recent leftAt
                    if (!existing || 
                        (!u.leftAt && existing.leftAt) || 
                        (u.leftAt && existing.leftAt && new Date(u.leftAt) > new Date(existing.leftAt))) {
                      userMap.set(u.username, u);
                    }
                  });
                  
                  const uniqueUsers = Array.from(userMap.values());
                  const onlineUsers = uniqueUsers.filter(u => !u.leftAt);
                  const offlineUsers = uniqueUsers.filter(u => u.leftAt);
                  
                  console.log('User processing:', {
                    totalReceived: roomUsers.length,
                    uniqueUsers: uniqueUsers.length,
                    onlineUsers: onlineUsers.length,
                    offlineUsers: offlineUsers.length,
                    currentUser: user.username,
                    rawUsers: roomUsers
                  });
                  
                  return (
                    <>
                      <h4>Users in room ({uniqueUsers.length})</h4>
                      
                      <div className="user-section-header">
                        <h5>🟢 Online ({onlineUsers.length})</h5>
                      </div>
                      <ul className="online-users">
                        {onlineUsers.map((u, idx) => (
                          <li key={idx}>
                            <div className="user-info">
                              <span className="username">{u.username}</span>
                              <div className="user-status">
                                <span className="online-indicator">🟢</span>
                                <span className="online-text">Online</span>
                              </div>
                            </div>
                          </li>
                        ))}
                        {onlineUsers.length === 0 && (
                          <li className="no-users">No online users</li>
                        )}
                      </ul>
                      
                      <div className="user-section-header">
                        <h5>⚫ Offline ({offlineUsers.length})</h5>
                      </div>
                      <ul className="offline-users">
                        {offlineUsers.map((u, idx) => (
                          <li key={idx}>
                            <div className="user-info">
                              <span className="username">{u.username}</span>
                              <div className="user-status">
                                <span className="offline-indicator">⚫</span>
                                <span className="last-seen">{formatLastSeen(u.leftAt)}</span>
                              </div>
                            </div>
                          </li>
                        ))}
                        {offlineUsers.length === 0 && (
                          <li className="no-users">No offline users</li>
                        )}
                      </ul>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="chat-body">
        <div
          className="message-container"
          ref={listRef}
        >
          {messageList.map((msg, idx) => (
            <div
              key={idx}
              className="message"
              id={user.username === msg.author ? "you" : "other"}
            >
              <div className="message-meta">
                <span
                  className="message-author"
                  style={{ color: getUserColor(msg.author) }}
                >
                  {msg.author}:
                </span>
                <span className="message-text">{msg.message}</span>
                <span className="message-time">{msg.time}</span>
              </div>
            </div>
          ))}
          {showScrollButton && (
            <div className="scroll-to-bottom-container">
              <button
                className="scroll-to-bottom-btn"
                onClick={handleScrollToBottom}
              >
                ↓
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="chat-footer">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={currentMessage}
          placeholder="Hey..."
          rows={1}
          maxLength={maxChars}
          onChange={handleInputChange}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <div className="char-counter">
          {currentMessage.length > warningThreshold
            ? currentMessage.length < maxChars
              ? `${maxChars - currentMessage.length}`
              : `${maxChars}/${maxChars}`
            : ""}
        </div>

        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(", ")} yazıyor
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;