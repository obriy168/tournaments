import { useState, useMemo, useCallback } from "react";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import {
  useTasksByTournament,
  useDeleteTask,
  useUpdateTaskStatus,
} from "@/features/admin/hooks/useTasks";
import { getTasks } from "@/services/api";
import TaskFormModal from "@/features/admin/components/TaskFormModal/TaskFormModal";
import type { Task } from "@/services/api";
import styles from "./AdminTasks.module.css";

type FilterStatus = "All" | Task["status"];

interface TaskWithTournament extends Task {
  tournamentName: string;
}

export default function AdminTasks() {
  const { data: tournaments } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | "all">("all");
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [allTournamentsTasks, setAllTournamentsTasks] = useState<Map<number, Task[]>>(new Map());
  const [loadingAll, setLoadingAll] = useState(false);

  const { data: singleTournamentTasks, isLoading } = useTasksByTournament(
    selectedTournament !== "all" ? Number(selectedTournament) : null
  );

  const deleteMutation = useDeleteTask();
  const statusMutation = useUpdateTaskStatus();

  const loadAllTasks = useCallback(async () => {
    if (!tournaments || tournaments.length === 0) {
      setAllTournamentsTasks(new Map());
      return;
    }

    setLoadingAll(true);
    const map = new Map<number, Task[]>();
    for (const tournament of tournaments) {
      try {
        const tasks = await getTasks(tournament.id);
        map.set(tournament.id, tasks);
      } catch {
        map.set(tournament.id, []);
      }
    }
    setAllTournamentsTasks(map);
    setLoadingAll(false);
  }, [tournaments]);

  const handleTournamentChange = (value: string) => {
    if (value === "all") {
      setSelectedTournament("all");
      loadAllTasks();
    } else {
      setSelectedTournament(Number(value));
      setAllTournamentsTasks(new Map());
    }
  };

  const filteredTasks = useMemo(() => {
    let tasks: TaskWithTournament[] = [];

    if (selectedTournament === "all") {
      if (allTournamentsTasks.size === 0 && tournaments && tournaments.length > 0) {
        loadAllTasks();
      }
      allTournamentsTasks.forEach((taskList, tournamentId) => {
        const tournamentName = tournaments?.find((t) => t.id === tournamentId)?.name || `Tournament #${tournamentId}`;
        taskList.forEach((task) => {
          tasks.push({ ...task, tournamentName });
        });
      });
    } else if (singleTournamentTasks) {
      const tournamentName = tournaments?.find((t) => t.id === Number(selectedTournament))?.name || "";
      tasks = singleTournamentTasks.map((task) => ({ ...task, tournamentName }));
    }

    if (filter !== "All") {
      tasks = tasks.filter((t) => t.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    tasks.sort((a, b) => {
      if (a.tournament_id !== b.tournament_id) {
        return a.tournament_id - b.tournament_id;
      }
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });

    return tasks;
  }, [selectedTournament, allTournamentsTasks, singleTournamentTasks, tournaments, filter, search, loadAllTasks]);

  const groupedTasks = useMemo(() => {
    const groups = new Map<string, TaskWithTournament[]>();
    filteredTasks.forEach((task) => {
      const key = `${task.tournament_id}-${task.tournamentName}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(task);
    });
    return groups;
  }, [filteredTasks]);

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete task "${name}"?`)) return;
    deleteMutation.mutate(id);
  };

  const handleStatusChange = (id: number, status: Task["status"]) => {
    statusMutation.mutate({ id, status });
  };

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

  const isTasksLoading = selectedTournament === "all" ? loadingAll : isLoading;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tasks</h1>
          <p className={styles.subtitle}>Manage tournament tasks</p>
        </div>
        <button
          className={styles.createBtn}
          onClick={openCreate}
        >
          + New Task
        </button>
      </header>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <select
            className={styles.select}
            value={selectedTournament}
            onChange={(e) => handleTournamentChange(e.target.value)}
          >
            <option value="all">All Tournaments</option>
            {(tournaments || []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          {(["All", "Draft", "Active", "SubmissionClosed", "Evaluated"] as FilterStatus[]).map(
            (f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${
                  filter === f ? styles.filterBtnActive : ""
                }`}
                onClick={() => setFilter(f)}
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
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isTasksLoading ? (
        <div className={styles.loading}>Loading tasks…</div>
      ) : filteredTasks.length === 0 ? (
        <div className={styles.empty}>No tasks found</div>
      ) : selectedTournament === "all" ? (
        <div className={styles.groupsList}>
          {Array.from(groupedTasks.entries()).map(([key, tasks]) => {
            const [, tournamentName] = key.split("-", 2);
            return (
              <div key={key} className={styles.tournamentGroup}>
                <div className={styles.tournamentGroupHeader}>
                  <h3 className={styles.tournamentGroupTitle}>{tournamentName}</h3>
                  <span className={styles.tournamentGroupCount}>
                    {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                  </span>
                </div>
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
                      {tasks.map((t) => {
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
                                  <button
                                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                                    onClick={() => handleDelete(t.id, t.name)}
                                    disabled={deleteMutation.isPending}
                                    title="Delete"
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
              </div>
            );
          })}
        </div>
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
      )}

      {modalOpen && (
        <TaskFormModal
            task={editingTask}
            defaultTournamentId={selectedTournament !== "all" ? Number(selectedTournament) : 0}
            onClose={() => setModalOpen(false)}
        />
        )}
    </div>
  );
}