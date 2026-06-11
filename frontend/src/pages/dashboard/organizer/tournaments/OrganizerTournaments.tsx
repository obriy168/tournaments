import { useState, useCallback } from "react";
import { useTournamentsPaginated } from "@/features/Tournaments/hooks/useTournaments";
import {
  useDeleteTournament,
  useUpdateTournamentStatus,
} from "@/features/admin/hooks/useTournamentMutations";
import TournamentFormModal from "@/features/organizer/components/TournamentFormModal/TournamentFormModal";
import Pagination from "@/components/Pagination/Pagination";
import type { Tournament } from "@/services/api";
import styles from "./OrganizerTournaments.module.css";

type FilterStatus = "All" | Tournament["status"];

export default function OrganizerTournaments() {
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);

  const statusFilter = filter === "All" ? undefined : filter;

  const {
    data: tournaments,
    meta,
    isLoading,
    page,
    setPage,
    pageSize,
    setPageSize,
  } = useTournamentsPaginated(search, statusFilter);

  const deleteMutation = useDeleteTournament();
  const statusMutation = useUpdateTournamentStatus();

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, [setPage]);

  const handleFilterChange = useCallback((f: FilterStatus) => {
    setFilter(f);
    setPage(1);
  }, [setPage]);

  const handleDelete = useCallback((id: number) => {
    if (!window.confirm("Are you sure you want to delete this tournament?")) return;
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const handleStatusChange = useCallback((id: number, status: Tournament["status"]) => {
    statusMutation.mutate({ id, status });
  }, [statusMutation]);

  const openEdit = useCallback((t: Tournament) => {
    setEditingTournament(t);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingTournament(null);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tournaments</h1>
          <p className={styles.subtitle}>Manage your tournaments</p>
        </div>
      </header>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          {(["All", "Draft", "Registration", "Running", "Finished"] as FilterStatus[]).map(
            (f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${
                  filter === f ? styles.filterBtnActive : ""
                }`}
                onClick={() => handleFilterChange(f)}
              >
                {f}
              </button>
            )
          )}
        </div>
        <input
          type="text"
          placeholder="Search tournaments..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading tournaments…</div>
      ) : tournaments.length === 0 ? (
        <div className={styles.empty}>No tournaments found</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Registration</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className={styles.cellName}>{t.name}</div>
                      <div className={styles.cellDesc}>{t.description}</div>
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles[`status${t.status}`]}`}>
                        {t.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {t.registration_start_date && 
                          `${new Date(t.registration_start_date).toLocaleDateString()} — `}
                        {new Date(t.registration_end_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {t.max_teams ? t.max_teams : "∞"}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => openEdit(t)}
                        >
                          Edit
                        </button>
                        <select
                          className={styles.statusSelect}
                          value={t.status}
                          onChange={(e) =>
                            handleStatusChange(t.id, e.target.value as Tournament["status"])
                          }
                        >
                          <option value="Draft">Draft</option>
                          <option value="Registration">Registration</option>
                          <option value="Running">Running</option>
                          <option value="Finished">Finished</option>
                        </select>
                        {t.status === "Draft" && (
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                            onClick={() => handleDelete(t.id)}
                          >
                            Delete
                          </button>
                        )}
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

      {modalOpen && (
        <TournamentFormModal
          tournament={editingTournament}
          onClose={closeModal}
        />
      )}
    </div>
  );
}