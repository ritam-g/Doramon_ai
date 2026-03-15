import { useDispatch } from "react-redux";
import { GetMeApi, loginApi, RegisterApi } from "../services/auth.api";
import { setError, setLoading, setUser } from "../../../app/store/features/auth.slice";

import { useCallback } from 'react'
export function useAuth() {
    const dispatch = useDispatch()
    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true))
            const data = await loginApi({ email, password })
            dispatch(setUser(data.user))

        } catch (error) {
            dispatch(setError(error.message))
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function handleRegister({ username, email, password }) {
        try {
            dispatch(setLoading(true))
            const data = await RegisterApi({ username, email, password })
        } catch (error) {
            dispatch(setError(error.message))
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            const data = await GetMeApi()
            dispatch(setUser(data.user))
            
        } catch (error) {
            dispatch(setUser(null))
            dispatch(setError(error.message))
        } finally {
            dispatch(setLoading(false))
        }
    }

    return {
        handleLogin,
        handleRegister,
        handleGetMe
    }
}
