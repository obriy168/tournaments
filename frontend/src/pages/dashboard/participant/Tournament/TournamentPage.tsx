import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMyTeams } from "@/features/teams/hooks/useMyTeams";
import { getTournament, getTasks, type Task } from "@/services/api";
import styles from "./TournamentRegistrationPage.module.css";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysLeft(end: string) {
  return Math.ceil(
    (new Date(end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

export default function TournamentRegistrationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: teams, isLoading: teamsLoading } = useMyTeams();

  const team = teams?.[0] ?? null;
  const registeredTournamentId = team?.tournament_id ?? null;

  const { data: tournament, isLoading: tournamentLoading } = useQuery({
    queryKey: ["tournament", registeredTournamentId],
    queryFn: () => getTournament(registeredTournamentId!),
    enabled: !!registeredTournamentId,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", registeredTournamentId],
    queryFn: () => getTasks(registeredTournamentId!),
    enabled: !!registeredTournamentId,
  });

  if (teamsLoading || tournamentLoading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Tournaments</h1>
        </header>
        <p className={styles.loadingText}>Loading…</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Tournaments</h1>
        </header>
        <div className={styles.emptyState}>
          <p>You need to create a team first.</p>
          <button
            onClick={() => navigate("/app/participant/team/create/step1")}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            Create Team
          </button>
        </div>
      </div>
    );
  }

  if (!registeredTournamentId || !tournament) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Tournaments</h1>
          <div className={styles.user}>
            <span className={styles.userName}>{user?.first_name || "User"}</span>
          </div>
        </header>
        <div className={styles.emptyState}>
          <p>Your team is not registered for any tournament.</p>
          <p className={styles.emptySubtext}>
            This should not happen — tournament is selected during team creation.
          </p>
        </div>
      </div>
    );
  }

  const regDaysLeft =
    tournament.status === "Registration"
      ? getDaysLeft(tournament.registration_end_date)
      : null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Tournament</h1>
        <div className={styles.user}>
          <span className={styles.userName}>{user?.first_name || "User"}</span>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.registeredCard}>
          <div className={styles.registeredHeader}>
            <h2 className={styles.registeredTitle}>{tournament.name}</h2>
            <span
              className={`${styles.statusBadge} ${
                styles[`status${tournament.status}`]
              }`}
            >
              {tournament.status}
            </span>
          </div>
          <p className={styles.registeredDesc}>{tournament.description}</p>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Tournament starts</span>
              <span className={styles.infoValue}>
                {formatDate(tournament.start_date)}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Registration closes</span>
              <span className={styles.infoValue}>
                {formatDate(tournament.registration_end_date)}
              </span>
            </div>
            {tournament.max_teams ? (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Max teams</span>
                <span className={styles.infoValue}>
                  {tournament.max_teams}
                </span>
              </div>
            ) : null}
            {regDaysLeft !== null && regDaysLeft > 0 ? (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Registration ends in</span>
                <span
                  className={`${styles.infoValue} ${
                    regDaysLeft <= 3 ? styles.urgent : ""
                  }`}
                >
                  {regDaysLeft} day{regDaysLeft !== 1 ? "s" : ""}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Tasks</h3>
          {tasksLoading ? (
            <p className={styles.loadingText}>Loading tasks…</p>
          ) : !tasks || tasks.length === 0 ? (
            <div className={styles.emptyCard}>
              <p className={styles.emptyText}>No tasks published yet.</p>
            </div>
          ) : (
            <div className={styles.tasksList}>
              {tasks.map((task: Task) => (
                <div key={task.id} className={styles.taskCard}>
                  <div className={styles.taskHeader}>
                    <h4 className={styles.taskName}>{task.name}</h4>
                    <span
                      className={`${styles.taskStatus} ${
                        styles[`taskStatus${task.status}`]
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <p className={styles.taskDesc}>{task.description}</p>
                  <div className={styles.taskMeta}>
                    <span>Starts: {formatDate(task.start_date)}</span>
                    <span>Ends: {formatDate(task.end_date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}