import { io } from 'socket.io-client'
let socket;
const url=import.meta.env.VITE_SOCKET_URL||'http://localhost:5000'
export function initializedSocketConnection() {
    socket = io("http://localhost:5000",{
        withCredentials: true
    })

    socket.on("connect", () => {
        console.log("Connected to the server");
    });
}
export function getSocket() { return socket; }