import axios from "axios";

export interface LoginResponse {
  token: string;
  user: { userId: string; role: string; login: string };
}

export async function loginRequest(login: string, password: string) {
  const resp = await axios.post<LoginResponse>("/api/auth/login", {
    login,
    password
  });
  return resp.data;
}

export async function meRequest() {
  const resp = await axios.get<{ user: { userId: string; role: string; login: string } }>("/api/auth/me");
  return resp.data.user;
}
