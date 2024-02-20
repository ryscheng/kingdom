//import { ChatOpenAI } from "@langchain/openai";
import { Assistant } from "./Assistant.js";
import { Driver } from "./types/Driver.js";
import { Plugin } from "./types/Plugin.js";
import { UserInterface } from "./types/UserInterface.js";
import { AudioOut } from "./drivers/AudioOut.js";
import { Weather } from "./plugins/Weather.js";
import { HypeMachine } from "./plugins/HypeMachine.js";
import { CLI } from "./interfaces/CLI.js";

async function main() {
  console.log("Hello World");

  // Initialize everything
  const app = new Assistant();
  const drivers: Driver[] = [new AudioOut()];
  const plugins: Plugin[] = [new Weather(), new HypeMachine()];
  const interfaces: UserInterface[] = [new CLI()];

  // Registration
  app.addPlugins(...plugins);
  app.addInterfaces(...interfaces);

  // Start drivers
  drivers.forEach((d) => d.start());
  // Stop drivers gracefully
  // - For some reason, child processes aren't automatically killed on macOS
  process.on("exit", () => drivers.forEach((d) => d.stop()));

  // Show help
  app.printPlugins();

  /**
    const chatModel = new ChatOpenAI({
        configuration: {
            baseURL: "http://win.chicken-sailfin.ts.net:8123/v1",
        },
        openAIApiKey: "not-used",
    });

    const result = await chatModel.invoke("what is durian?");
    console.log(result);
    **/
}

try {
  main();
} catch (e) {
  console.error(e);
}
