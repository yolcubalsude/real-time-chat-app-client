import './App.css';
import { io } from "socket.io-client";
const socket = io("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div>Hello World</div>
        <button onClick={() => socket.emit("join_room", 123)}>Join Room</button>
        <button onClick={() => socket.emit("send_message", "Hello")}>Send Message</button>
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  ); 
}

export default App;
