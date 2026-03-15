import { io } from 'socket.io-client'
export function initializedSocketConnection() {
    const socket =io("http://localhost:5000",{
        withCredentials: true
    })

    socket.on("connect", () => {
        console.log("Connected to the server");
    });
}