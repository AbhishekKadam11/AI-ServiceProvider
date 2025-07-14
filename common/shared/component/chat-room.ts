import { Socket } from "socket.io";
import SocketInterface from "../interface/socketInterface";
import { WebSocket } from "./web-socket";

export class ChatRoom implements SocketInterface {
    constructor() {
    }

    handleConnection(socket: Socket) {
        console.log('simulator1_Namespace socket connected from chat room');
        // console.log('simulator1_Namespace socket connected');
        socket.on('Source', (source: any) => {
            console.log('simulator1_Namespace Source:', source);
            // socket.emit('ping', 'Hi! I am a live socket connection');
            const io = WebSocket.getInstance();
            const testData = {
                text: "test reply from server",
                date: new Date(),
                reply: false,
                type: 'text',
                files: '',
                user: {
                    name: 'Bot',
                    avatar: 'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png',
                },
            }
            io.of('/projectId').emit('Source', { data: testData });
        });
        // socket.emit('ping', 'Hi! I am a live socket connection');

    }

    middlewareImplementation(socket: Socket, next: () => any) {
        //Implement your middleware for orders here
        return next();
    }
}