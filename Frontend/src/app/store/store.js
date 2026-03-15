import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/auth.slice.js";
export const store =configureStore({
    reducer:{
        auth:authSlice
    }
})