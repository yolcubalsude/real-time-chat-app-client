import { useState } from "react";
import socket from "../socket";
import { useNavigate } from "react-router-dom";

function Auth({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isRegister) {
      socket.emit("create_user", { username, password });
    } else {
      socket.emit("login_user", { username, password });
    }

    socket.on("auth_success", (data) => {
      setUser(data.username);
      navigate("/rooms"); // doğrulandıktan sonra oda sayfasına git
    });

    socket.on("auth_error", (err) => {
      alert(err.error);
    });
  };

  return (
    <div>
      <h2>{isRegister ? "Kayıt Ol" : "Giriş Yap"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Kullanıcı adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isRegister ? "Kayıt Ol" : "Giriş Yap"}</button>
      </form>

      <p onClick={() => setIsRegister(!isRegister)} style={{cursor: "pointer"}}>
        {isRegister ? "Zaten hesabın var mı? Giriş yap" : "Hesabın yok mu? Kayıt ol"}
      </p>
    </div>
  );
}

export default Auth;
