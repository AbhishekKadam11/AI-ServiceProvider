import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { GoogleGenAIConfig } from "../../config/google-genai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Tool } from "@langchain/core/tools";
import { AngularFormatterTool } from "../utils/angular-formatter";
import { CreateAngularProjectTool } from "../utils/project-creator";
import { CreateAngularComponentTool } from "../utils/angular-editor.tool";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";

export class LangchainContainer {

    protected modelWithTools: ReturnType<ChatGoogleGenerativeAI['bindTools']>;
    private toolNode: ReturnType<ChatGoogleGenerativeAI['bindTools']>;
    private model: ChatGoogleGenerativeAI;
    //@ts-ignore
    private tools: Tool[] = [ new CreateAngularProjectTool(), new CreateAngularComponentTool()];

    constructor(private genAIllm = new GoogleGenAIConfig()) {
        this.model = this.genAIllm.getModel();
        this.modelWithTools = this.genAIllm.getLangchainGenAI().modelWithTools;
        this.toolNode = this.genAIllm.getLangchainGenAI().toolNode;
        this.setupLangchain();
    }

    private async setupLangchain() {
        this.shouldContinue = this.shouldContinue.bind(this);
        this.callModel = this.callModel.bind(this);
    }

    private shouldContinue({ messages }: typeof MessagesAnnotation.State) {
        const lastMessage = messages[messages.length - 1] as AIMessage;

        if (lastMessage.tool_calls?.length) {
            return "tools";
        }
        return "__end__";
    }

    private callModel = async (state: typeof MessagesAnnotation.State) => {
        const response = await this.modelWithTools.invoke(state.messages);
        return { messages: [response] };
    };

    async invokeQuery(query: string) {
        // Define a new graph
        const workflow = new StateGraph(MessagesAnnotation)
            .addNode("agent", this.callModel)
            .addEdge("__start__", "agent") // __start__ is a special name for the entrypoint
            .addNode("tools", this.toolNode)
            .addEdge("tools", "agent")
            .addConditionalEdges("agent", this.shouldContinue);
        // Finally, we compile it into a LangChain Runnable.
        const app = workflow.compile();
        // console.log("app", query);
        // Use the agent
        const finalState = await app.invoke({
            messages: [new HumanMessage(query)],
        });
        console.log("finalState", finalState);
      //  console.log("finalState", finalState.messages[finalState.messages.length - 1].content);

        return finalState;
        // const nextState = await app.invoke({
        //     // Including the messages from the previous run gives the LLM context.
        //     // This way it knows we're asking about the weather in NY
        //     messages: [...finalState.messages, new HumanMessage("what about São Paulo, Brazil?")],
        // });
        // console.log("nextState:", nextState.messages[nextState.messages.length - 1].content);
    }

     public async generateAngularCode(prompt: ChatPromptTemplate, description: string): Promise<any> {
    
        const agent = createToolCallingAgent({ llm: this.model, tools: this.tools, prompt });
    
        const agentExecutor = new AgentExecutor({ agent, tools: this.tools, verbose: true });
    
        const result = await agentExecutor.invoke({ input: description, chat_history:[] });
        // console.log("Agent result:", result);
        return result.output;
      }
}   