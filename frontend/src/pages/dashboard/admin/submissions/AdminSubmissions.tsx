import { useState, useCallback } from "react";
import { useSubmissionsPaginated } from "@/features/submissions/hooks/useSubmissions";
import Pagination from "@/components/Pagination/Pagination";
import styles from "./AdminSubmissions.module.css";

export default function AdminSubmissions() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const {
    data: submissions,
    meta,
    isLoading,
    page,
    setPage,
    pageSize,
    setPageSize,
  } = useSubmissionsPaginated(debouncedSearch);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    const timeout = setTimeout(() => setDebouncedSearch(value), 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(e.target.value);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Submissions</h1>
        </header>
        <div className={styles.loading}>Loading submissions…</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Submissions</h1>
          <p className={styles.subtitle}>
            Review all team submissions across tournaments
          </p>
        </div>
      </header>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by team name, task name, or GitHub URL..."
          className={styles.searchInput}
          value={search}
          onChange={handleSearchInput}
        />
      </div>

      {submissions.length === 0 ? (
        <div className={styles.empty}>No submissions found</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Task</th>
                  <th>Submitted</th>
                  <th>GitHub</th>
                  <th>Video</th>
                  <th>Evaluations</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const totalScore = sub.assignments.reduce((sum, a) => {
                    const evalScore = a.evaluations.reduce(
                      (eSum, e) => eSum + e.scores,
                      0
                    );
                    return sum + evalScore;
                  }, 0);

                  const evalCount = sub.assignments.reduce(
                    (sum, a) => sum + a.evaluations.length,
                    0
                  );

                  return (
                    <tr key={sub.id}>
                      <td className={styles.cellName}>{sub.team.name}</td>
                      <td>{sub.task.name}</td>
                      <td>
                        {new Date(sub.created_on).toLocaleDateString()}
                      </td>
                      <td>
                        <a
                          href={sub.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        >
                          GitHub
                        </a>
                      </td>
                      <td>
                        <a
                          href={sub.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        >
                          Video
                        </a>
                      </td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            evalCount > 0
                              ? styles.statusEvaluated
                              : styles.statusPending
                          }`}
                        >
                          {evalCount > 0
                            ? `${evalCount} evaluation${
                                evalCount !== 1 ? "s" : ""
                              }`
                            : "Pending"}
                        </span>
                      </td>
                      <td>
                        {evalCount > 0 ? (
                          <span className={styles.score}>
                            {totalScore.toFixed(1)}
                          </span>
                        ) : (
                          <span className={styles.scorePending}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {meta && (
            <Pagination
              page={page}
              totalPages={meta.pages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={meta.total}
            />
          )}
        </>
      )}
    </div>
  );
}