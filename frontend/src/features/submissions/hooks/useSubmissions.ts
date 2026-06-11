import { usePagination } from "@/hooks/usePagination";
import {
  getSubmissionsPaginated,
  searchSubmissions,
  type SubmissionDetailedResponse,
} from "@/services/api";

export const submissionsKeys = {
  all: ["submissions"] as const,
  paginated: (page: number, limit: number, search?: string) =>
    [...submissionsKeys.all, "paginated", page, limit, search] as const,
};

export function useSubmissionsPaginated(searchText?: string) {
  return usePagination<SubmissionDetailedResponse>({
    queryKey: submissionsKeys.all,
    fetchFn: (params) =>
      searchText?.trim()
        ? searchSubmissions(searchText, params)
        : getSubmissionsPaginated(params),
    enabled: true,
  });
}