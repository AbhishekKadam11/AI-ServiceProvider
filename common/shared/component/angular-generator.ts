import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { Tool } from "@langchain/core/tools";
import { z } from "zod";
import { formatXml } from "langchain/agents/format_scratchpad/xml"; // For formatting agent scratchpad

// Define AngularFormatterTool outside of AngularCodeGenerator
// export class AngularFormatter extends Tool {
//     name = "angular_formatter";
//     description = "Formats Angular TypeScript, HTML, or CSS code to adhere to best practices.";
//     schema = z.object({
//         input: z.string().optional().describe("A JSON string containing 'code' and 'fileType'."),
//     }).transform((data) => data.input);

//     async _call(arg: string | undefined): Promise<string> {
//         if (!arg) {
//             throw new Error("No input provided to AngularFormatterTool.");
//         }
//         let input: { code: string; fileType: "typescript" | "html" | "css" };
//         try {
//             input = JSON.parse(arg);
//         } catch (e) {
//             throw new Error("Failed to parse input for AngularFormatterTool. Expected a JSON string.");
//         }
//         const { code, fileType } = input;
//         // In a real application, you would integrate with a code formatter like Prettier here.
//         // For this example, we'll just simulate formatting.
//         console.log(`[AngularFormatterTool] Formatting ${fileType} code...`);
//         // Simple mock formatting: add a comment
//         if (fileType === "typescript") {
//             return `// Formatted by AngularFormatterTool\n${code}`;
//         } else if (fileType === "html") {
//             return `<!-- Formatted by AngularFormatterTool -->\n${code}`;
//         } else if (fileType === "css") {
//             return `/* Formatted by AngularFormatterTool */\n${code}`;
//         }
//         return code;
//     }
// }

class AngularFormatter extends Tool {
  name = "angular_formatter";
  description = "Formats Angular TypeScript, HTML, or CSS code to adhere to best practices.";
  //@ts-ignore
  schema = z.object({
    code: z.string().describe("The Angular code string to format."),
    fileType: z.enum(["typescript", "html", "css"]).describe("The type of Angular file (typescript, html, or css)."),
  });
  //@ts-ignore
  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    const { code, fileType } = input;
    // In a real application, you would integrate with a code formatter like Prettier here.
    // For this example, we'll just simulate formatting.
    console.log(`[AngularFormatterTool] Formatting ${fileType} code...`);
    // Simple mock formatting: add a comment
    if (fileType === "typescript") {
      return `// Formatted by AngularFormatterTool\n${code}`;
    } else if (fileType === "html") {
      return `<!-- Formatted by AngularFormatterTool -->\n${code}`;
    } else if (fileType === "css") {
      return `/* Formatted by AngularFormatterTool */\n${code}`;
    }
    return code;
  }
}

import { GoogleGenAIConfig } from "../../config/google-genai";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";

export class AngularCodeGenerator {

  private agentExecutor!: AgentExecutor;

  //@ts-ignore
  constructor(private genAIllm = new GoogleGenAIConfig()) {
    // this.model = this.googleGenAI.getLangchainGenAI();
    // this.codeGenerator = this.codeGenerator.bind(this);
  }

  // private async codeGenerator() {
  //     // Create the React-style agent
  //     const agent = await createReactAgent({
  //         llm: this.genAIllm.model,
  //         tools: [this.tools],
  //         prompt: this.trainGeneratorPrompt(),
  //     });

  //     // Create the AgentExecutor
  //     this.agentExecutor = new AgentExecutor({
  //         agent,
  //         tools: [this.tools],
  //         verbose: true, // Set to true to see the agent's thought process
  //     });
  // }

  private trainGeneratorPrompt() {
    // Define the prompt template for the agent
    const prompt = ChatPromptTemplate.fromMessages([
      new SystemMessage(
        `You are an expert Angular developer AI. Your task is to generate complete and functional Angular components (TypeScript, HTML, CSS) based on user descriptions.
                Always provide all three parts: TypeScript (.ts), HTML (.html), and CSS (.css).
                Strive for clean, idiomatic, and well-structured Angular code.
                If you need to format code, use the 'angular_formatter' tool.
                
                Output format should be clearly separated by code blocks like this:
                \`\`\`typescript
                // TypeScript code
                \`\`\`
                \`\`\`html
                <!-- HTML code -->
                \`\`\`
                \`\`\`css
                /* CSS code */
                \`\`\`
                `
      ),
      new HumanMessage("{input}"),
      new SystemMessage("You can use tools: {tools}"),
      // new SystemMessage("You can also use the following format: {agent_scratchpad}"),
    ]);

    return prompt;
  }

  /**
   * Runs the Angular code generation agent.
   * @param description The user's description of the Angular component.
   * @returns The generated Angular code as a string.
   */
  public async generateAngularCode(description: string): Promise<any> {
    try {
      // Define the tools the agent can use
      const tools: Tool[] = [
        //@ts-ignore
        new AngularFormatter(),
        // Add more tools here, e.g., for looking up Angular documentation,
        // generating tests, or interacting with a mock file system.
      ];
      // Define the prompt template for the agent
      // const prompt = ChatPromptTemplate.fromMessages([
      //     new SystemMessage(
      //         `You are an expert Angular developer AI. Your task is to generate complete and functional Angular components (TypeScript, HTML, CSS) based on user descriptions.
      //             Always provide all three parts: TypeScript (.ts), HTML (.html), and CSS (.css).
      //             Strive for clean, idiomatic, and well-structured Angular code.
      //             If you need to format code, use the 'angular_formatter' tool: {tools}

      //             Output format should be clearly separated by code blocks like this:
      //             \`\`\`typescript
      //             // TypeScript code
      //             \`\`\`
      //             \`\`\`html
      //             <!-- HTML code -->
      //             \`\`\`
      //             \`\`\`css
      //             /* CSS code */
      //             \`\`\`
      //             `
      //     ),
      //     // new HumanMessage("{input}"),
      //     // new SystemMessage("You can use tools: {tools}"),
      //     // new SystemMessage("You can also use the following format: {agent_scratchpad}"),
      // ]);




      const prompt = ChatPromptTemplate.fromMessages([
        new SystemMessage(
          `You are an expert Angular developer AI. Your task is to generate complete and functional Angular components (TypeScript, HTML, CSS) based on user descriptions.
    Always provide all three parts: TypeScript (.ts), HTML (.html), and CSS (.css).
    Strive for clean, idiomatic, and well-structured Angular code.
    `
        ),
        new MessagesPlaceholder("chat_history"), // Placeholder for chat history if needed for conversational agents
        new HumanMessage("{input}"),
    //    new MessagesPlaceholder("tools"), // REQUIRED: Placeholder for tool descriptions
      //  new MessagesPlaceholder("tool_names"), // REQUIRED: Placeholder for tool descriptions
        new MessagesPlaceholder("agent_scratchpad"), // Crucial for React agents to track thoughts and tool outputs
      ]);

      // Initialize the LLM (Gemini 2.0 Flash)
      const model = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY,
        model: "gemini-2.0-flash",
        temperature: 0.7, // Adjust for creativity vs. consistency
      });

      // Create the React-style agent as a RunnableSequence
      // This ensures that 'agent_scratchpad' is correctly formatted before being passed to the prompt.
      const agentRunnable = RunnableSequence.from([
        RunnablePassthrough.assign({
          // 'agent_scratchpad' needs to be formatted from BaseMessages[] to a string
          // for the React agent's internal prompt structure.
          streamRunnable: {}, // Disable streaming for this example
          agent_scratchpad: (input: { agent_scratchpad?: BaseMessage[] }) =>
            input.agent_scratchpad ?? [], // Ensure it's always AgentStep[]
          // Explicitly pass tools and tool_names to the prompt's input variables
        tools: () => tools,
        tool_names: () => tools.map(tool => tool.name),
        }),
        prompt, // The prompt now receives the formatted agent_scratchpad
        model.bind({ tools }), // Bind the tools to the model
      ]);

      // let agent;
      // try {
      //   // Bind the tools to the model      
      //   agent = await createReactAgent({
      //     llm: model,
      //     //@ts-ignore
      //     tools: tools,
      //     prompt
      //   });
      // } catch (error) {
      //   console.error("Error creating React agent:", error);
      //   // throw new Error("Failed to generate Angular code.");
      // }

      // Create the AgentExecutor
      const agentExecutor = new AgentExecutor({
        //@ts-ignore
        agent: agentRunnable,
        tools: tools,
        verbose: true, // Set to true to see the agent's thought process
      });
      const result = await agentExecutor.invoke({ input: "create angular project having login and registration page", chat_history: [] });
      return result.output;
    } catch (error) {
      console.error("Error invoking Angular code generation agent:", error);
      // throw new Error("Failed to generate Angular code.");
    }
  }

}

// Define the tools the agent can use
// const tools: Tool[] = [
//   new AngularFormatterTool(),
//   // Add more tools here, e.g., for looking up Angular documentation,
//   // generating tests, or interacting with a mock file system.
// ];


// Example usage (for testing the agent directly)
// (async () => {
//   const description = "Create an Angular component for a simple counter with increment and decrement buttons.";
//   console.log(`Generating code for: "${description}"`);
//   const code = await generateAngularCode(description);
//   console.log("\n--- Generated Code ---");
//   console.log(code);
// })();
