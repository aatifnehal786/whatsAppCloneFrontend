import {io} from 'socket.io-client'
import useUserStore from '../store/useUserStore';

let socket = null;
export const initializeSocket = () => {
  if (socket) return socket;

  const user = useUserStore.getState().user;
  const BACKEND_URL = process.env.REACT_APP_API_URL;

  socket = io(BACKEND_URL, {
    withCredentials: true,
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    socket.emit("user_connected", user._id);
  });

  socket.on("connect_error", console.error);
  socket.on("disconnect", console.log);

  return socket;
};



export const getSocket = () => {
  if (!socket) {
    socket = initializeSocket();
  }
  return socket;
};




export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.off();        // remove all listeners
    socket.disconnect(); // clean disconnect
  }
};




