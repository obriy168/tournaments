import { useState } from "react";
import { useTeamsPaginated } from "@/features/teams/hooks/useTeams";
import { useDeleteTeam } from "@/features/teams/hooks/useDeleteTeam";
import TeamViewModal from "@/features/admin/components/TeamViewModal/TeamViewModal";
import Pagination from "@/components/Pagination/Pagination";
import styles from "./AdminTeams.module.css";

export default function AdminTeams() {
  const [search, setSearch] = useState("");
  const [viewingTeamId, setViewingTeamId] = useState<number | null>(null);
  const deleteMutation = useDeleteTeam();

  const {
    data: teams,
    meta,
    isLoading,
    page,
    setPage,
    pageSize,
    setPageSize,
  } = useTeamsPaginated(search);

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Delete team "${name}"?`)) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Teams</h1>
          <p className={styles.subtitle}>All registered teams</p>
        </div>
        <input
          type="text"
          placeholder="Search teams..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </header>

      {isLoading ? (
        <div className={styles.loading}>Loading teams…</div>
      ) : teams.length === 0 ? (
        <div className={styles.empty}>No teams found</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>City</th>
                  <th>Organization</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
                  <tr key={team.id}>
                    <td className={styles.cellName}>{team.name}</td>
                    <td>{team.city}</td>
                    <td>{team.organization}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => setViewingTeamId(team.id)}
                        >
                          View
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => handleDelete(team.id, team.name)}
                          disabled={
                            deleteMutation.isPending &&
                            deleteMutation.variables === team.id
                          }
                        >
                          {deleteMutation.isPending &&
                          deleteMutation.variables === team.id
                            ? "Deleting…"
                            : "Delete"}
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