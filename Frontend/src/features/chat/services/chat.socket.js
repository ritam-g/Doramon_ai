import { io } from 'socket.io-client'
import { SOCKET_URL } from '../../../app/config/env'

let socket;

export function initializedSocketConnection() {
    if (socket) {
        return socket;
    }

    socket = io(SOCKET_URL, {
        withCredentials: true,
    });

    socket.on('connect', () => {
        console.log('Connected to the server');
    });

    return socket;
}

export function getSocket() {
    return socket;
}
