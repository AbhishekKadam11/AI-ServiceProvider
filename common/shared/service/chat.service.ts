import { LangchainContainer } from "../component/langchain-container";
import { WorkerManager } from "./worker-manager";

interface IError {
    statusCode: number, response: any
}
export class ChatService {

    constructor(
        private genAI = new LangchainContainer()
    ) {

    }

    public async aggregationTaskCreator(payload: any): Promise<any> {
        let taskToExecute = new Map<string, any>();

        // taskToExecute.set(taskId, payload);
        this.taskWorkerHandler(taskToExecute);

        return {};
    }

    private taskWorkerHandler(taskToExecute: Map<string, any>) {
        const workerManager = new WorkerManager(taskToExecute);
        workerManager.worker.on('message', (result) => {
            console.log("result==>", result);
        });
        workerManager.assign(taskToExecute)

    }

    public async sendGenAIRequest(payload: any) {
        try {
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
            // console.log("payload==>", payload);
            return await this.genAI.invokeQuery(payload[0].text);
        } catch (error) {
            console.error("Error in sendGenAIRequest:", error);
            throw error;
        }
    }


}
