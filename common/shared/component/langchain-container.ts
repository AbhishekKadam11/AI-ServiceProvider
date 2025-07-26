import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { GoogleGenAIConfig } from "../../config/google-genai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Tool } from "@langchain/core/tools";
import { AngularFormatterTool } from "../utils/angular-formatter";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import z from "zod";
import { exec } from "child_process";

// NEW TOOL: Define a tool to simulate Angular project creation
// class AngularProjectCreatorTool extends Tool {
//   name = "angular_project_creator";
//   description = "Creates a new Angular project with the specified name, simulating 'ng new <projectName>'.";
//   //@ts-ignore
//   schema = z.object({
//     input: z.string().describe("The name of the Angular project to create."),
//   });

//   async _call(arg: string | undefined): Promise<string> {
//     let projectName: string;
//     try {
//       const parsed = this.schema.parse(JSON.parse(arg ?? "{}"));
//       projectName = parsed.input;
//     } catch (e) {
//       throw new Error("Invalid input for AngularProjectCreatorTool: " + (e instanceof Error ? e.message : String(e)));
//     }
//     // In a real scenario, this would execute 'ng new projectName' or similar logic.
//     // For this example, we'll just simulate success.
//     console.log(`[AngularProjectCreatorTool] Creating Angular project: ${projectName}...`);
//     return `Successfully created a new Angular project named '${projectName}' with basic file structure.`;
//   }
// }

// class AngularProjectCreatorTool extends Tool {
//   name = "angular_project_creator";
//   description = "Creates a new Angular project with the specified name in a given directory, simulating 'ng new <projectName> --directory=<directoryPath>'.";
//   schema = z.object({
//     projectName: z.string().describe("The name of the Angular project to create."),
//     directoryPath: z.string().optional().describe("The optional path where the project should be created. If not provided, it will be created in the current working directory."),
//   });

//   async _call(input: z.infer<typeof this.schema>): Promise<string> {
//     const { projectName, directoryPath } = input;
//     console.log("projectName input", input)
//     // In a real scenario, this would execute 'ng new projectName --directory=directoryPath' or similar logic.
//     // For this example, we'll just simulate success.
//     const pathInfo = directoryPath ? ` in directory '${directoryPath}'` : "";
//     // console.log(`[AngularProjectCreatorTool] Creating Angular project: ${projectName}${pathInfo}...`);
//     return `Successfully created a new Angular project named '${projectName}'${pathInfo} with basic file structure.`;
//   }
// }

class CreateAngularProjectTool extends Tool {
  name = "create_angular_project";
  description = "Creates a new Angular project with the specified name in a given directory, simulating 'ng new <projectName> --directory=<directoryPath>'.";
  schema = z.object({
    projectName: z.string().describe("The name of the Angular project to create."),
    directoryPath: z.string().optional().describe("The optional path where the project should be created. If not provided, it will be created in the current working directory."),
  });

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
   try {
      const { projectName, directoryPath } = input;
      const command = `ng new ${projectName} --directory ${directoryPath}`;
      const { stdout, stderr } = await exec(command); // Assuming 'exec' from 'child_process/promises'
      if (stderr) {
        //ts-ignore
        throw new Error(stderr);
      }
      return `Angular project '${projectName}' created successfully in '${directoryPath}'.\n${stdout}`;
    } catch (error) {
      return `Error creating Angular project: ${error.message}`;
    }
  }
}


export class LangchainContainer {

    protected modelWithTools: ReturnType<ChatGoogleGenerativeAI['bindTools']>;
    private toolNode: ReturnType<ChatGoogleGenerativeAI['bindTools']>;
    private model: ChatGoogleGenerativeAI;
    private tools: Tool[] = [new AngularFormatterTool(), new CreateAngularProjectTool()];

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
    
        const result = await agentExecutor.invoke({ input: "Create angular project with name testing with login and registration page", chat_history:[] });
        // console.log("Agent result:", result);
        return result.output;
      }
}   