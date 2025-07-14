import { DefaultEventsMap, Socket, Server } from 'socket.io';
import { IncomingMessage, Server as httpServer, ServerResponse, createServer } from 'http';

interface ICORS {
    origin: string,
    allowedHeaders: string[]
    methods: string[]
}

const WEBSOCKET_CORS: ICORS = {
   origin: '*',
   allowedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
   methods: ["GET", "POST"]
}

export class WebSocket extends Server {

   private static io: WebSocket;

   constructor(httpServer: httpServer<typeof IncomingMessage, typeof ServerResponse> | undefined) {
       super(httpServer, {
            cors: WEBSOCKET_CORS
        });
   }

   public static getInstance(httpServer?: httpServer<typeof IncomingMessage, typeof ServerResponse> | undefined): WebSocket {
       if (!WebSocket.io) {
           WebSocket.io = new WebSocket(httpServer);
       }

       return WebSocket.io;
   }

   public initializeHandlers(socketHandlers: Array<any>) {
       socketHandlers.forEach(element => {
        
           let namespace = WebSocket.io.of(element.path, (socket: Socket) => {
               element.handler.handleConnection(socket);
           });

           if (element.handler.middlewareImplementation) {
               namespace.use(element.handler.middlewareImplementation);
           }
       });
   }

}
