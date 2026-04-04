import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

/**
 * Auth API client
 *
 * Why this exists:
 * - Keeps all authentication requests in one place.
 * - Reuses the same backend base URL for login, register, get-me, and logout.
 * - Sends cookies automatically because the backend auth depends on them.
 */
const authApi = axios.create({
    baseURL: `${API_BASE_URL}/auth`,
    withCredentials: true
})

/**
 * User API client
 *
 * Why this is separate from authApi:
 * - Profile updates belong to the `/api/users` backend routes.
 * - Keeping a dedicated client makes the route ownership obvious for future developers.
 * - It still follows the same axios + withCredentials pattern used in the project.
 */
const userApi = axios.create({
    baseURL: `${API_BASE_URL}/users`,
    withCredentials: true
})

export async function loginApi({ email, password }) {
    const { data } = await authApi.post('/login', { email, password })
    return data
}

export async function RegisterApi({ username, email, password }) {
    const { data } = await authApi.post('/register', { username, email, password })
    return data
}

export async function GetMeApi() {
    const { data } = await authApi.get('/getme')
    return data
}

export async function logoutApi() {
    const { data } = await authApi.post('/logout')
    return data
}

/**
 * Update the currently logged-in user's profile.
 *
 * Backend contract:
 * PATCH /api/users/profile
 *
 * Expected payload:
 * {
 *   name?: string,
 *   email?: string
 * }
 *
 * Response shape:
 * {
 *   success: true,
 *   user: { ...updatedUser }
 * }
 */
export async function updateUserProfileApi(payload) {
    const { data } = await userApi.patch('/profile', payload)
    return data
}

