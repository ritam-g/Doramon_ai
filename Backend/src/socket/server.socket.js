import {  Server } from 'socket.io'
let io
export function initSocket(httpServer) {
    //NOTE - creating server with httpServer
    //REVIEW - so taht the server can be accessed from the frontend
    
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    })

    console.log("server is running properly ");

    io.on("connection", (socket) => {
        console.log("a user connected ", socket.id);

    })

}

export function getSocket() {

    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io
}