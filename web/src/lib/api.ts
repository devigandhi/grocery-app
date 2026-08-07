import axios, { type AxiosError } from "axios";

export interface NestErrorShape {
  statusCode?: number;
  message: string;
  error?: string;
}

// normalize NestJS error shape { statusCode, message, error }
export function normalizeApiError(err: AxiosError): NestErrorShape {
  return (err.response?.data as NestErrorShape | undefined) ?? {
    message: err.message,
  };
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => Promise.reject(normalizeApiError(err)),
);
