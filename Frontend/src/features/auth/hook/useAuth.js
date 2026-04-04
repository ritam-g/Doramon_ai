import { useDispatch } from "react-redux";
import {
    GetMeApi,
    loginApi,
    logoutApi,
    RegisterApi,
    updateUserProfileApi,
} from "../services/auth.api";
import { setError, setLoading, setUser } from "../../../app/store/features/auth.slice";

/**
 * Convert axios/backend errors into one readable message for the UI.
 *
 * This prevents every screen from repeating the same `error?.response?.data`
 * lookup logic again and again.
 */
function getErrorMessage(error) {
    return error?.response?.data?.message || error?.message || "Something went wrong";
}

/**
 * Normalize the user object before saving it into Redux.
 *
 * Why this matters:
 * - Different backend responses may return `name`, `fullName`, or `username`.
 * - The existing frontend profile/header/dropdown UI already reads `fullName`
 *   and `username`.
 * - This helper keeps the UI stable even if different auth endpoints return
 *   slightly different field names.
 */
function normalizeUser(user) {
    const resolvedName =
        user?.fullName?.trim() ||
        user?.name?.trim() ||
        user?.username?.trim() ||
        "";

    return {
        ...user,
        fullName: resolvedName,
        name: user?.name?.trim() || resolvedName,
        username: user?.username?.trim() || resolvedName,
    };
}

export function useAuth() {
    const dispatch = useDispatch()

    /**
     * Login flow
     * 1. Show loading state
     * 2. Call login API
     * 3. Normalize the returned user
     * 4. Store the user in Redux
     */
    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))

            const data = await loginApi({ email, password })
            dispatch(setUser(normalizeUser(data.user)))
        } catch (error) {
            dispatch(setError(getErrorMessage(error)))
        } finally {
            dispatch(setLoading(false))
        }
    }

    /**
     * Register flow
     * 1. Show loading state
     * 2. Send registration payload
     * 3. Leave navigation handling to the page component
     */
    async function handleRegister({ username, email, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))

            await RegisterApi({ username, email, password })
        } catch (error) {
            dispatch(setError(getErrorMessage(error)))
        } finally {
            dispatch(setLoading(false))
        }
    }

    /**
     * Session restore flow
     * 1. Ask the backend who is currently logged in
     * 2. Normalize the user data
     * 3. Save it to Redux so protected pages can use it
     */
    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))

            const data = await GetMeApi()
            dispatch(setUser(normalizeUser(data.user)))
        } catch (error) {
            dispatch(setUser(null))
            dispatch(setError(getErrorMessage(error)))
        } finally {
            dispatch(setLoading(false))
        }
    }

    /**
     * Logout flow
     * 1. Clear the backend session cookie
     * 2. Clear the Redux user so protected screens redirect correctly
     */
    async function handleLogout() {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))

            await logoutApi()
        } catch (error) {
            dispatch(setError(getErrorMessage(error)))
        } finally {
            dispatch(setUser(null))
            dispatch(setLoading(false))
        }
    }

    /**
     * Profile update flow
     *
     * Important note:
     * We intentionally do NOT toggle the global auth `loading` flag here,
     * because protected routes use that flag to decide whether the whole app
     * should show a page loader. Profile saving should only show a local button
     * loading state on the profile page, not block the entire app.
     *
     * Flow:
     * 1. Call the protected update profile API.
     * 2. Normalize the returned user object.
     * 3. Sync Redux immediately so header, dropdown, and profile UI refresh.
     * 4. Return the updated user back to the page for local form reset.
     */
    async function handleUpdateProfile(payload) {
        try {
            dispatch(setError(null))

            // Step 1: Send the changed profile fields to the protected backend route.
            const data = await updateUserProfileApi(payload)

            // Step 2: Normalize the saved user shape before syncing Redux state.
            const normalizedUser = normalizeUser(data.user)
            dispatch(setUser(normalizedUser))

            // Step 3: Return the updated user so the profile page can refresh its local form state.
            return normalizedUser
        } catch (error) {
            const message = getErrorMessage(error)
            dispatch(setError(message))
            throw new Error(message)
        }
    }

    return {
        handleLogin,
        handleRegister,
        handleGetMe,
        handleLogout,
        handleUpdateProfile,
    }
}
