import express, { Application } from 'express';
import { IncomingMessage, ServerResponse, createServer, Server } from 'http';
import { Server as SocketIoServer } from 'socket.io';
import { AppEnvVariables } from './app-env-variables';
import { WebSocket } from './web-socket';

export class SocketContainer {
    protected app: Application;
    protected socketServer: Server<typeof IncomingMessage, typeof ServerResponse> | undefined;
    private socketIO: Server<typeof IncomingMessage, typeof ServerResponse> | undefined;

    constructor(private readonly appName: string, private appConfig: AppEnvVariables) {
        this.app = express();
        this.config();
    }
    private config(): void {
        // this.app.use((req: Request, res: Response, next: NextFunction) => {
        //     res.header('Access-Control-Allow-Origin', '*');
        //     res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS,PUT');
        //     res.header('Access-Control-Allow-Headers', '*');
        //     next();
        // });
        // this.app.use(bodyParser.json());
        // this.app.use(bodyParser.urlencoded({ extended: false }));
        // this.app.use(errorHandler);
        this.socketServer = createServer(this.app);
        const io = WebSocket.getInstance(this.socketServer);

        io.initializeHandlers([{
            path: '/', handler: ''
        }])
        

        io.on("connection", (...params) => {
            console.log(params);
        });

        process.on('SIGTERM', signal => {
            console.log(`Process ${process.pid} received a SIGTERM signal`)
            process.exit(0);
        })

        process.on('SIGINT', signal => {
            console.log(`Process ${process.pid} has been interrupted`)
            process.exit(0);
        })
        // this.app.use(notFoundHandler);
    }

    public async socketIOListen() {
        this.socketIO = this.socketServer?.listen(this.appConfig.socketApplicationPort, () => {
            console.log(`[${this.appName}]: Socket server is running at http://localhost:${this.appConfig.socketApplicationPort}`);
        })
    }
}