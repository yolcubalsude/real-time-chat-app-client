import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Auth from "./pages/Auth";
import Rooms from "./pages/Rooms";
import Chat from "./pages/Chat";

function App() {
  const [user, setUser] = useState(null); // giriş yapan kullanıcı bilgisi
  const [room, setRoom] = useState(null); // aktif oda bilgisi

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth setUser={setUser} />} />
        <Route path="/rooms" element={<Rooms user={user} setRoom={setRoom} />} />
        <Route path="/chat" element={<Chat user={user} room={room} />} />
      </Routes>
    </Router>
  );
}

export default App;