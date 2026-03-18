import axios from 'axios'

const api = axios.create({
    baseURL: `http://localhost:5000`+`/api/chats`,
    withCredentials: true
})

// TODO: Add your API routes here
/**  
 * @description Send message to AI
 * @route POST /api/chats/message
 * @access private
 */
export async function sendMessage({ message, chatId }) {
    const { data } = await api.post('/message', { message, chatId })
    return data
}
/**  
 * @description Get message
 * @route GET /api/chats
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
    const { data } = await api.delete('/delete', { chatId } )
    return data
    
}
/**  
 * @description Get message
 * @route GET /api/chats
 * @access private
 */
export async function getChat() {
    const { data } = await api.get(`/`)
    return data
    
}