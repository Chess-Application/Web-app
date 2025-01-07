import axios from "axios"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL
})

api.interceptors.request(
	(config) => {
		const accessToken = localStorage.getItem(ACCESS_TOKEN)
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`	
		}
	},
	(error) => {
		return Promise.reject(error)
	}
)

export default api