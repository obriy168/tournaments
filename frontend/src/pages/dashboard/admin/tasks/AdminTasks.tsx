import { useState, useMemo, useCallback } from "react";
import { usePagination } from "@/features/Pagination/hooks/usePagination";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import {
  useTasksByTournament,
  useDeleteTask,
  useUpdateTaskStatus,
} from "@/features/admin/hooks/useTasks";
import TaskFormModal from "@/features/admin/components/TaskFormModal/TaskFormModal";
import type { Task } from "@/services/api";
import styles from "./AdminTasks.module.css";

type FilterStatus = "All" | Task["status"];

const STATUS_TRANSITIONS: Record<Task["status"], Task["status"] | null> = {
  Draft: "Active",
  Active: "SubmissionClosed",
  SubmissionClosed: "Evaluated",
  Evaluated: null,
};

export default function AdminTasks() {
  const { data: tournaments, isLoading: tournamentsLoading } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | "all">("all");
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks, isLoading } = useTasksByTournament(
    selectedTournament !== "all" ? Number(selectedTournament) : null
  );

  const deleteMutation = useDeleteTask();
  const statusMutation = useUpdateTaskStatus();

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    let res = [...tasks];

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

    res.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

    return res;
  }, [tasks, filter, search]);

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
  } = usePagination({ data: filteredTasks, defaultPerPage: 15, maxPerPage: 15 });

  const handleDelete = useCallback((id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete task "${name}"?`)) return;
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const handleStatusChange = useCallback((id: number, status: Task["status"]) => {
    statusMutation.mutate({ id, status });
  }, [statusMutation]);

  const getNextStatus = useCallback((current: Task["status"]): Task["status"] | null => {
    return STATUS_TRANSITIONS[current] ?? null;
  }, []);

  const openCreate = useCallback(() => {
    setEditingTask(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((t: Task) => {
    setEditingTask(t);
    setModalOpen(true);
  }, []);

  const selectedTournamentName = useMemo(() => {
    if (selectedTournament === "all") return null;
    return tournaments?.find(t => t.id === Number(selectedTournament))?.name;
  }, [selectedTournament, tournaments]);

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
          <h1 className={styles.title}>Tasks</h1>
          <p className={styles.subtitle}>
            {selectedTournament === "all" 
              ? "Select a tournament to manage tasks" 
              : `Manage tasks for ${selectedTournamentName || "selected tournament"}`}
          </p>
        </div>
        <button 
          className={styles.createBtn} 
          onClick={openCreate} 
          disabled={selectedTournament === "all"}
        >
          + New Task
        </button>
      </header>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <select
            className={styles.select}
            value={selectedTournament}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedTournament(value === "all" ? "all" : Number(value));
              setSearch("");
              setFilter("All");
              resetPage();
            }}
          >
            <option value="all">Select a tournament</option>
            {(tournaments || []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {selectedTournament !== "all" && (
          <>
            <div className={styles.filterGroup}>
              {(["All", "Draft", "Active", "SubmissionClosed", "Evaluated"] as FilterStatus[]).map(
                (f) => (
                  <button
                    key={f}
                    className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
                    onClick={() => {
                      setFilter(f);
                      resetPage();
                    }}
                  >
                    {f === "SubmissionClosed" ? "Closed" : f}
                  </button>
                )
              )}
            </div>

            <input
              type="text"
              placeholder="Search tasks..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
            />
          </>
        )}
      </div>

      {selectedTournament === "all" ? (
        <div className={styles.empty}>
          Please select a tournament to view and manage tasks
        </div>
      ) : tournamentsLoading || isLoading ? (
        <div className={styles.loading}>Loading tasks…</div>
      ) : paginatedData.length === 0 ? (
        <div className={styles.empty}>No tasks found</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Period</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((t) => {
                  const nextStatus = getNextStatus(t.status);
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className={styles.cellName}>{t.name}</div>
                        <div className={styles.cellDesc}>{t.description}</div>
                      </td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            styles[`status${t.status}`]
                          }`}
                        >
                          {t.status === "SubmissionClosed" ? "Closed" : t.status}
                        </span>
                      </td>
                      <td>
                        {new Date(t.start_date).toLocaleDateString()} —{" "}
                        {new Date(t.end_date).toLocaleDateString()}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => openEdit(t)}
                            title="Edit"
                          >
                            Edit
                          </button>
                          {nextStatus && (
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
                              onClick={() =>
                                handleStatusChange(t.id, nextStatus)
                              }
                              disabled={statusMutation.isPending}
                              title={`Change to ${nextStatus}`}
                            >
                              {nextStatus === "Active"
                                ? "Start"
                                : nextStatus === "SubmissionClosed"
                                ? "Close"
                                : "Finish"}
                            </button>
                          )}
                          {t.status === "Draft" && (
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                              onClick={() => handleDelete(t.id, t.name)}
                              disabled={deleteMutation.isPending}
                              title="Delete"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {modalOpen && selectedTournament !== "all" && (
        <TaskFormModal
          task={editingTask}
          defaultTournamentId={Number(selectedTournament)}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}