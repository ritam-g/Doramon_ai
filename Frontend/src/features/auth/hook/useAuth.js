import { useDispatch } from "react-redux";
import { GetMeApi, loginApi, RegisterApi } from "../services/auth.api";
import { setError, setLoading, setUSer } from "../../../app/store/features/auth.slice";

import { useCallback } from 'react'
export function useAuth() {
    const dispatch = useDispatch()
    async function handelLogin({ email, password }) {
        try {
            dispatch(setLoading(true))
            const data = await loginApi({ email, password })
            dispatch(setUSer(data.user))

        } catch (error) {
            dispatch(setError(error.message))
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function handelRegister({ username, email, password }) {
        try {
            dispatch(setLoading(true))
            const data = await RegisterApi({ username, email, password })
        } catch (error) {
            dispatch(setError(error.message))
        } finally {
            dispatch(setLoading(false))
        }
    }
    async function handelGetMe() {
        try {
            dispatch(setLoading(true))
            const data = await GetMeApi()
            dispatch(setUSer(data.user))

        } catch (error) {
            dispatch(setError(error.message))
        } finally {
            dispatch(setLoading(false))
        }
    }

    return {
        handelLogin,
        handelRegister,
        handelGetMe
    }
}