import { useState, useCallback } from "react";
import { useTeamsPaginated } from "@/features/teams/hooks/useTeams";
import { useAuthStore } from "@/features/auth/store/authStore";
import TeamViewModal from "@/features/organizer/components/TeamViewModel/TeamViewModal";
import Pagination from "@/components/Pagination/Pagination";
import styles from "./OrganizerTeams.module.css";

export default function OrganizerTeams() {
  const activeTournamentId = useAuthStore((s) => s.activeTournamentId);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewingTeamId, setViewingTeamId] = useState<number | null>(null);

  const {
    data: teams,
    meta,
    isLoading,
    page,
    setPage,
    pageSize,
    setPageSize,
  } = useTeamsPaginated(debouncedSearch, activeTournamentId);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    const timeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [setPage]);

  if (!activeTournamentId) {
    return <div className={styles.empty}>Please select a tournament first.</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Teams</h1>
          <p className={styles.subtitle}>Registered teams for this tournament</p>
        </div>
        <input
          type="text"
          placeholder="Search teams..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </header>

      {isLoading ? (
        <div className={styles.loading}>Loading teams…</div>
      ) : teams.length === 0 ? (
        <div className={styles.empty}>No teams found for this tournament.</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>City</th>
                  <th>Organization</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id}>
                    <td className={styles.cellName}>{team.name}</td>
                    <td>{team.city}</td>
                    <td>{team.organization}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          className={styles.actionBtn}
                          onClick={() => setViewingTeamId(team.id)}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      <TeamViewModal
        teamId={viewingTeamId}
        onClose={() => setViewingTeamId(null)}
      />
    </div>
  );
}