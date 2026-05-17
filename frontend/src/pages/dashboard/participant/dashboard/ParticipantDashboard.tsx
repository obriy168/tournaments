import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useActiveTeam } from "@/features/teams/hooks/useActiveTeam";
import {
  usePendingInvites,
  type TeamInvite,
} from "@/features/teams/hooks/usePendingInvites";
import { useQueryClient, useQuery, useQueries } from "@tanstack/react-query";
import {
  addUserToTeam,
  getTournament,
  getTasks,
  getSubmissionsByTask,
  getRequirements,
} from "@/services/api";
import styles from "./ParticipantDashboard.module.css";

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Deadline passed");
        setIsUrgent(true);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      setIsUrgent(diff < 1000 * 60 * 60 * 24);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [targetDate]);

  return { timeLeft, isUrgent };
}

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const activeTournamentId = useAuthStore((s) => s.activeTournamentId);
  const { team, isLoading: teamsLoading, hasTeam } = useActiveTeam();
  const { data: invites, isLoading: invitesLoading } = usePendingInvites();

  const hasInvites = invites && invites.length > 0;

  const { data: tournament, isLoading: tournamentLoading } = useQuery({
    queryKey: ["tournament", activeTournamentId],
    queryFn: () => getTournament(activeTournamentId!),
    enabled: !!activeTournamentId,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", activeTournamentId],
    queryFn: () => getTasks(activeTournamentId!),
    enabled: !!activeTournamentId,
  });

  const submissionQueries = useQueries({
    queries: (tasks || []).map((task) => ({
      queryKey: ["submissions", task.id, team?.id],
      queryFn: async () => {
        const subs = await getSubmissionsByTask(task.id);
        return subs.filter((s) => s.team_id === team?.id);
      },
      enabled: !!team?.id && !!tasks && tasks.length > 0,
    })),
  });

  const requirementQueries = useQueries({
    queries: (tasks || []).map((task) => ({
      queryKey: ["requirements", task.id],
      queryFn: () => getRequirements(task.id),
      enabled: !!task.id,
    })),
  });

  const allSubmissions = useMemo(() => {
    return submissionQueries
      .flatMap((q) => q.data || [])
      .sort(
        (a, b) =>
          new Date(b.created_on).getTime() - new Date(a.created_on).getTime()
      );
  }, [submissionQueries]);

  const submissionsLoading = submissionQueries.some((q) => q.isLoading);
  const requirementsLoading = requirementQueries.some((q) => q.isLoading);

  const currentTask = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;
    return tasks.find((t) => t.status === "Active") || tasks[0];
  }, [tasks]);

  const currentTaskRequirements = useMemo(() => {
    if (!currentTask) return [];
    const idx = tasks?.findIndex((t) => t.id === currentTask.id) ?? -1;
    if (idx === -1) return [];
    return requirementQueries[idx]?.data || [];
  }, [currentTask, tasks, requirementQueries]);

  const countdown = useCountdown(
    currentTask?.end_date || new Date().toISOString()
  );

  const handleAcceptInvite = async (teamId: number) => {
    if (!user) return;
    try {
      await addUserToTeam(teamId, user.id);
      const allInvites = JSON.parse(
        localStorage.getItem("pending_team_invites") || "[]"
      ) as TeamInvite[];
      const filtered = allInvites.filter(
        (i) =>
          !(
            i.teamId === teamId &&
            i.email.toLowerCase() === user.email.toLowerCase()
          )
      );
      localStorage.setItem(
        "pending_team_invites",
        JSON.stringify(filtered)
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pending-invites"] }),
        queryClient.invalidateQueries({ queryKey: ["my-teams"] }),
      ]);
    } catch (err) {
      console.error("Failed to accept invite:", err);
    }
  };

  if (teamsLoading || invitesLoading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
        </header>
        <div className={styles.content}>
          <div className={styles.emptyState}>
            <p className={styles.loadingText}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasTeam) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>
              Welcome back, {user?.first_name || "User"}!
            </p>
          </div>
        </header>
        <div className={styles.content}>
          {hasInvites ? (
            <div className={styles.invitesSection}>
              <h2 className={styles.sectionTitle}>Team Invites</h2>
              <div className={styles.invitesList}>
                {invites.map((invite) => (
                  <div key={invite.teamId} className={styles.inviteCard}>
                    <div className={styles.inviteInfo}>
                      <h3 className={styles.inviteTeamName}>
                        {invite.teamName}
                      </h3>
                      <p className={styles.inviteMeta}>
                        Invited on{" "}
                        {new Date(invite.invitedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAcceptInvite(invite.teamId)}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                    >
                      Join Team
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h2 className={styles.emptyTitle}>No team yet</h2>
              <p className={styles.emptyText}>
                Create a team to participate in tournaments and start competing!
              </p>
              <div className={styles.buttons}>
                <button
                  onClick={() =>
                    navigate("/app/participant/team/create/step1")
                  }
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  Create Team
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Team Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back, {user?.first_name || "User"}!
          </p>
        </div>
        <div className={styles.user}>
          <span className={styles.userName}>
            {user?.first_name || "User"}
          </span>
        </div>
      </header>

      <div className={styles.content}>
        {hasInvites && (
          <div className={styles.invitesSection}>
            <h2 className={styles.sectionTitle}>Team Invites</h2>
            <div className={styles.invitesList}>
              {invites.map((invite) => (
                <div key={invite.teamId} className={styles.inviteCard}>
                  <div className={styles.inviteInfo}>
                    <h3 className={styles.inviteTeamName}>
                      {invite.teamName}
                    </h3>
                    <p className={styles.inviteMeta}>
                      Invited on{" "}
                      {new Date(invite.invitedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAcceptInvite(invite.teamId)}
                    className={`${styles.button} ${styles.buttonPrimary}`}
                  >
                    Join Team
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3 className={styles.statCardTitle}>Active Tournament</h3>
            <p className={styles.statCardValue}>
              {tournamentLoading
                ? "..."
                : tournament?.name || "Not registered"}
            </p>
            <p className={styles.statCardLabel}>
              {tournament?.status || "—"}
            </p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statCardTitle}>Current Round</h3>
            <p className={styles.statCardValue}>
              {tasksLoading ? "..." : currentTask?.name || "No tasks"}
            </p>
            <p className={styles.statCardLabel}>
              {currentTask ? (
                countdown.isUrgent ? (
                  <span className={styles.urgent}>
                    Ends in: {countdown.timeLeft}
                  </span>
                ) : (
                  `Ends in: ${countdown.timeLeft}`
                )
              ) : (
                "—"
              )}
            </p>
          </div>
          <div className={styles.statCard}>
            <h3 className={styles.statCardTitle}>Submissions</h3>
            <p className={styles.statCardValue}>
              {submissionsLoading
                ? "..."
                : `${allSubmissions.length} / ${tasks?.length || 0}`}
            </p>
            <p className={styles.statCardLabel}>Tasks submitted</p>
          </div>
        </div>

        {currentTask && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Current Task</h2>
            <div className={styles.taskCard}>
              <div className={styles.taskCardHeader}>
                <h3 className={styles.taskCardTitle}>{currentTask.name}</h3>
                <span
                  className={`${styles.taskCardStatus} ${
                    styles[`taskStatus${currentTask.status}`]
                  }`}
                >
                  <span className={styles.statusDot} />
                  {currentTask.status}
                </span>
              </div>
              <p className={styles.taskCardDesc}>
                {currentTask.description}
              </p>
              {requirementsLoading ? (
                <p className={styles.loadingText}>Loading requirements…</p>
              ) : currentTaskRequirements.length > 0 ? (
                <div className={styles.taskCardRequirements}>
                  <h4 className={styles.taskCardSubtitle}>
                    Must Have ({currentTaskRequirements.length} criteria):
                  </h4>
                  <ul className={styles.taskCardList}>
                    {currentTaskRequirements.map((req) => (
                      <li key={req.id} className={styles.taskCardItem}>
                        {req.description}{" "}
                        <span
                          style={{ color: "#888", fontSize: 13 }}
                        >
                          (max {req.max_score} pts)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className={styles.taskCardDeadline}>
                <span className={styles.taskCardDeadlineLabel}>
                  Deadline:
                </span>
                <span className={styles.taskCardDeadlineDate}>
                  {new Date(currentTask.end_date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>
              <button
                onClick={() => navigate("/app/participant/submissions")}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                Submit Solution
              </button>
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Submissions</h2>
          {allSubmissions.length === 0 ? (
            <div className={styles.emptyCard}>
              <p className={styles.emptyText}>No submissions yet.</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Round</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {allSubmissions.slice(0, 5).map((sub) => {
                    const task = tasks?.find((t) => t.id === sub.task_id);
                    const taskStatus = task?.status || "Draft";
                    let statusLabel = "Pending";
                    let statusClass = styles.tableStatusPending;
                    if (taskStatus === "Evaluated") {
                      statusLabel = "Evaluated";
                      statusClass = styles.tableStatusEvaluated;
                    } else if (taskStatus === "SubmissionClosed") {
                      statusLabel = "Closed";
                      statusClass = styles.tableStatusClosed;
                    }
                    return (
                      <tr key={sub.id}>
                        <td>
                          {task?.name || `Task #${sub.task_id}`}
                        </td>
                        <td>
                          {new Date(sub.created_on).toLocaleDateString()}
                        </td>
                        <td>
                          <span
                            className={`${styles.tableStatus} ${statusClass}`}
                          >
                            <span className={styles.tableStatusDot} />
                            {statusLabel}
                          </span>
                        </td>
                        <td>
                          {taskStatus === "Evaluated" ? "TBD" : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}