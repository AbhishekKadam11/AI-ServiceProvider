import { Socket } from "socket.io";
import SocketInterface from "../interface/socketInterface";
import { WebSocket } from "./web-socket";
import { GoogleGenAI, Type } from "@google/genai";

export class ChatRoom implements SocketInterface {
    constructor(private genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })) {
    }

    async handleConnection(socket: Socket) {
        console.log('simulator1_Namespace socket connected from chat room');
        // console.log('simulator1_Namespace socket connected');
        const requestParams = {
            responseMimeType: "application/json",
            // responseSchema: {
            //     type: Type.ARRAY,
            //     items: {
            //         type: Type.OBJECT,
            //         properties: {
            //             date: { type: Type.STRING, default: new Date().toISOString() },
            //             reply: { type: Type.BOOLEAN, default: false },
            //             type: { type: Type.STRING, default: 'text' },
                 
            //         }
            //     }
            // }

        };
        socket.on('Source', async (source: any) => {
            console.log('simulator1_Namespace Source:', source);
            const result = await this.genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: source,
                config: requestParams
            });

            console.log('result', JSON.stringify(result))
            // socket.emit('ping', 'Hi! I am a live socket connection');
            const io = WebSocket.getInstance();
            const testData = {
                text: result?.candidates && result.candidates.length > 0 ? JSON.stringify(result.candidates[0].content) : '',
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