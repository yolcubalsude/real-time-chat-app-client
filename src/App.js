
import "./App.css";
import io from "socket.io-client";
import { useState } from "react";
import Chat from "./Chat";


  
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "https://real-time-chat-app-server-uh7v.onrender.com/";
const socket = io.connect(SOCKET_URL);

function App() {
  const [username, setUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [loadedMessages, setLoadedMessages] = useState([]);
  const [createRoomId, setCreateRoomId] = useState("");
  const [createRoomPassword, setCreateRoomPassword] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createUserPassword, setCreateUserPassword] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinRoomPassword, setJoinRoomPassword] = useState("");
  const [joinUsername, setJoinUsername] = useState("");
  const [joinUserPassword, setJoinUserPassword] = useState("");
  const [joinError, setJoinError] = useState("");




  const createUser = () => {
    if(createUsername && createUserPassword ){
      setUsername(createUsername);
      setUserPassword(createUserPassword);
    }
  };

  const createRoom = () => {
    if (createUsername && createUserPassword && createRoomId && createRoomPassword) {
      setUsername(createUsername);
      setUserPassword(createUserPassword);
      
      socket.emit("create_room", {
        roomId: createRoomId,
        password: createRoomPassword,
        username: createUsername,
        userPassword: createUserPassword,
      });
  
      // Backend'den gelen yanıtı dinle
      socket.once("room_created", () => {
        setRoom(createRoomId);
        setShowChat(true);
      });
  
      socket.once("room_exists", ({ message }) => {
        alert(message);
      });
    } else {
      alert("Kullanıcı adı, Oda ID ve Şifre gerekli!");
    }
  };
  

   const joinRoomFunc = () => {
    if (joinUsername  && joinUserPassword && joinRoomId && joinRoomPassword) {

      setUsername(joinUsername);
      setUserPassword(joinUserPassword);
      setJoinError("");


      console.log("join")
      socket.emit("join_room", {
        roomId: joinRoomId,
        password: joinRoomPassword, 
        username: joinUsername,
      })

      socket.once("join_success", ({ roomId }) => {
        setRoom(roomId);

        fetch(`${SOCKET_URL}/messages/${roomId}`)
          .then(res => res.json())
          .then(data => {
            socket.emit("load_messages", data);
            setLoadedMessages(data);
            console.log("Loaded messages for room: ", data);
          })
          .catch(err => {
            console.error("Failed to fetch messages:", err);
          });

        // Bilgilendirme mesajı gönder
        socket.emit("send_message", {
          room: roomId,
          author: "System",
          message: `${joinUsername} joined the room.`,
          time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
        });
        setShowChat(true);
      });

      socket.once("join_error", ({ error }) => {
        console.error(error);
        setJoinError(error || "Join failed");
      });
    }
    else {
      alert("Kullanıcı adı, şifre, Oda ID ve Oda şifresi gerekli!");
    }
  };
  

  return (
      <div className="App">
        {!showChat ? (
          <div className="joinChatContainer">
            <h3>Create Room</h3>
            <input
              type="text"
              placeholder="Username"
              value={createUsername}
              onChange={(e) => setCreateUsername(e.target.value)}
            />
               <input
            type="password"
            placeholder="User Password"
            value={createUserPassword}
            onChange={(e) => setCreateUserPassword(e.target.value)}
          />
            <input
              type="text"
              placeholder="Room ID"
              value={createRoomId}
              onChange={(e) => setCreateRoomId(e.target.value)}
            />
            <input
              type="password"
              placeholder="Room Password"
              value={createRoomPassword}
              onChange={(e) => setCreateRoomPassword(e.target.value)}
            />
            <button onClick={createRoom}>Create Room</button>
  
            <h3>Join Room</h3>
            {joinError && (
              <div className="error" style={{ color: "red", marginBottom: "8px" }}>
                {joinError}
              </div>
            )}
            <input
            type="text"
            placeholder="Username"
            value={joinUsername}
            onChange={(e) => setJoinUsername(e.target.value)}
            />
              <input
            type="password"
            placeholder="User Password"
            value={joinUserPassword}
            onChange={(e) => setJoinUserPassword(e.target.value)}
          />
            <input
              type="text"
              placeholder="Room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
            />
            
            <input
              type="password"
              placeholder="Room Password"
              value={joinRoomPassword}
              onChange={(e) => setJoinRoomPassword(e.target.value)}
            />
            <button onClick={joinRoomFunc}>Join Room</button>
          </div>
        ) : (
          <Chat
            socket={socket}
            username={username}
            userPassword={userPassword}
            room={room}
            initialMessages={loadedMessages}
          />
        )}
      </div>
    );
  }

export default App;