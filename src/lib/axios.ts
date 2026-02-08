import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

const BASE_URL = import.meta.env.VITE_BACKEND_URL

if (!BASE_URL) {
  throw new Error('VITE_BACKEND_URL is not defined')
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  withCredentials: true
})

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || error.message || 'An error occurred'

      switch (status) {
        case 401:
          console.error('Unauthorized: Token không hợp lệ hoặc đã hết hạn')
          Cookies.remove('accessToken')
          window.location.href = '/'
          break
        case 404:
          console.error('Not Found: Resource không tồn tại')
          break
        case 429:
          console.error('Too Many Requests: Vượt quá rate limit')
          break
        case 500:
        case 502:
        case 503:
          console.error('Server Error: Lỗi từ phía server')
          break
      }

      return Promise.reject({
        status,
        message,
        data: error.response.data
      })
    } else if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra internet.'
      })
    } else {
      return Promise.reject({
        status: -1,
        message: error.message
      })
    }
  }
)

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) => axiosInstance.get<T>(url, config),

  post: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(url, data, config),

  put: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) => axiosInstance.put<T>(url, data, config),

  patch: <T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig) =>
    axiosInstance.patch<T>(url, data, config),

  delete: <T>(url: string, config?: AxiosRequestConfig) => axiosInstance.delete<T>(url, config)
}

export default axiosInstance
