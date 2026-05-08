import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMyTeams } from "@/features/teams/hooks/useMyTeams";
import { useIsTeamLead } from "@/features/teams/hooks/useUserRole";
import { useTeamMembers } from "@/features/teams/hooks/useTeamMembers";
import { useLeaveTeam } from "@/features/teams/hooks/useLeaveTeam";
import styles from "./ParticipantMyTeam.module.css";

export default function ParticipantMyTeam() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: teams, isLoading: teamsLoading } = useMyTeams();
  const leaveTeam = useLeaveTeam();

  // ВСЕ хуки ДО любых условных return
  const team = teams && teams.length > 0 ? teams[0] : null;
  
  // Хуки вызываются всегда, даже если team null — useQuery сам обработает enabled
  const { data: isLead } = useIsTeamLead(team?.id ?? 0);
  const { data: members, isLoading: membersLoading } = useTeamMembers(team?.id ?? 0);

  const isCaptain = isLead || user?.role === "captain";

  const handleLeaveTeam = async () => {
    if (!team) return;
    if (!window.confirm("Are you sure you want to leave this team?")) return;
    
    try {
      await leaveTeam.mutateAsync(team.id);
      navigate("/app/participant");
    } catch (err) {
      console.error("Failed to leave team:", err);
      alert("Failed to leave team. Please try again.");
    }
  };

  const handleRegisterForTournament = () => {
    if (!team) return;
    navigate(`/app/participant/tournaments?team=${team.id}`);
  };

  if (teamsLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>My Team</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>My Team</h1>
        <div className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>No team yet</h2>
          <p className={styles.emptyText}>You are not part of any team yet.</p>
          <button
            onClick={() => navigate("/app/participant/team/create/step1")}
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            Create Team
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Team</h1>

      <div className={styles.card}>
        <div className={styles.field}>
          <span className={styles.label}>Team Name</span>
          <span className={styles.value}>{team.name}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>City</span>
          <span className={styles.value}>{team.city}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>Organization</span>
          <span className={styles.value}>{team.organization}</span>
        </div>
        {team.tournament_id ? (
          <div className={styles.field}>
            <span className={styles.label}>Tournament</span>
            <span className={styles.value}>Registered</span>
          </div>
        ) : null}
      </div>

      <div className={styles.card} style={{ marginTop: 24 }}>
        <h2 className={styles.sectionTitle}>Team Members</h2>
        
        {membersLoading ? (
          <p>Loading members...</p>
        ) : members && members.length > 0 ? (
          members.map((member) => (
            <div key={member.user_id} className={styles.memberRow}>
              <div className={styles.memberInfo}>
                <span className={styles.memberName}>
                  {member.first_name} {member.last_name}
                </span>
                <span className={styles.memberEmail}>{member.email}</span>
              </div>
              {member.is_lead && (
                <span className={styles.badgeLead}>Lead</span>
              )}
            </div>
          ))
        ) : (
          <div className={styles.memberRow}>
            <span>{user?.first_name} {user?.last_name} (You)</span>
            <span className={styles.badgeLead}>Lead</span>
          </div>
        )}
      </div>

      <div className={styles.actions} style={{ marginTop: 24 }}>
        {isCaptain ? (
          <>
            <button
              onClick={() => navigate("/app/participant/team/edit")}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              Edit Team
            </button>
            {!team.tournament_id && (
              <button
                onClick={handleRegisterForTournament}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                Register for Tournament
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleLeaveTeam}
            className={`${styles.button} ${styles.buttonDanger}`}
            disabled={leaveTeam.isPending}
          >
            {leaveTeam.isPending ? "Leaving..." : "Leave Team"}
          </button>
        )}
      </div>
    </div>
  );
}