import { apiRequest } from "./queryClient";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export const AUTH_TOKEN_KEY = "healthtrack_auth_token";
export const AUTH_USER_KEY = "healthtrack_auth_user";

export async function registerUser(username: string, email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/register", { username, email, password });
  const data = await response.json();
  
  // Store auth data
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  
  return data;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/login", { email, password });
  const data = await response.json();
  
  // Store auth data
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  
  return data;
}

export async function logoutUser(): Promise<void> {
  // Clear auth data
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  const userJson = localStorage.getItem(AUTH_USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as AuthUser;
  } catch (error) {
    console.error("Error parsing auth user:", error);
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getAuthUser();
}
