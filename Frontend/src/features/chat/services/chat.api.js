import axios from 'axios'
import { API_BASE_URL } from '../../../app/config/env'

// ===== API Client =====
// Keep one axios instance so every chat request shares the same base URL and cookies.
const api = axios.create({
    baseURL: `${API_BASE_URL}/chats`,
    withCredentials: true
})

// ===== Chat Requests =====
/**
 * @description Send message to AI
 * @route POST /api/chats/message
 * @access private
 */
export async function sendMessage({ message, chatId, file }) {
    // If there is a file attached, use FormData so multer can handle it.
    if (file) {
        const formData = new FormData();
        formData.append('message', message);
        if (chatId) formData.append('chatId', chatId);
        formData.append('file', file);

        const { data } = await api.post('/message', formData);
        return data;
    }

    // `chatId` is optional: no id means start a new chat on the backend.
    const { data } = await api.post('/message', { message, chatId })
    return data
}

/**
 * @description Get message
 * @route GET /api/chats/:chatId
 * @access private
 */
export async function getMessage({ chatId }) {
    const { data } = await api.get(`/${chatId}`)
    return data
}

/**
 * @description Delete message
 * @route DELETE /api/chats/delete
 * @access private
 */
export async function deleteMessage({ chatId }) {
    // axios.delete expects payload under `data`.
    const { data } = await api.delete('/delete', { data: { chatId } })
    return data
}

/**
 * @description Get chats
 * @route GET /api/chats
 * @access private
 */
export async function getChat() {
    const { data } = await api.get('/')
    return data
}
