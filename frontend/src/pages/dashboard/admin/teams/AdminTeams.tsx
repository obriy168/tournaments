import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "@/features/Pagination/hooks/usePagination";
import { getTeams, getTournament } from "@/services/api";
import { useDeleteTeam } from "@/features/teams/hooks/useDeleteTeam";
import TeamViewModal from "@/features/admin/components/TeamViewModal/TeamViewModal";
import styles from "./AdminTeams.module.css";

export default function AdminTeams() {
  const [search, setSearch] = useState("");
  const [viewingTeamId, setViewingTeamId] = useState<number | null>(null);
  const deleteMutation = useDeleteTeam();

  const { data: teams, isLoading } = useQuery({
    queryKey: ["all-teams"],
    queryFn: getTeams,
  });

  const tournamentIds = useMemo(
    () => [...new Set((teams || []).map((t) => t.tournament_id).filter(Boolean))],
    [teams]
  );

  const tournamentQueries = useQuery({
    queryKey: ["tournament-names", tournamentIds],
    queryFn: async () => {
      const results = await Promise.all(
        tournamentIds.map((id) => getTournament(id!))
      );
      return Object.fromEntries(results.map((t) => [t.id, t.name]));
    },
    enabled: tournamentIds.length > 0,
  });

  const tournamentNames = tournamentQueries.data || {};

  const filtered = useMemo(() => {
    if (!teams) return [];
    let res = [...teams];
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter((t) => t.name.toLowerCase().includes(q));
    }
    return res;
  }, [teams, search]);

  const {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedData,
    goToPage,
    setItemsPerPage,
    resetPage,
  } = usePagination({ data: filtered, defaultPerPage: 15, maxPerPage: 15 });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    resetPage();
  };

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete team "${name}"?`)) return;
    deleteMutation.mutate(id);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
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
          onChange={handleSearchChange}
        />
      </header>

      {isLoading ? (
        <div className={styles.loading}>Loading teams…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No teams found</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Tournament</th>
                  <th>City</th>
                  <th>Organization</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((team) => (
                  <tr key={team.id}>
                    <td className={styles.cellName}>{team.name}</td>
                    <td>
                      {team.tournament_id
                        ? tournamentNames[team.tournament_id] || `Tournament #${team.tournament_id}`
                        : "Not registered"}
                    </td>
                    <td>{team.city}</td>
                    <td>{team.organization}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => setViewingTeamId(team.id)}
                          title="View team details"
                        >
                          View
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => handleDelete(team.id, team.name)}
                          disabled={deleteMutation.isPending && deleteMutation.variables === team.id}
                          title="Delete team"
                        >
                          {deleteMutation.isPending && deleteMutation.variables === team.id
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

          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Showing <b>{startIndex + 1}</b>–<b>{endIndex}</b> of <b>{totalItems}</b>
              <select
                className={styles.perPageSelect}
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={15}>15 / page</option>
              </select>
            </div>

            <div className={styles.paginationControls}>
              <button
                className={styles.pageBtn}
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                ← Prev
              </button>

              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className={styles.pageDots}>…</span>
                ) : (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${
                      currentPage === p ? styles.pageBtnActive : ""
                    }`}
                    onClick={() => goToPage(p as number)}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className={styles.pageBtn}
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}

      <TeamViewModal
        teamId={viewingTeamId}
        onClose={() => setViewingTeamId(null)}
      />
    </div>
  );
}