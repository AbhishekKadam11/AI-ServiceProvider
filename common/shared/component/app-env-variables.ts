export class AppEnvVariables {
    constructor(protected processEnv = process.env) { }

    public get applicationPort(): number {
        return parseInt(this.processEnv.APPLICATION_PORT || "8000");
    }

    public get socketApplicationPort(): number {
        return parseInt(this.processEnv.SOCKET_APPLICATION_PORT || "8001");
    }

    public get googleGenAiApiKey(): string {
        return this.processEnv.GOOGLE_GENAI_API_KEY || "";
    }
}