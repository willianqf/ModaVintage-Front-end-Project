import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

let globalLogoutHandler: () => void = () => {
  console.error("Logout handler não configurado na instância Axios.");
};

export const setGlobalLogoutHandler = (logoutHandler: () => void) => {
  globalLogoutHandler = logoutHandler;
};

const API_BASE_URL = 'http://192.168.1.5:8080'



const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const { response, config } = error;
    // Assegura que config existe e é do tipo esperado antes de acessar a URL
    const originalRequest = config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // Verifica se é um erro 401 e se originalRequest (config) existe
    if (response?.status === 401 && originalRequest) {
      // Se a URL da requisição original NÃO FOR a de login, trata como token de sessão inválido
      if (originalRequest.url !== '/auth/login') {
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          console.warn('axiosInstance: Token JWT de SESSÃO inválido ou expirado. Deslogando...');
          globalLogoutHandler();
        }
        // Para erros 401 de sessão, resolvemos para evitar erro no chamador após o logout
        return Promise.resolve({ data: { K_custom_interceptor_logout_triggered: true } }); // Retorna algo identificável
      } else {
        // Se for um erro 401 na rota /auth/login, são credenciais inválidas.
        // Propagamos o erro para ser tratado pela tela de Login.
        console.warn('axiosInstance: Erro 401 na rota de login (credenciais inválidas). Propagando erro.');
      }
    }
    // Para todos os outros erros (incluindo 401 de /auth/login), rejeita a promise
    return Promise.reject(error);
  }
);

export default axiosInstance;