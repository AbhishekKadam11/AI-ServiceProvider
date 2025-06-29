import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { IncomingMessage, ServerResponse, Server } from 'http';
import { AppEnvVariables } from './app-env-variables';
import { errorHandler } from '../middleware/error.middleware';
import { notFoundHandler } from '../middleware/not-found.middleware';

export class AppContainer {
    protected app: Application;
    private httpServer: Server<typeof IncomingMessage, typeof ServerResponse> | undefined;

    constructor(private readonly appName: string, private appConfig: AppEnvVariables) {
        this.app = express();
        this.config();
    }
    private config(): void {
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS,PUT');
            res.header('Access-Control-Allow-Headers', '*');
            next();
        });
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(errorHandler);
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

    public async listen() {
        this.httpServer = this.app.listen(this.appConfig.applicationPort, () => {
            console.log(`[${this.appName}]: Server is running at http://localhost:${this.appConfig.applicationPort}`);
        })
    }
}