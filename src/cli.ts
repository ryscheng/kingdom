import { ChatOpenAI } from "@langchain/openai";

async function main() {
    console.log("Hello World");
    
    const chatModel = new ChatOpenAI({
        configuration: {
            baseURL: "http://win.chicken-sailfin.ts.net:8123/v1",
        },
        openAIApiKey: "not-used",
    });

    const result = await chatModel.invoke("what is durian?");
    console.log(result);
}

try {
    main();
} catch (e) {
    console.error(e);
}
