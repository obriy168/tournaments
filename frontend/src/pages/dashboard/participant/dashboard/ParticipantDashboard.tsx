import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMyTeams } from "@/features/teams/hooks/useMyTeams";
import { usePendingInvites, type TeamInvite } from "@/features/teams/hooks/usePendingInvites";
import { useQueryClient } from "@tanstack/react-query";
import { myTeamsKeys } from "@/features/teams/hooks/useMyTeams";
import { addUserToTeam } from "@/services/api";
import styles from "./ParticipantDashboard.module.css";

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: teams, isLoading: teamsLoading } = useMyTeams();
  const { data: invites, isLoading: invitesLoading } = usePendingInvites();

  const hasTeam = teams && teams.length > 0;
  const hasInvites = invites && invites.length > 0;

  const handleAcceptInvite = async (teamId: number) => {
    if (!user) return;
    try {
      await addUserToTeam(teamId, user.id);
      const allInvites = JSON.parse(
        localStorage.getItem("pending_team_invites") || "[]"
      ) as TeamInvite[];
      const filtered = allInvites.filter(
        (i) => !(i.teamId === teamId && i.email.toLowerCase() === user.email.toLowerCase())
      );
      localStorage.setItem("pending_team_invites", JSON.stringify(filtered));
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pending-invites"] }),
        queryClient.invalidateQueries({ queryKey: myTeamsKeys.all }),
      ]);
    } catch (err) {
      console.error("Failed to accept invite:", err);
    }
  };

  if (teamsLoading || invitesLoading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Welcome</h1>
          <div className={styles.user}>
            <span className={styles.userName}>{user?.first_name || "User"}</span>
          </div>
        </header>
        <div className={styles.content}>
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.user}>
          <span className={styles.userName}>{user?.first_name || "User"}</span>
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
                    <h3 className={styles.inviteTeamName}>{invite.teamName}</h3>
                    <p className={styles.inviteMeta}>
                      Invited on {new Date(invite.invitedAt).toLocaleDateString()}
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

        {hasTeam ? (
          <div className={styles.teamsSection}>
            <h2 className={styles.sectionTitle}>Your Teams</h2>
            <div className={styles.teamsGrid}>
              {teams.map((team) => (
                <div key={team.id} className={styles.teamCard}>
                  <h3 className={styles.teamName}>{team.name}</h3>
                  <p className={styles.teamInfo}>
                    <span className={styles.label}>City:</span> {team.city}
                  </p>
                  <p className={styles.teamInfo}>
                    <span className={styles.label}>Organization:</span> {team.organization}
                  </p>
                  {team.tournament_id ? (
                    <p className={styles.teamInfo}>
                      <span className={styles.label}>Tournament:</span> Registered
                    </p>
                  ) : (
                    <button
                      onClick={() => navigate(`/app/participant/tournaments?team=${team.id}`)}
                      className={`${styles.button} ${styles.buttonPrimary}`}
                    >
                      Register for Tournament →
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/app/participant/team")}
                    className={`${styles.button} ${styles.buttonSecondary}`}
                  >
                    Manage Team
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : !hasInvites ? (
          <div className={styles.emptyState}>
            <div className={styles.icon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>No team yet</h2>
            <p className={styles.emptyText}>
              Create a team or accept an invite to participate in tournaments!
            </p>
            <div className={styles.buttons}>
              <button
                onClick={() => navigate("/app/participant/team/create/step1")}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                Create team
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}