import { GoogleGenAI } from "@google/genai";
import { AppEnvVariables } from "../shared/component/app-env-variables";


export class GoogleGenAIConfig {
    protected genAI: GoogleGenAI;

    constructor(private appConfig: AppEnvVariables = new AppEnvVariables()) {
        this.genAI = new GoogleGenAI({ apiKey: this.appConfig.googleGenAiApiKey })
    }

    getGenAI(): GoogleGenAI {
        return this.genAI;
    }   
}