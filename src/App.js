import React, { useState, useEffect, createContext, useContext } from "react";
import socket from "./socket";

import Auth from "./pages/Auth";
import Rooms from "./pages/Rooms";
import Chat from "./pages/Chat";

import "./App.css";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

function App() {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState("");
  const [loadedMessages, setLoadedMessages] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const themeValue = {
    isDarkMode,
    toggleTheme
  };

  if (!user) {
    return (
      <ThemeContext.Provider value={themeValue}>
        <Auth setUser={setUser} />
      </ThemeContext.Provider>
    );
  }

  if (!room) {
    return (
      <ThemeContext.Provider value={themeValue}>
        <Rooms
          user={user}
          setRoom={setRoom}
          socket={socket}
          setLoadedMessages={setLoadedMessages}
        />
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={themeValue}>
      <Chat
        user={user}
        room={room}
        socket={socket}
        initialMessages={loadedMessages}
      />
    </ThemeContext.Provider>
  );
}

export default App;
