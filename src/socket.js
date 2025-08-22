import io from "socket.io-client";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  "https://real-time-chat-app-server-uh7v.onrender.com/";
const socket = io.connect(SOCKET_URL);

export default socket;
