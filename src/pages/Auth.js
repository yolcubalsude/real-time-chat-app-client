import React, { useState } from "react";
import { useTheme } from "../App";

function Auth({ setUser }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!username || !password)
      return setError("Kullanıcı adı ve şifre gerekli");

    const url = isRegister ? "/auth/register" : "/auth/login";
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ username, password });
      } else {
        setError(data.message || data.error || "Hata oluştu");
      }
    } catch (err) {
      setError("Sunucuya bağlanılamıyor");
    }
  };

  return (
    <div className="auth-fullscreen">
      <div className="joinChatContainer">
        <button 
          className="theme-toggle-btn auth-theme-btn"
          onClick={toggleTheme}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
        <h3>{isRegister ? "Register" : "Login"}</h3>
        {error && <div className="error">{error}</div>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleSubmit}>
          {isRegister ? "Register" : "Login"}
        </button>
        <p
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
          }}
          className="switch-auth"
        >
          {isRegister
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </p>
      </div>
    </div>
  );
}

export default Auth;
