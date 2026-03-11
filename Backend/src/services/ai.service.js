import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Mistral } from "@mistralai/mistralai";
import 'dotenv/config'
const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey: process.env.GOOGLE_API_KEY
});

const mistralai = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY
})
export async function chatWithGeminiAiModel(chat) {
    return (await model.invoke(chat)).text
}

export async function chatWithMistralAiModel(chat) {
    const response = await mistralai.chat.complete({
        model: "mistral-small",
        messages: [
            { role: "user", content: chat }
        ]
    });
    return response.choices[0].message.content
}
