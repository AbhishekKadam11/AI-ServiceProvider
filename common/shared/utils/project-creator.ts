import z from "zod";
import { spawn } from "child_process";
import { Tool } from "@langchain/core/tools";
import { WorkerManager } from "../service/worker-manager";

export class CreateAngularProjectTool extends Tool {
    name = "create_angular_project";
    description = "Creates a new Angular project with the specified name in a given directory, simulating 'ng new <projectName> --directory=<directoryPath>'.";
    //@ts-ignore
    schema = z.object({
        projectName: z.string().describe("The name of the Angular project to create."),
        directoryPath: z.string().optional().describe("The optional path where the project should be created. If not provided, it will be created in the current working directory."),
    });

    //@ts-ignore
    async _call(input: z.infer<typeof this.schema>): Promise<string> {
        try {
            const { projectName, directoryPath } = input;
            const pathInfo = directoryPath ? ` in directory '${directoryPath}'` : "";
            const executeCommand = (command: string, args: string[]): Promise<string> => {
                return new Promise((resolve, reject) => {
                    const child_options = { shell: true }
                    const childProcess = spawn(command, args, child_options);

                    let stdoutData = '';
                    let stderrData = '';

                    // Listen for data from standard output
                    childProcess.stdout.on('data', (data) => {
                        stdoutData += data.toString();
                    });

                    // Listen for data from standard error
                    childProcess.stderr.on('data', (data) => {
                        stderrData += data.toString();
                    });

                    // Handle errors during process execution
                    childProcess.on('error', (error) => {
                        reject(new Error(`Failed to start child process: ${error.message}`));
                    });

                    // Handle process exit
                    childProcess.on('close', (code) => {
                        if (code === 0) {
                            resolve(stdoutData.trim()); // Resolve with trimmed standard output
                        } else {
                            reject(new Error(`Command exited with code ${code}. Stderr: ${stderrData.trim()}`));
                        }
                    });
                });
            }
            try {
                let taskToExecute = new Map<string, any>();
               
                const lsOutput = taskToExecute.set('new_project', await executeCommand(`ng new ${projectName}`, [`--directory ${directoryPath}/${projectName}`, `--defaults`, `--interactive=false`]));
                // const lsOutput = await executeCommand(`ng new ${projectName}`, [`--directory ${directoryPath}/${projectName}`, `--defaults`, `--interactive=false`]);
                this.taskWorkerHandler(taskToExecute);
                console.log('create_angular_project lsoutput:\n', lsOutput);
                return `Executed command output: ${lsOutput}`;

            } catch (error: any) {
                console.error('Error executing command:', error.message);
                return `Error executing command: ${error.message}`;
            }
            //return `Angular project '${projectName}' created successfully in '${directoryPath}'.`;
        } catch (error) {
            return `Error creating Angular project: ${error}`;
        }
    }
    
    private taskWorkerHandler(taskToExecute: Map<string, any>) {
            const workerManager = new WorkerManager(taskToExecute);
            workerManager.worker.on('message', (result) => {
                console.log("taskWorkerHandler result==>", result);
            });
            workerManager.assign(taskToExecute)
    
     }
}