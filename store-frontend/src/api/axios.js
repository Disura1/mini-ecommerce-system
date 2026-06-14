import axios from 'axios'

export const storeApi = axios.create({
    baseURL: 'http://localhost:8080',
})

export const vendorApi = axios.create({
    baseURL: 'http://127.0.0.1:8081',
})

// Attach JWT token to every store API request
storeApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Redirect to login on 401
storeApi.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.clear()
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)