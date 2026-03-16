import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { chatWithMistralAiModel, messageTitleGenerator } from "../services/ai.service.js";

export async function sendMessageController(req, res, next) {
    try {
        const { message } = req.body
        //NOTE - feture will be title on user message
        const title = await messageTitleGenerator(message)
        //ANCHOR - create chat
        const chat =await chatModel.create({
            user: req.user.id,
            title: title
        })
        //ANCHOR - send message to ai
        const response = await chatWithMistralAiModel({ message })
        //TODO save in the databse
        
        const userMessage=await messageModel.create({
            chat:chat._id,
            content:message,
            role:'user'
        })

        const aiMessage=await messageModel.create({
            chat:chat._id,
            content:response,
            role:'ai'
        })


        res.status(200).json(
            {
                success: true,
                message: 'Message sent',
                AiMessage:aiMessage,
                userMessage:userMessage
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error' });

    }
}

