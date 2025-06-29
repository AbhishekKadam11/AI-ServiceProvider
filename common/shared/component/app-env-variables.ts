export class AppEnvVariables {
    constructor(protected processEnv = process.env) { }

    public get applicationPort(): number {
        return parseInt(this.processEnv.APPLICATION_PORT || "8000");
    }
}