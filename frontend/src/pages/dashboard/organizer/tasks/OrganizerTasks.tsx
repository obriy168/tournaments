import { useState, useMemo } from "react";
import { useTasksByTournament, useDeleteTask, useUpdateTaskStatus } from "@/features/organizer/hooks/useTasks";
import { useAuthStore } from "@/features/auth/store/authStore";
import TaskFormModal from "@/features/organizer/components/TaskFormModal/TaskFormModal";
import type { Task } from "@/services/api";
import styles from "./OrganizerTasks.module.css"; 

type FilterStatus = "All" | Task["status"];

export default function OrganizerTasks() {
  const activeTournamentId = useAuthStore((s) => s.activeTournamentId);
  if (!activeTournamentId) {
    return <div className={styles.loading}>Please select a tournament to see statistics.</div>;
  }

  const [filter, setFilter] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks, isLoading } = useTasksByTournament(activeTournamentId);
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
      res = res.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }

    return res.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  }, [tasks, filter, search]);

  const getNextStatus = (current: Task["status"]): Task["status"] | null => {
    const transitions: Record<Task["status"], Task["status"] | null> = {
      Draft: "Active",
      Active: "SubmissionClosed",
      SubmissionClosed: "Evaluated",
      Evaluated: null,
    };
    return transitions[current];
  };

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (t: Task) => {
    setEditingTask(t);
    setModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tournament Tasks</h1>
          <p className={styles.subtitle}>Manage tasks and deadlines for this tournament</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate}>
          + New Task
        </button>
      </header>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          {(["All", "Draft", "Active", "SubmissionClosed", "Evaluated"] as FilterStatus[]).map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ""}`}
              onClick={() => setFilter(f)}
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
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading tasks…</div>
      ) : filteredTasks.length === 0 ? (
        <div className={styles.empty}>No tasks found for this tournament.</div>
      ) : (
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
              {filteredTasks.map((t) => {
                const nextStatus = getNextStatus(t.status);
                return (
                  <tr key={t.id}>
                    <td>
                      <div className={styles.cellName}>{t.name}</div>
                      <div className={styles.cellDesc}>{t.description}</div>
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
      )}

      {modalOpen && (
        <TaskFormModal
          task={editingTask}
          defaultTournamentId={activeTournamentId}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}