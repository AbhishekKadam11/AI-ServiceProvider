import { Socket } from "socket.io";
import SocketInterface from "../interface/socketInterface";
import { WebSocket } from "./web-socket";
import { ChatService } from "../service/chat.service";

export class ChatRoom implements SocketInterface {
    constructor(private chatService = new ChatService()) {
        // Initialize any other properties or configurations if needed
        console.log('ChatRoom initialized with Google GenAI');
    }

    async handleConnection(socket: Socket) {
        console.log('simulator1_Namespace socket connected from chat room');
        // console.log('simulator1_Namespace socket connected');
      
        socket.on('Source', async (source: any) => {
            // console.log('simulator1_Namespace Source:', source);

            const result = await this.chatService.sendGenAIRequest(source);
            console.log('simulator1_Namespace result:', result);

            // console.log('result', JSON.stringify(result))
            // socket.emit('ping', 'Hi! I am a live socket connection');
            const io = WebSocket.getInstance();
            const testData = {
                text: result,
                date: new Date(),
                reply: false,
                type: 'text',
                files: '',
                user: {
                    name: 'Bot',
                    avatar: 'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png',
                },
            }
            io.of('/projectId').emit('Source', { data:  testData });
        });
        // socket.emit('ping', 'Hi! I am a live socket connection');

    }

    middlewareImplementation(socket: Socket, next: () => any) {
        //Implement your middleware for orders here
        return next();
    }
}