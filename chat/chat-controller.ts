import express from "express";
import { ChatService } from "../common/shared/service/chat.service";
import { GoogleGenAI } from "@google/genai";

export class ChatController {

    constructor(private chatService: ChatService, public readonly router = express.Router(), private genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })) {
        this.chatContainer = this.chatContainer.bind(this)
        this.router.get("/gemini", this.chatContainer);
        // this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    private async chatContainer(req: express.Request, res: express.Response) {
        let responseObj: any = {};
        try {
            const validationHandler = (error: { statusCode: number, response: any }) => {
                responseObj.statusCode = error.statusCode;
                responseObj.response = error.response;
            }

            //call service
            // const result = '';//await this.chatService.saveToFile(validationHandler, sloc, req.body);
            // if (result && responseObj.statusCode == undefined) {
            //     responseObj.statusCode = 204;
            // }
            // const prompt = "Create 5 funny and witty jokes about generative AI";
            const result = await this.genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: "Tell me a story in 300 words.",
            });

            console.log('result', result)
            // const text = response.text();
            // res.send(text);
            responseObj.response = result;
        } catch (err) {
            responseObj.statusCode = 500;
            responseObj.response = { reason: err || "Something went wrong" };
        } finally {
            if (responseObj.response.candidates) {
                res.send(responseObj.response);
            } else {
                res.status(responseObj.statusCode).send(responseObj.response);
            }
        }
    }
}