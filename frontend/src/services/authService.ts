
const API_URL = "http://localhost:8080/api/auth";

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  identifier: string;
  password: string;
}

async function request<T>(
  endpoint: string,
  data: RegisterData | LoginData,
): Promise<T> {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export const authService = {
  register: (data: RegisterData) =>
    request<AuthResponse>("register", data),

  login: (data: LoginData) =>
    request<AuthResponse>("login", data),

  saveSession: (auth: AuthResponse) => {
    localStorage.setItem("dsa_token", auth.token);
    localStorage.setItem("dsa_username", auth.username);
    localStorage.setItem("dsa_email", auth.email);
  },

  logout: () => {
    localStorage.removeItem("dsa_token");
    localStorage.removeItem("dsa_username");
    localStorage.removeItem("dsa_email");
  },

  isLoggedIn: () => Boolean(localStorage.getItem("dsa_token")),
};
