import express from "express";
import { ChatService } from "../common/shared/service/chat.service";

export class ChatController {
    constructor(private chatService: ChatService, public readonly router = express.Router()) {
        this.chatContainer = this.chatContainer.bind(this)
        this.router.post("/data/:sloc", this.chatContainer);
    }

    private async chatContainer(req: express.Request, res: express.Response) {
        let responseObj: any = {};
        const sloc = req.params.sloc || "";
        try {
            const validationHandler = (error: { statusCode: number, response: any }) => {
                responseObj.statusCode = error.statusCode;
                responseObj.response = error.response;
            }
            //call service
            const result = '';//await this.chatService.saveToFile(validationHandler, sloc, req.body);
            if (result && responseObj.statusCode == undefined) {
                responseObj.statusCode = 204;
            }
        } catch (err) {
            responseObj.statusCode = 500;
            responseObj.response = { reason: err || "Something went wrong" };
        } finally {
            if (responseObj.statusCode === 204) {
                res.send(responseObj.statusCode);
            } else {
                res.status(responseObj.statusCode).send(responseObj.response);
            }
        }
    }
}