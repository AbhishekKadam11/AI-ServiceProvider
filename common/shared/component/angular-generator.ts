import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { Tool } from "@langchain/core/tools";
import { z } from "zod";

// Define AngularFormatterTool outside of AngularCodeGenerator
export class AngularFormatter extends Tool {
    name = "angular_formatter";
    description = "Formats Angular TypeScript, HTML, or CSS code to adhere to best practices.";
    schema = z.object({
        input: z.string().optional().describe("A JSON string containing 'code' and 'fileType'."),
    }).transform((data) => data.input);

    async _call(arg: string | undefined): Promise<string> {
        if (!arg) {
            throw new Error("No input provided to AngularFormatterTool.");
        }
        let input: { code: string; fileType: "typescript" | "html" | "css" };
        try {
            input = JSON.parse(arg);
        } catch (e) {
            throw new Error("Failed to parse input for AngularFormatterTool. Expected a JSON string.");
        }
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
    public async generateAngularCode(description: string): Promise<string> {
        try {
            // Define the tools the agent can use
            const tools: Tool[] = [
                new AngularFormatter(),
                // Add more tools here, e.g., for looking up Angular documentation,
                // generating tests, or interacting with a mock file system.
            ];
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
                new SystemMessage("You can also use the following format: {agent_scratchpad}"),
            ]);
            const agent = await createReactAgent({
                llm: this.genAIllm.getModel(),
                //@ts-ignore
                tools: tools,
                prompt
            });
            
            // Create the AgentExecutor
            const agentExecutor = new AgentExecutor({
                agent: agent,
                tools: tools,
                verbose: true, // Set to true to see the agent's thought process
            });
            const result = await agentExecutor.invoke({ input: description });
            return result.output;
        } catch (error) {
            console.error("Error invoking Angular code generation agent:", error);
            throw new Error("Failed to generate Angular code.");
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
