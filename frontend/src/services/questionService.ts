
const API_URL = "http://localhost:8080/api/questions";

export interface Question {
  id: number;
  title: string;
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  problemUrl: string | null;
  approach: string | null;
  stuckPoint: string | null;
  pseudocode: string | null;
  codeLanguage: string | null;
  verificationStatus: "NOT_TESTED" | "PASSED" | "FAILED" | "PARTIAL";
  finalCode: string | null;
  timeComplexity: string | null;
  spaceComplexity: string | null;
  notes: string | null;
  dateSolved: string;
  nextReviewDate: string;
  reviewCount: number;
  intervalDays: number;
}

export type QuestionInput = Omit<
  Question,
  "id" | "dateSolved" | "nextReviewDate" | "reviewCount" | "intervalDays"
>;

export type QuestionDetailsInput = Pick<
  Question,
  "title" | "topic" | "difficulty" | "problemUrl" | "dateSolved"
>;

export type QuestionNotesInput = Pick<
  Question,
  "approach" | "stuckPoint" | "pseudocode" | "notes"
>;

export type QuestionCodeInput = Pick<
  Question,
  | "codeLanguage"
  | "verificationStatus"
  | "finalCode"
  | "timeComplexity"
  | "spaceComplexity"
>;

async function request<T>(
  endpoint = "",
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("dsa_token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Your session may have expired. Please log in again.");
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const questionService = {
  getAll: () => request<Question[]>(),

  getDue: () => request<Question[]>("/due"),

  getById: (id: number) => request<Question>(`/${id}`),

  create: (data: QuestionInput) =>
    request<Question>("", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: QuestionInput) =>
    request<Question>(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  updateDetails: (id: number, data: QuestionDetailsInput) =>
    request<Question>(`/${id}/details`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateNotes: (id: number, data: QuestionNotesInput) =>
    request<Question>(`/${id}/notes`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateCode: (id: number, data: QuestionCodeInput) =>
    request<Question>(`/${id}/code`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<void>(`/${id}`, {
      method: "DELETE",
    }),
};
