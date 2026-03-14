import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage } from "@langchain/core/messages";
import readline from "readline/promises";
import "dotenv/config";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey: process.env.GOOGLE_API_KEY,
});

const model2 = new ChatMistralAI({
    model: "mistral-small-latest",
    temperature: 0.1,
});

export async function chatWithGeminiAiModel(chat) {
    return (await model.invoke(chat)).text;
}

let messageHistory = [];

export async function chatWithMistralAiModel() {

    while (true) {
        const question = await rl.question("enter your question: you ");

        messageHistory.push(new HumanMessage(question));

        const response = await model2.invoke(messageHistory);

        messageHistory.push(response);

        console.log("response:", response.content);
    }

}

