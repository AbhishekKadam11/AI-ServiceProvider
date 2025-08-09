import { Worker, isMainThread, parentPort, workerData, MessageChannel } from "node:worker_threads";
// import { BackgroundAggregate } from "../component/background-aggregate";

interface IWorkerData {
    data: any;
}

interface IWRequest {
    task: string;
    data: any;
}

const workersInBacklog: any[] = [];

export class WorkerManager {

    public worker: Worker;
    constructor(payload: Map<string, any>) {
        this.worker = new Worker(__filename, { workerData: payload });
    }

    public create(payload: any) {
        // this.worker.postMessage({ task: 'init', data: payload });
        // this.worker = new Worker(path.join(__dirname, '..', '..','fileHandler', 'file-handler.js'), { workerData: payload });
        //    parentPort.postMessage("test")
    }

    public async assign(payload: any) {
        this.worker.postMessage({ task: 'init', data: payload });
    }

    async closeProcess() {
        return new Promise<void>((resolve, reject) => {
            this.worker.once("message", (reply) => {
                if (reply === 'shutdonw-completed') {
                    resolve();
                }
            })
            this.worker.postMessage({ task: 'shutdown', data: undefined });
        })
    }

    async onProcess() {
        // return new Promise((resolve, reject) => {
        // if (this.worker != undefined) {
        // this.worker.on("message", (data) => {
        //     console.log("data====>", data)
        //     resolve(data);
        //     // return data
        // });
        // this.worker.on("error", (msg) => {
        //     reject(`An error ocurred: ${msg}`);
        // });
        // }
        // console.log("err====>")
        // })
        return workersInBacklog;
    }

}

if (!isMainThread) {
    // const { port1, port2 } = new MessageChannel();

    const taskHandler = async (req: IWRequest) => {
        switch (req.task) {
            case 'shutdown':
                //@ts-ignore
                await Promise.allSettled(workersInBacklog.map(w => w.closeProcess()));
                break;
            case 'init':
                if (req.data == undefined || req.data.length < 0) {
                    console.log('no data to assign on worker');
                    break;
                }
                console.log("received task", req.data)

                //  const result: any =// new BackgroundAggregate(req.data);
                // console.log("result", result)
                if (parentPort) {
                    parentPort?.postMessage(JSON.stringify(req.data));
                }
                //@ts-ignore
                workersInBacklog.push(req.data);
                break;
            default:
                console.log("task not found");
                break;
        }
    }

    async function main() {
        parentPort?.on("message", taskHandler);
    }

    main();
    // async function workerMain(workersInBacklog: any) {
    //     await Promise.allSettled(workersInBacklog.map(w=> {}))
    // }
}
