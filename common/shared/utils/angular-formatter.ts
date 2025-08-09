import { Tool } from "@langchain/core/tools";
import { z } from "zod";

// Define a custom tool (optional, but good for structured tasks)
// For demonstration, let's imagine a tool that "formats" Angular code.
// In a real scenario, this might call Prettier or an Angular CLI command.
export class AngularFormatterTool extends Tool {

    name = "angular_formatter";
    description = "Formats Angular TypeScript, HTML, or SCSS code to adhere to best practices.";
    //@ts-ignore
    schema = z.object({
        input: z.string().optional().describe("A JSON string containing 'code' and 'fileType'."),
    }).transform((data) => data.input);

    async _call(arg: string | undefined): Promise<string> {
        if (!arg) {
            throw new Error("No input provided to AngularFormatterTool.");
        }
        let input: { code: string; fileType: "typescript" | "html" | "scss" };
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
        } else if (fileType === "scss") {
            return `/* Formatted by AngularFormatterTool */\n${code}`;
        }
        return code;
    }

}