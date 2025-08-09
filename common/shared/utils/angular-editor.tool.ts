import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import * as fs from 'fs';
import * as path from 'path';

// Define the schema for the tool's input
const CreateComponentAndRouteSchema = z.object({
  projectRootPath: z.string().describe("The root directory of the Angular project (e.g., '/path/to/my-angular-app')"), 
  name: z.string().describe("The name of the Angular component to create (e.g., 'my-component')"),
  componentPath: z.string().describe("The path where the component files should be generated (e.g., 'src/app/features/my-feature')"),
  routePath: z.string().describe("The path for the new route (e.g., 'my-feature')"),
  routingModulePath: z.string().describe("The path to the routing module to update (e.g., 'src/app/app-routing.module.ts')"),
  componentLogicDescription: z.string().describe("A description of the component's desired logic (e.g., 'A component that displays a list of products and allows adding new ones')."), // New field
});

export class CreateAngularComponentTool extends StructuredTool<typeof CreateComponentAndRouteSchema> {
  // ... (name, description, schema, constructor as defined previously)
  name = "create_angular_component";
  description = "Creates a new Angular component, registers it in the router, and adds a route entry to the specified routing module.";
  schema = CreateComponentAndRouteSchema;

 async _call(input: z.infer<typeof CreateComponentAndRouteSchema>): Promise<string> {
    const { projectRootPath, name, componentPath, routePath, routingModulePath, componentLogicDescription } = input;
    const capitalizedName = this.capitalizeFirstLetter(name);
    const componentClassName = `${capitalizedName}Component`;
    const componentDir = path.join(projectRootPath, componentPath, name); // Use projectRootPath
    const componentFileName = `${name}.component.ts`;

    // 1. Create component files
    try {
      fs.mkdirSync(componentDir, { recursive: true });

      const generatedComponentLogic = await this.generateComponentLogicWithLLM(name, componentLogicDescription);

      fs.writeFileSync(path.join(componentDir, componentFileName), `
        import { Component } from '@angular/core';
        import { CommonModule } from '@angular/common'; 

        @Component({
          selector: 'app-${name}',
          standalone: true, 
          imports: [CommonModule], 
          templateUrl: './${name}.component.html',
          styleUrls: ['./${name}.component.scss']
        })
        export class ${componentClassName} {
          ${generatedComponentLogic} 
        }
      `);

      fs.writeFileSync(path.join(componentDir, `${name}.component.html`), `
        <p>${name} works!</p>
      `);

      fs.writeFileSync(path.join(componentDir, `${name}.component.scss`), `
        /* styles for ${name} component */
      `);

      console.log(`Successfully created Angular component "${name}" at "${componentDir}".`);
    } catch (error) {
      console.error("Error creating component files:", error);
      return `Failed to create Angular component "${name}": ${error.message}`;
    }

    // 2. Register the component in the routing module
    try {
      const fullRoutingModulePath = path.join(projectRootPath, routingModulePath); // Use projectRootPath
      let routingModuleContent = fs.readFileSync(fullRoutingModulePath, 'utf8');

      const relativeComponentPath = path.relative(path.dirname(fullRoutingModulePath), path.join(componentDir, componentFileName)).replace(/\\/g, '/').replace('.ts', '');
      const importStatement = `import { ${componentClassName} } from './${relativeComponentPath}';`;
      
      const lastImportIndex = routingModuleContent.lastIndexOf('import');
      if (lastImportIndex !== -1) {
        const endIndex = routingModuleContent.indexOf('\n', lastImportIndex);
        routingModuleContent = routingModuleContent.substring(0, endIndex + 1) + `\n${importStatement}\n` + routingModuleContent.substring(endIndex + 1);
      } else {
        routingModuleContent = `${importStatement}\n\n` + routingModuleContent;
      }

      const routeEntry = `{ path: '${routePath}', component: ${componentClassName} },`;
      const routesArrayRegex = /(const routes: Routes = \[[\s\S]*?)(\]|\/\/ routes)/; 
      const match = routingModuleContent.match(routesArrayRegex);

      if (match && match.index) {
        const insertPosition = match.index + match.length;
        routingModuleContent = routingModuleContent.substring(0, insertPosition) + `\n  ${routeEntry}` + routingModuleContent.substring(insertPosition);
      } else {
        return `Error: Could not find the 'routes: Routes' array in '${fullRoutingModulePath}'. Please ensure the routing module structure is correct.`;
      }

      fs.writeFileSync(fullRoutingModulePath, routingModuleContent);
      console.log(`Successfully registered route for "${name}" component in "${fullRoutingModulePath}".`);
      return `Successfully created Angular component "${name}" at "${componentDir}" and registered its route at "/${routePath}" in "${fullRoutingModulePath}".`;

    } catch (error) {
      console.error("Error updating routing module:", error);
      return `Failed to register route for Angular component "${name}": ${error.message}`;
    }
  }

  // Helper method to generate component logic using an LLM
  private async generateComponentLogicWithLLM(componentName: string, description: string): Promise<string> {
    // **This is where you'd make your LLM call.** 
    // Example using an imagined LLM service:
    // const llmResponse = await this.llmService.generateComponentLogic(componentName, description);
    // return llmResponse.logicCode;

    // For demonstration, returning a simple placeholder
    return `
      constructor() {
        console.log('${componentName} component initialized with description: ${description}');
      }

      // Add methods and properties based on description
    `;
  }

  private capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}