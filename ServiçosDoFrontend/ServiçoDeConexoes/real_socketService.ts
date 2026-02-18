import { io } from 'socket.io-client';

const socket = io("http://localhost:3000");

export const socketService = {
    connect: () => {
        socket.connect();
    },
    disconnect: () => {
        socket.disconnect();
    },
    on: (event: string, callback: any) => {
        socket.on(event, callback);
    },
    emit: (event: string, data: any) => {
        socket.emit(event, data);
    }
};