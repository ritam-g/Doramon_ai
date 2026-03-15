import axios from 'axios'

const api=axios.create({
    baseURL:`http://localhost:5000/api/auth`,
    withCredentials:true
})


export async function loginApi({email,password}) {
    const {data}=await api.post('/login',{email,password})
    return data
}
export async function RegisterApi({username, email, password}) {
    const {data}=await api.post('/register',{username, email, password})
    return data
}

export async function GetMeApi() {
    const {data}=await api.get('/getme')
    return data
}

