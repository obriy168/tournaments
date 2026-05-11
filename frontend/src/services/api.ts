import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 30000,
});

function getPathname(url: string | undefined): string {
  if (!url) return "";
  try {
    const parsed = new URL(url, API_BASE_URL);
    return parsed.pathname;
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401) {
      const pathname = getPathname(originalRequest.url);
      if (
        pathname === "/auth/me" ||
        pathname === "/auth/login" ||
        pathname === "/auth/register"
      ) {
        return Promise.reject(error);
      }
      window.dispatchEvent(new CustomEvent("skyline:session-expired"));
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "jury" | "participant" | "captain" | "organizer";
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
  tournament_id: number | null;
  name: string;
  city: string;
  organization: string;
}

export interface CreateTeamData {
  tournament_id: number;
  name: string;
  city: string;
  organization: string;
}

export interface Task {
  id: number;
  tournament_id: number;
  name: string;
  description: string;
  specifications: string;
  start_date: string;
  end_date: string;
  status: "Draft" | "Active" | "SubmissionClosed" | "Evaluated";
}

export interface Submission {
  id: number;
  team_id: number;
  task_id: number;
  created_on: string;
  github_url: string;
  video_url: string;
  live_demo_url?: string;
  description?: string;
}

export interface Score {
  id: number;
  submission_id: number;
  jury_id: number;
  score: number;
  comment?: string;
}

export interface RequirementGroup {
  id: number;
  name: string;
  task_id: number;
}

export interface Requirement {
  id: number;
  requirement_group_id: number;
  name: string;
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
  assignment_id: number;
  requirement_id: number;
  scores: number;
  comment?: string;
}

export interface LeaderboardEntry {
  team_id: number;
  team_name: string;
  total_score: number;
  rank: number;
}

export interface TeamMemberFull {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_lead: boolean;
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

export async function createTeam(data: CreateTeamData): Promise<Team> {
  const { data: res } = await api.post<Team>("/teams/", data);
  return res;
}

export async function getTeam(id: number): Promise<Team> {
  const { data } = await api.get<Team>(`/teams/${id}`);
  return data;
}

export async function updateTeam(id: number, teamData: Partial<Team>): Promise<Team> {
  const { data } = await api.put<Team>(`/teams/${id}`, teamData);
  return data;
}

export async function deleteTeam(id: number): Promise<void> {
  await api.delete(`/teams/${id}`);
}

export async function getTeamsByTournament(tournamentId: number): Promise<Team[]> {
  const { data } = await api.get<Team[]>(`/teams/tournament/${tournamentId}`);
  return data;
}

export async function getMyTeams(userId: number): Promise<Team[]> {
  const { data } = await api.get<Team[]>(`/users_team/${userId}`);
  return data;
}

export async function addUserToTeam(teamId: number, userId: number): Promise<void> {
  await api.post(`/users_team/${teamId}/${userId}`);
}

export async function changeTeamLeader(teamId: number, userId: number): Promise<void> {
  await api.patch(`/users_team/change_leader/${teamId}/${userId}`);
}

export async function removeUserFromTeam(userTeamId: number): Promise<void> {
  await api.delete(`/users_team/${userTeamId}`);
}

export async function removeUserFromTeamByIds(userId: number, teamId: number): Promise<void> {
  await api.delete(`/users_team/${userId}/${teamId}`);
}

export async function isUserLeader(teamId: number, userId: number): Promise<boolean> {
  const { data } = await api.get(`/users_team/is_leader/${teamId}/${userId}`);
  return data;
}

export async function getTeamMembers(teamId: number): Promise<TeamMemberFull[]> {
  const { data } = await api.get<TeamMemberFull[]>(`/users_team/${teamId}/members`);
  return data;
}

export async function getTasks(tournamentId: number): Promise<Task[]> {
  const { data } = await api.get<Task[]>(`/tasks/tournament/${tournamentId}`);
  return data;
}

export async function createTask(taskData: Partial<Task>): Promise<Task> {
  const { data } = await api.post<Task>("/tasks/", taskData);
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

export async function updateTaskStatus(id: number, status: Task["status"]): Promise<Task> {
  const { data } = await api.patch<Task>(`/tasks/${id}/status`, { status });
  return data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function createSubmission(submissionData: Partial<Submission>): Promise<Submission> {
  const { data } = await api.post<Submission>("/submissions/", submissionData);
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

export async function getSubmissionsByTask(taskId: number): Promise<Submission[]> {
  const { data } = await api.get<Submission[]>(`/submissions/task/${taskId}`);
  return data;
}

export async function createEvaluation(evaluation: { assignment_id: number; requirement_id: number; scores: number; comment?: string }): Promise<Evaluation> {
  const { data } = await api.post<Evaluation>("/evaluations/", evaluation);
  return data;
}

export async function getEvaluation(id: number): Promise<Evaluation> {
  const { data } = await api.get<Evaluation>(`/evaluations/${id}`);
  return data;
}

export async function getEvaluationsByTask(taskId: number): Promise<Evaluation[]> {
  const { data } = await api.get<Evaluation[]>(`/evaluations/task/${taskId}`);
  return data;
}

export async function updateEvaluation(id: number, evaluation: Partial<Evaluation>): Promise<Evaluation> {
  const { data } = await api.put<Evaluation>(`/evaluations/${id}`, evaluation);
  return data;
}

export async function getRequirements(taskId: number): Promise<Requirement[]> {
  const { data } = await api.get<Requirement[]>(`/requirements/task/${taskId}`);
  return data;
}

export async function createRequirement(requirement: Partial<Requirement>): Promise<Requirement> {
  const { data } = await api.post<Requirement>("/requirements/", requirement);
  return data;
}

export async function deleteRequirements(ids: number[]): Promise<void> {
  await api.delete("/requirements/", { params: { ids } });
}

export async function getRequirementGroups(taskId: number): Promise<RequirementGroup[]> {
  const { data } = await api.get<RequirementGroup[]>(`/requirement_groups/${taskId}`);
  return data;
}

export async function createRequirementGroup(group: Partial<RequirementGroup>): Promise<RequirementGroup> {
  const { data } = await api.post<RequirementGroup>("/requirement_groups/", group);
  return data;
}

export async function deleteRequirementGroup(id: number): Promise<void> {
  await api.delete(`/requirement_groups/${id}`);
}

export async function getJuryAssignments(evaluatorId: number): Promise<JuryAssignment[]> {
  const { data } = await api.get<JuryAssignment[]>(`/task_assignment/evaluator/${evaluatorId}`);
  return data;
}

export async function autoAssignJury(taskId: number, minJury: number): Promise<void> {
  await api.post(`/task_assignment/auto-assign/${taskId}/${minJury}`);
}

export async function getUserRole(userId: number, tournamentId: number): Promise<{ role: string }> {
  const { data } = await api.get(`/user_role/${userId}/${tournamentId}`);
  return data;
}

export async function setUserRole(userId: number, tournamentId: number, role: string): Promise<void> {
  await api.post("/user_role/", { user_id: userId, tournament_id: tournamentId, role });
}

export async function getUsersByRole(roleName: string, tournamentId: number): Promise<User[]> {
  const { data } = await api.get<User[]>(`/user_role/role/${roleName}/${tournamentId}`);
  return data;
}

export async function getAllUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users/");
  return data;
}

export async function registerTeamForTournament(teamId: number, tournamentId: number): Promise<Team> {
  const { data } = await api.patch<Team>(`/teams/${teamId}/tournament`, { tournament_id: tournamentId });
  return data;
}