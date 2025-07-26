import { AppEnvVariables } from "../shared/component/app-env-variables";
import { TavilySearch } from "@langchain/tavily";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ToolNode } from "@langchain/langgraph/prebuilt";

export class GoogleGenAIConfig {

    // Define the tools for the agent to use
    private tools = [new TavilySearch({ maxResults: 3 })];
    private toolNode = new ToolNode(this.tools);

    model: ChatGoogleGenerativeAI;
    modelWithTools: ReturnType<ChatGoogleGenerativeAI['bindTools']>;

    constructor(private appConfig: AppEnvVariables = new AppEnvVariables()) {
        // Create a model and give it access to the tools
        this.model = new ChatGoogleGenerativeAI({
            apiKey: this.appConfig.googleGenAiApiKey,
            model: "gemini-2.0-flash",
        });
        // this.modelWithTools = this.model.bindTools(this.tools);
    }

     getLangchainGenAI(): { modelWithTools: ReturnType<ChatGoogleGenerativeAI['bindTools']>, toolNode: ReturnType<ChatGoogleGenerativeAI['bindTools']> } {
        return { modelWithTools:this.modelWithTools, toolNode: this.toolNode };
    }

    getModel(): ChatGoogleGenerativeAI {
        return this.model;
    }

}