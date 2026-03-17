import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        chats: {},
        isLoading: false,
        error: null,
        //REVIEW - chatid for active chat
        currentChatId: null
    },
    reducers: {
        setChats: (state, action) => {
            state.chats = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        }
    }
})

export const { setChats, setLoading, setError, setCurrentChatId } = chatSlice.actions
export default chatSlice.reducer;

//NOTE - format will be

// chats = {
//     "docker and AWS": {
//         messages: [
//             {
//                 role: "user",
//                 content: "What is docker?"
//             },
//             {
//                 role: "ai",
//                 content: "Docker is a platform that allows developers to automate the deployment of applications inside lightweight, portable containers. It provides an efficient way to package and distribute software, ensuring consistency across different environments."
//             }
//         ],
//         id: "docker and AWS",
//         lastUpdated: "2024-06-20T12:34:56Z",
//     }

// }