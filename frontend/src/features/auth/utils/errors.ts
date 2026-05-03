import axios from "axios";

export function getAuthErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED") {
      return "Unable to connect to server. Please check your internet connection.";
    }
    if (err.response?.status === 401) {
      return err.response.data?.detail || "Invalid email or password.";
    }
    if (err.response?.status === 403) {
      return err.response.data?.detail || "Access denied.";
    }
    if (err.response?.status === 409) {
      return err.response.data?.detail || "This email is already registered.";
    }
    if (err.response?.status === 422) {
      return err.response.data?.detail || "Invalid input data.";
    }
    if (err.response?.status && err.response.status >= 500) {
      return "Server error. Please try again later.";
    }
    return err.response?.data?.detail || "Request failed. Please try again.";
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred.";
}