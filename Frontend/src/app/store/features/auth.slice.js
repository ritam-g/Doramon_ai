import { createSlice } from "@reduxjs/toolkit";

const authSlice=createSlice({
    name:'auth',
    initialState:{
        user:null,
        loading:false,
        error:null
    },
    reducers:{
        setUSer:(state,action)=>{
            state.user=action.payload
        },
        setLoading:(state,action)=>{
            state.loading=action.payload
        },
        setError:(state,action)=>{
            state.error=action.payload
        }
    
    },
})

export const {setUSer,setLoading,setError}=authSlice.actions
export default authSlice.reducer;