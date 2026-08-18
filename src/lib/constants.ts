const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const API = {
  AUTH: {
    LOGIN: `${URL}/auth/login`,
    REGISTER: `${URL}/auth/register`,
    LOGOUT: `${URL}/auth/logout`,
    FORGOT_PASS: `${URL}/auth/forgot-password`,
    RESET_PASS: `${URL}/auth/reset-password`,
    REFRESH_TOKEN: `${URL}/auth/refresh-token`,
    GOOGLE_LOGIN: `${URL}/auth/google`,
    GOOGLE_CALLBACK: `${URL}/auth/google/callback`,
  },
} as const;

export const PUBLIC_ENDPOINTS = [
  API.AUTH.LOGIN,
  API.AUTH.REGISTER,
  API.AUTH.FORGOT_PASS,
  API.AUTH.GOOGLE_LOGIN,
  API.AUTH.GOOGLE_CALLBACK,
];
