import { useState, useMemo } from "react";
import { usePagination } from "@/features/Pagination/hooks/usePagination";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import {
  useDeleteTournament,
  useUpdateTournamentStatus,
} from "@/features/admin/hooks/useTournamentMutations";
import TournamentFormModal from "@/features/admin/components/TournamentFormModal/TournamentFormModal";
import type { Tournament } from "@/services/api";
import styles from "./AdminTournaments.module.css";

type FilterStatus = "All" | Tournament["status"];

export default function AdminTournaments() {
  const { data: tournaments, isLoading, error } = useTournaments();
  const deleteMutation = useDeleteTournament();
  const statusMutation = useUpdateTournamentStatus();

  const [filter, setFilter] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);

  const filtered = useMemo(() => {
    if (!tournaments) return [];
    let res = [...tournaments];

    if (filter !== "All") {
      res = res.filter((t) => t.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    res.sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

    return res;
  }, [tournaments, filter, search]);

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

  const handleFilterChange = (f: FilterStatus) => {
    setFilter(f);
    resetPage();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    resetPage();
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this tournament?")) return;
    deleteMutation.mutate(id);
  };

  const handleStatusChange = (id: number, status: Tournament["status"]) => {
    statusMutation.mutate({ id, status });
  };

  const openCreate = () => {
    setEditingTournament(null);
    setModalOpen(true);
  };

  const openEdit = (t: Tournament) => {
    setEditingTournament(t);
    setModalOpen(true);
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
          <h1 className={styles.title}>Tournaments</h1>
          <p className={styles.subtitle}>Manage all platform tournaments</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate}>
          + New Tournament
        </button>
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
          onChange={handleSearchChange}
        />
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading tournaments…</div>
      ) : error ? (
        <div className={styles.error}>Failed to load tournaments</div>
      ) : filtered.length === 0 ? (
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
                  <th>Starts</th>
                  <th>Teams</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((t) => (
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
                      {t.registration_start_date
                        ? `${new Date(t.registration_start_date).toLocaleDateString()} — `
                        : null}
                      {new Date(t.registration_end_date).toLocaleDateString()}
                    </td>
                    <td>{new Date(t.start_date).toLocaleDateString()}</td>
                    <td>{t.max_teams}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => openEdit(t)}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <select
                          className={styles.statusSelect}
                          value={t.status}
                          onChange={(e) =>
                            handleStatusChange(t.id, e.target.value as Tournament["status"])
                          }
                          title="Change status"
                        >
                          <option value="Draft">Draft</option>
                          <option value="Registration">Registration</option>
                          <option value="Running">Running</option>
                          <option value="Finished">Finished</option>
                        </select>
                        <button
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => handleDelete(t.id)}
                          title="Delete"
                        >
                          Delete
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

      {modalOpen && (
        <TournamentFormModal
          tournament={editingTournament}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}