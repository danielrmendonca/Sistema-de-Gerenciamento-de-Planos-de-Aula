// ----------CLIENTE HTTP AXIOS----------
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ----------INTERCEPTOR DE ERRO----------
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Padroniza erro para o frontend lidar uniformemente
    const message =
      error.response?.data?.error ?? error.message ?? 'Erro desconhecido na requisicao';
    return Promise.reject(new Error(message));
  },
);
