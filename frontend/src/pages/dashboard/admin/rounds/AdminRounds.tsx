import { useState, useMemo, useCallback } from "react";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import {
  useRoundsByTournament,
  useDeleteRound,
  useUpdateRoundStatus,
  useAutoAssignJury,
} from "@/features/admin/hooks/useRounds";
import { getTasks } from "@/services/api";
import RoundFormModal from "@/features/admin/components/RoundFormModal/RoundFormModal";
import RoundRequirementsModal from "@/features/admin/components/RoundRequirementsModal/RoundRequirementsModal";
import type { Task } from "@/services/api";
import styles from "./AdminRounds.module.css";

type FilterStatus = "All" | Task["status"];

interface RoundWithTournament extends Task {
  tournamentName: string;
}

export default function AdminRounds() {
  const { data: tournaments } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | "all">("all");
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [requirementsModalOpen, setRequirementsModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<Task | null>(null);
  const [managingRound, setManagingRound] = useState<Task | null>(null);
  const [allTournamentsRounds, setAllTournamentsRounds] = useState<Map<number, Task[]>>(new Map());
  const [loadingAll, setLoadingAll] = useState(false);

  const { data: singleTournamentRounds, isLoading } = useRoundsByTournament(
    selectedTournament !== "all" ? Number(selectedTournament) : null
  );

  const deleteMutation = useDeleteRound();
  const statusMutation = useUpdateRoundStatus();
  const autoAssignMut = useAutoAssignJury();

  const loadAllRounds = useCallback(async () => {
    if (!tournaments || tournaments.length === 0) {
      setAllTournamentsRounds(new Map());
      return;
    }

    setLoadingAll(true);
    const map = new Map<number, Task[]>();
    for (const tournament of tournaments) {
      try {
        const rounds = await getTasks(tournament.id);
        map.set(tournament.id, rounds);
      } catch {
        map.set(tournament.id, []);
      }
    }
    setAllTournamentsRounds(map);
    setLoadingAll(false);
  }, [tournaments]);

  const handleTournamentChange = (value: string) => {
    if (value === "all") {
      setSelectedTournament("all");
      loadAllRounds();
    } else {
      setSelectedTournament(Number(value));
      setAllTournamentsRounds(new Map());
    }
  };

  const filteredRounds = useMemo(() => {
    let rounds: RoundWithTournament[] = [];

    if (selectedTournament === "all") {
      if (allTournamentsRounds.size === 0 && tournaments && tournaments.length > 0) {
        loadAllRounds();
      }
      allTournamentsRounds.forEach((roundList, tournamentId) => {
        const tournamentName = tournaments?.find((t) => t.id === tournamentId)?.name || `Tournament #${tournamentId}`;
        roundList.forEach((round) => {
          rounds.push({ ...round, tournamentName });
        });
      });
    } else if (singleTournamentRounds) {
      const tournamentName = tournaments?.find((t) => t.id === Number(selectedTournament))?.name || "";
      rounds = singleTournamentRounds.map((round) => ({ ...round, tournamentName }));
    }

    if (filter !== "All") {
      rounds = rounds.filter((r) => r.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      rounds = rounds.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    rounds.sort((a, b) => {
      if (a.tournament_id !== b.tournament_id) {
        return a.tournament_id - b.tournament_id;
      }
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });

    return rounds;
  }, [selectedTournament, allTournamentsRounds, singleTournamentRounds, tournaments, filter, search, loadAllRounds]);

  const groupedRounds = useMemo(() => {
    const groups = new Map<string, RoundWithTournament[]>();
    filteredRounds.forEach((round) => {
      const key = `${round.tournament_id}-${round.tournamentName}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(round);
    });
    return groups;
  }, [filteredRounds]);

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete round "${name}"?`)) return;
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
    setEditingRound(null);
    setModalOpen(true);
  };

  const openEdit = (r: Task) => {
    setEditingRound(r);
    setModalOpen(true);
  };

  const openRequirements = (r: Task) => {
    setManagingRound(r);
    setRequirementsModalOpen(true);
  };

  const handleAutoAssign = (taskId: number) => {
    const minJury = window.prompt("Enter minimum number of jury members per submission:", "2");
    if (!minJury) return;
    const num = parseInt(minJury, 10);
    if (isNaN(num) || num < 1) {
      alert("Please enter a valid number");
      return;
    }
    autoAssignMut.mutate({ taskId, minJury: num });
  };

  const isRoundsLoading = selectedTournament === "all" ? loadingAll : isLoading;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Rounds</h1>
          <p className={styles.subtitle}>Manage tournament rounds and evaluation criteria</p>
        </div>
        <button
          className={styles.createBtn}
          onClick={openCreate}
        >
          + New Round
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
          placeholder="Search rounds..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isRoundsLoading ? (
        <div className={styles.loading}>Loading rounds…</div>
      ) : filteredRounds.length === 0 ? (
        <div className={styles.empty}>No rounds found</div>
      ) : selectedTournament === "all" ? (
        <div className={styles.groupsList}>
          {Array.from(groupedRounds.entries()).map(([key, rounds]) => {
            const [, tournamentName] = key.split("-", 2);
            return (
              <div key={key} className={styles.tournamentGroup}>
                <div className={styles.tournamentGroupHeader}>
                  <h3 className={styles.tournamentGroupTitle}>{tournamentName}</h3>
                  <span className={styles.tournamentGroupCount}>
                    {rounds.length} round{rounds.length !== 1 ? "s" : ""}
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
                      {rounds.map((r) => {
                        const nextStatus = getNextStatus(r.status);
                        return (
                          <tr key={r.id}>
                            <td>
                              <div className={styles.cellName}>{r.name}</div>
                              <div className={styles.cellDesc}>{r.description}</div>
                            </td>
                            <td>
                              <span
                                className={`${styles.status} ${
                                  styles[`status${r.status}`]
                                }`}
                              >
                                {r.status === "SubmissionClosed" ? "Closed" : r.status}
                              </span>
                            </td>
                            <td>
                              {new Date(r.start_date).toLocaleDateString()} —{" "}
                              {new Date(r.end_date).toLocaleDateString()}
                            </td>
                            <td>
                              <div className={styles.actions}>
                                <button
                                  className={styles.actionBtn}
                                  onClick={() => openEdit(r)}
                                  title="Edit"
                                >
                                  Edit
                                </button>
                                <button
                                  className={styles.actionBtn}
                                  onClick={() => openRequirements(r)}
                                  title="Manage requirements"
                                >
                                  Criteria
                                </button>
                                {nextStatus && (
                                  <button
                                    className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
                                    onClick={() => handleStatusChange(r.id, nextStatus)}
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
                                  onClick={() => handleDelete(r.id, r.name)}
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
              {filteredRounds.map((r) => {
                const nextStatus = getNextStatus(r.status);
                return (
                  <tr key={r.id}>
                    <td>
                      <div className={styles.cellName}>{r.name}</div>
                      <div className={styles.cellDesc}>{r.description}</div>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          styles[`status${r.status}`]
                        }`}
                      >
                        {r.status === "SubmissionClosed" ? "Closed" : r.status}
                      </span>
                    </td>
                    <td>
                      {new Date(r.start_date).toLocaleDateString()} —{" "}
                      {new Date(r.end_date).toLocaleDateString()}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => openEdit(r)}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => openRequirements(r)}
                          title="Manage requirements"
                        >
                          Criteria
                        </button>
                        {r.status === "SubmissionClosed" && (
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnWarning}`}
                            onClick={() => handleAutoAssign(r.id)}
                            disabled={autoAssignMut.isPending}
                            title="Auto-assign jury"
                          >
                            Assign Jury
                          </button>
                        )}
                        {nextStatus && (
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
                            onClick={() => handleStatusChange(r.id, nextStatus)}
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
                        {r.status === "Draft" && (
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                            onClick={() => handleDelete(r.id, r.name)}
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
        <RoundFormModal
          round={editingRound}
          defaultTournamentId={selectedTournament !== "all" ? Number(selectedTournament) : 0}
          onClose={() => setModalOpen(false)}
        />
      )}

      {requirementsModalOpen && managingRound && (
        <RoundRequirementsModal
          round={managingRound}
          onClose={() => {
            setRequirementsModalOpen(false);
            setManagingRound(null);
          }}
        />
      )}
    </div>
  );
}