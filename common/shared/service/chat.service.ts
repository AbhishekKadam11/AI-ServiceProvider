import { isSlocInvalid } from "./time-data.utils";
import { WorkerManager } from "./worker-manager";

interface IError {
    statusCode: number, response: any
}
export class ChatService {

    private readonly enqued = "pending";

    constructor(

    ) {

    }

    public async aggregationTaskCreator(payload: any): Promise<any> {
        let taskToExecute = new Map<string, any>();

       // taskToExecute.set(taskId, payload);
        this.taskWorkerHandler(taskToExecute);

        return { };
    }

    private taskWorkerHandler(taskToExecute: Map<string, any>) {
        const workerManager = new WorkerManager(taskToExecute);
        workerManager.worker.on('message', (result) => {
            console.log("result==>", result);
        });
        workerManager.assign(taskToExecute)

    }


}
