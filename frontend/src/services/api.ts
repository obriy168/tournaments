import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30000,
});

declare module "axios" {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

function getPathname(url: string | undefined): string {
  if (!url) return "";
  try {
    const parsed = new URL(url, API_BASE_URL);
    return parsed.pathname;
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}

function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  if (method && method !== "get" && method !== "head") {
    const token = getCsrfToken();
    if (token) {
      config.headers["X-CSRF-Token"] = token;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const pathname = getPathname(originalRequest.url);

      if (
        pathname === "/auth/me" ||
        pathname === "/auth/login" ||
        pathname === "/auth/register"
      ) {
        return Promise.reject(error);
      }

      if (pathname === "/auth/refresh") {
        processQueue(error);
        isRefreshing = false;
        window.dispatchEvent(new CustomEvent("skyline:session-expired"));
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await api.post("/auth/refresh");
          processQueue(null);
          isRefreshing = false;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          isRefreshing = false;
          window.dispatchEvent(new CustomEvent("skyline:session-expired"));
          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(api(originalRequest)),
          reject,
        });
      });
    }

    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "jury" | "participant" | "captain";
}

export interface Tournament {
  id: number;
  name: string;
  description: string;
  status: "Draft" | "Registration" | "Running" | "Finished";
  start_date: string;
  registration_end_date: string;
  registration_start_date?: string;
  min_user_count?: number;
  max_user_count?: number;
  max_teams?: number;
}

export interface Team {
  id: number;
  name: string;
  members?: User[];
}

export interface Task {
  id: number;
  title: string;
  description: string;
  max_score?: number;
}

export interface Submission {
  id: number;
  task_id: number;
  team_id: number;
  file_url?: string;
  status: string;
  created_at: string;
}

export interface Score {
  id: number;
  submission_id: number;
  jury_id: number;
  score: number;
  comment?: string;
}

export interface Requirement {
  id: number;
  task_id: number;
  description: string;
  max_score: number;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface JuryAssignment {
  id: number;
  tournament_id: number;
  user_id: number;
}

export interface Evaluation {
  id: number;
  submission_id: number;
  jury_id: number;
  score: number;
  comment?: string;
}

export interface LeaderboardEntry {
  team_id: number;
  team_name: string;
  total_score: number;
  rank: number;
}

export async function registerUser(data: RegisterData): Promise<{ id: number }> {
  const { data: res } = await api.post("/auth/register", data);
  return res;
}

export async function getTournaments(): Promise<Tournament[]> {
  const { data } = await api.get<Tournament[]>("/tournaments/");
  return data;
}

export async function getTournament(id: number): Promise<Tournament> {
  const { data } = await api.get<Tournament>(`/tournaments/${id}`);
  return data;
}

export async function createTournament(data: Partial<Tournament>): Promise<Tournament> {
  const { data: res } = await api.post<Tournament>("/tournaments/", data);
  return res;
}

export async function updateTournament(id: number, data: Partial<Tournament>): Promise<Tournament> {
  const { data: res } = await api.put<Tournament>(`/tournaments/${id}`, data);
  return res;
}

export async function updateTournamentStatus(id: number, status: Tournament["status"]): Promise<Tournament> {
  const { data: res } = await api.patch<Tournament>(`/tournaments/${id}/status`, { status });
  return res;
}

export async function deleteTournament(id: number): Promise<void> {
  await api.delete(`/tournaments/${id}`);
}

export async function registerTeam(tournamentId: number, teamData: Partial<Team>): Promise<Team> {
  const { data } = await api.post<Team>(`/tournaments/${tournamentId}/teams`, teamData);
  return data;
}

export async function getTeams(tournamentId: number): Promise<Team[]> {
  const { data } = await api.get<Team[]>(`/tournaments/${tournamentId}/teams`);
  return data;
}

export async function getTeam(id: number): Promise<Team> {
  const { data } = await api.get<Team>(`/teams/${id}`);
  return data;
}

export async function updateTeam(id: number, teamData: Partial<Team>): Promise<Team> {
  const { data } = await api.put<Team>(`/teams/${id}`, teamData);
  return data;
}

export async function addTeamMember(teamId: number, userId: number): Promise<void> {
  await api.post(`/teams/${teamId}/members`, { user_id: userId });
}

export async function removeTeamMember(teamId: number, userId: number): Promise<void> {
  await api.delete(`/teams/${teamId}/members/${userId}`);
}

export async function getTasks(tournamentId: number): Promise<Task[]> {
  const { data } = await api.get<Task[]>(`/tournaments/${tournamentId}/tasks`);
  return data;
}

export async function createTask(tournamentId: number, taskData: Partial<Task>): Promise<Task> {
  const { data } = await api.post<Task>(`/tournaments/${tournamentId}/tasks`, taskData);
  return data;
}

export async function getTask(id: number): Promise<Task> {
  const { data } = await api.get<Task>(`/tasks/${id}`);
  return data;
}

export async function updateTask(id: number, taskData: Partial<Task>): Promise<Task> {
  const { data } = await api.put<Task>(`/tasks/${id}`, taskData);
  return data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function createSubmission(taskId: number, submissionData: FormData | object): Promise<Submission> {
  const { data } = await api.post<Submission>(`/tasks/${taskId}/submissions`, submissionData, {
    headers: submissionData instanceof FormData ? undefined : { "Content-Type": "application/json" },
  });
  return data;
}

export async function getTaskSubmissions(taskId: number): Promise<Submission[]> {
  const { data } = await api.get<Submission[]>(`/tasks/${taskId}/submissions`);
  return data;
}

export async function getSubmission(id: number): Promise<Submission> {
  const { data } = await api.get<Submission>(`/submissions/${id}`);
  return data;
}

export async function updateSubmission(id: number, submissionData: Partial<Submission>): Promise<Submission> {
  const { data } = await api.put<Submission>(`/submissions/${id}`, submissionData);
  return data;
}

export async function deleteSubmission(id: number): Promise<void> {
  await api.delete(`/submissions/${id}`);
}

export async function assignJury(tournamentId: number, userId: number): Promise<void> {
  await api.post(`/tournaments/${tournamentId}/jury`, { user_id: userId });
}

export async function assignTaskJury(taskId: number, juryId: number): Promise<void> {
  await api.post(`/tasks/${taskId}/assign-jury`, { jury_id: juryId });
}

export async function getJuryAssignments(): Promise<JuryAssignment[]> {
  const { data } = await api.get<JuryAssignment[]>("/jury/assignments");
  return data;
}

export async function evaluateSubmission(submissionId: number, evaluation: { score: number; comment?: string }): Promise<void> {
  await api.post(`/submissions/${submissionId}/evaluate`, evaluation);
}

export async function getSubmissionScores(submissionId: number): Promise<Score[]> {
  const { data } = await api.get<Score[]>(`/submissions/${submissionId}/scores`);
  return data;
}

export async function getLeaderboard(tournamentId: number): Promise<LeaderboardEntry[]> {
  const { data } = await api.get<LeaderboardEntry[]>(`/tournaments/${tournamentId}/leaderboard`);
  return data;
}

export async function getRequirements(taskId: number): Promise<Requirement[]> {
  const { data } = await api.get<Requirement[]>(`/tasks/${taskId}/requirements`);
  return data;
}

export async function createRequirement(taskId: number, requirement: Partial<Requirement>): Promise<Requirement> {
  const { data } = await api.post<Requirement>(`/tasks/${taskId}/requirements`, requirement);
  return data;
}

export async function deleteRequirement(id: number): Promise<void> {
  await api.delete(`/requirements/${id}`);
}

export async function getMyTeams(): Promise<Team[]> {
  const { data } = await api.get<Team[]>("/users/me/teams");
  return data;
}

export async function getMySubmissions(): Promise<Submission[]> {
  const { data } = await api.get<Submission[]>("/users/me/submissions");
  return data;
}

export async function getMyEvaluations(): Promise<Evaluation[]> {
  const { data } = await api.get<Evaluation[]>("/users/me/evaluations");
  return data;
}