import { useState, useMemo, useCallback } from "react";
import { useTasksByTournament, useTasksPaginated, useDeleteTask, useUpdateTaskStatus, useAutoAssignJury } from "@/features/organizer/hooks/useTasks";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import TaskFormModal from "@/features/organizer/components/TaskFormModal/TaskFormModal";
import Pagination from "@/components/Pagination/Pagination";
import type { Task } from "@/services/api";
import styles from "./OrganizerTasks.module.css";

type FilterStatus = "All" | Task["status"];

const STATUS_TRANSITIONS: Record<Task["status"], Task["status"] | null> = {
  Draft: "Active",
  Active: "SubmissionClosed",
  SubmissionClosed: "Evaluated",
  Evaluated: null,
};

export default function OrganizerTasks() {
  const activeTournamentId = useAuthStore((s) => s.activeTournamentId);
  const { data: tournaments } = useTournaments();
  
  const [selectedTournament, setSelectedTournament] = useState<number | "all">(
    activeTournamentId ?? "all"
  );
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    data: allTasks,
    meta: allMeta,
    isLoading: allLoading,
    page,
    setPage,
    pageSize,
    setPageSize,
  } = useTasksPaginated(
    selectedTournament === "all" ? search : undefined,
    selectedTournament === "all" && filter !== "All" ? filter : undefined
  );

  const { data: tournamentTasks, isLoading: tournamentLoading } = useTasksByTournament(
    selectedTournament !== "all" ? Number(selectedTournament) : null
  );

  const deleteMutation = useDeleteTask();
  const statusMutation = useUpdateTaskStatus();
  const autoAssignMut = useAutoAssignJury();

  const isLoading = selectedTournament === "all" ? allLoading : tournamentLoading;
  
  const rawTasks = useMemo(() => {
    return selectedTournament === "all" ? allTasks : (tournamentTasks || []);
  }, [selectedTournament, allTasks, tournamentTasks]);

  const filteredTasks = useMemo(() => {
    let res = [...rawTasks];

    if (selectedTournament !== "all" && filter !== "All") {
      res = res.filter((t) => t.status === filter);
    }

    if (selectedTournament !== "all" && search.trim()) {
      const q = search.toLowerCase();
      res = res.filter((t) => 
        t.name.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q)
      );
    }

    return res.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  }, [rawTasks, filter, search, selectedTournament]);

  const getNextStatus = (current: Task["status"]): Task["status"] | null => {
    return STATUS_TRANSITIONS[current] ?? null;
  };

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (t: Task) => {
    setEditingTask(t);
    setModalOpen(true);
  };

  const handleAutoAssign = useCallback((taskId: number) => {
    const minJury = window.prompt("Enter minimum number of jury members per submission:", "2");
    if (!minJury) return;
    const num = parseInt(minJury, 10);
    if (isNaN(num) || num < 1) {
      alert("Please enter a valid number");
      return;
    }
    autoAssignMut.mutate({ taskId, minJury: num });
  }, [autoAssignMut]);

  const selectedTournamentName = useMemo(() => {
    if (selectedTournament === "all") return "All Tournaments";
    return tournaments?.find(t => t.id === Number(selectedTournament))?.name || "Selected Tournament";
  }, [selectedTournament, tournaments]);

  const handleTournamentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTournament(value === "all" ? "all" : Number(value));
    setSearch("");
    setFilter("All");
    setPage(1);
  }, [setPage]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tournament Tasks</h1>
          <p className={styles.subtitle}>
            {selectedTournament === "all" 
              ? "Manage all tasks across tournaments" 
              : `Manage tasks for ${selectedTournamentName}`}
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
            onChange={handleTournamentChange}
          >
            <option value="all">All tournaments</option>
            {(tournaments || []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          {(["All", "Draft", "Active", "SubmissionClosed", "Evaluated"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
            >
              {f === "SubmissionClosed" ? "Closed" : f}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search tasks..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading tasks…</div>
      ) : filteredTasks.length === 0 ? (
        <div className={styles.empty}>
          {selectedTournament === "all" 
            ? "No tasks found" 
            : "No tasks found for this tournament."}
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Tournament</th>
                  <th>Status</th>
                  <th>Period</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t) => {
                  const nextStatus = getNextStatus(t.status);
                  const tournamentName = tournaments?.find(tr => tr.id === t.tournament_id)?.name || `Tournament #${t.tournament_id}`;
                  
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className={styles.cellName}>{t.name}</div>
                        <div className={styles.cellDesc}>{t.description}</div>
                      </td>
                      <td>
                        <span className={styles.tournamentTag}>{tournamentName}</span>
                      </td>
                      <td>
                        <span className={`${styles.status} ${styles[`status${t.status}`]}`}>
                          {t.status === "SubmissionClosed" ? "Closed" : t.status}
                        </span>
                      </td>
                      <td>
                        {new Date(t.start_date).toLocaleDateString()} — {new Date(t.end_date).toLocaleDateString()}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.actionBtn} onClick={() => openEdit(t)}>Edit</button>
                          
                          {t.status === "SubmissionClosed" && (
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnWarning}`}
                              onClick={() => handleAutoAssign(t.id)}
                              disabled={autoAssignMut.isPending}
                              title="Auto-assign jury"
                            >
                              Assign Jury
                            </button>
                          )}

                          {nextStatus && (
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
                              onClick={() => statusMutation.mutate({ id: t.id, status: nextStatus })}
                              disabled={statusMutation.isPending}
                            >
                              {nextStatus === "Active" ? "Start" : nextStatus === "SubmissionClosed" ? "Close" : "Finish"}
                            </button>
                          )}

                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                            onClick={() => window.confirm("Delete task?") && deleteMutation.mutate(t.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selectedTournament === "all" && allMeta && (
            <Pagination
              page={page}
              totalPages={allMeta.pages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={allMeta.total}
            />
          )}
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