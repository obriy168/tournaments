import { useState, useCallback } from "react";
import { useTournamentsPaginated } from "@/features/Tournaments/hooks/useTournaments";
import {
  useDeleteTournament,
  useUpdateTournamentStatus,
} from "@/features/admin/hooks/useTournamentMutations";
import TournamentFormModal from "@/features/admin/components/TournamentFormModal/TournamentFormModal";
import Pagination from "@/components/Pagination/Pagination";
import type { Tournament } from "@/services/api";
import { useTranslation } from "react-i18next";
import styles from "./AdminTournaments.module.css";

type FilterStatus = "All" | Tournament["status"];

export default function AdminTournaments() {
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(
    null,
  );
  const { t } = useTranslation();

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

  const filterLabels: Record<FilterStatus, string> = {
    All: t("mainpage.tournaments.filters.all"),
    Draft: t("mainpage.tournaments.status.draft"),
    Registration: t("mainpage.tournaments.status.registration"),
    Running: t("mainpage.tournaments.status.running"),
    Finished: t("mainpage.tournaments.status.finished"),
  };

  const handleFilterChange = useCallback(
    (f: FilterStatus) => {
      setFilter(f);
      setPage(1);
    },
    [setPage],
  );

  const handleDelete = useCallback(
    (id: number) => {
      if (!window.confirm(t("admin.tournaments.confirmDelete"))) return;
      deleteMutation.mutate(id);
    },
    [deleteMutation, t],
  );

  const handleStatusChange = useCallback(
    (id: number, status: Tournament["status"]) => {
      statusMutation.mutate({ id, status });
    },
    [statusMutation],
  );

  const openEdit = useCallback((tournament: Tournament) => {
    setEditingTournament(tournament);
    setModalOpen(true);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t("admin.tournaments.title")}</h1>
          <p className={styles.subtitle}>{t("admin.tournaments.subtitle")}</p>
        </div>
      </header>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          {(Object.keys(filterLabels) as FilterStatus[]).map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${
                filter === f ? styles.filterBtnActive : ""
              }`}
              onClick={() => handleFilterChange(f)}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder={t("admin.tournaments.filters.search")}
          className={styles.searchInput}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <button className={styles.createBtn} onClick={() => setModalOpen(true)}>
          + {t("admin.tournaments.create")}
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loading}>{t("admin.tournaments.loading")}</div>
      ) : tournaments.length === 0 ? (
        <div className={styles.empty}>{t("admin.tournaments.empty")}</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("admin.tournaments.table.name")}</th>
                  <th>{t("admin.tournaments.table.status")}</th>
                  <th>{t("admin.tournaments.table.registration")}</th>
                  <th>{t("admin.tournaments.table.starts")}</th>
                  <th>{t("admin.tournaments.table.teams")}</th>
                  <th>{t("admin.tournaments.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map((tournament) => (
                  <tr key={tournament.id}>
                    <td>
                      <div className={styles.cellName}>{tournament.name}</div>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${styles[`status${tournament.status}`]}`}
                      >
                        {t(
                          `mainpage.tournaments.status.${tournament.status.toLowerCase()}`,
                        )}
                      </span>
                    </td>
                    <td>
                      {tournament.registration_start_date
                        ? `${new Date(tournament.registration_start_date).toLocaleDateString()} - `
                        : null}
                      {new Date(
                        tournament.registration_end_date,
                      ).toLocaleDateString()}
                    </td>
                    <td>
                      {new Date(tournament.start_date).toLocaleDateString()}
                    </td>
                    <td>{tournament.max_teams}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => openEdit(tournament)}
                          title={t("admin.tournaments.actions.edit")}
                        >
                          {t("admin.tournaments.actions.edit")}
                        </button>
                        <select
                          className={styles.statusSelect}
                          value={tournament.status}
                          onChange={(e) =>
                            handleStatusChange(
                              tournament.id,
                              e.target.value as Tournament["status"],
                            )
                          }
                          title={t("admin.tournaments.actions.changeStatus")}
                        >
                          <option value="Draft">
                            {t("mainpage.tournaments.status.draft")}
                          </option>
                          <option value="Registration">
                            {t("mainpage.tournaments.status.registration")}
                          </option>
                          <option value="Running">
                            {t("mainpage.tournaments.status.running")}
                          </option>
                          <option value="Finished">
                            {t("mainpage.tournaments.status.finished")}
                          </option>
                        </select>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => handleDelete(tournament.id)}
                          title={t("admin.tournaments.actions.delete")}
                        >
                          {t("admin.tournaments.actions.delete")}
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

      {modalOpen && (
        <TournamentFormModal
          tournament={editingTournament}
          onClose={() => {
            setModalOpen(false);
            setEditingTournament(null);
          }}
        />
      )}
    </div>
  );
}