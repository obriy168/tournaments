import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMyTeams } from "@/features/teams/hooks/useMyTeams";
import { useIsTeamLead } from "@/features/teams/hooks/useUserRole";
import { useTeamMembers } from "@/features/teams/hooks/useTeamMembers";
import { useLeaveTeam } from "@/features/teams/hooks/useLeaveTeam";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateTeam,
  removeUserFromTeam,
  changeTeamLeader,
  addUserToTeam,
  getUserTeamLink,
  getAllUsers,
  type Team,
  type User,
} from "@/services/api";
import { myTeamsKeys } from "@/features/teams/hooks/useMyTeams";
import styles from "./ParticipantMyTeam.module.css";

function TeamCard({ team, user }: { team: Team; user: User }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: isLead } = useIsTeamLead(team.id);
  const { data: members, isLoading: membersLoading } = useTeamMembers(team.id);
  const leaveTeam = useLeaveTeam();

  const isCaptain = isLead || user.role === "captain";

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: team.name,
    city: team.city,
    organization: team.organization,
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const updateMut = useMutation({
    mutationFn: (data: Partial<Team>) => updateTeam(team.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myTeamsKeys.all });
      setIsEditing(false);
    },
  });

  const inviteMut = useMutation({
    mutationFn: async (email: string) => {
      const allUsers = await getAllUsers();
      const found = allUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );
      if (!found) throw new Error("User not found. Ask them to sign up first.");
      if (found.id === user.id) throw new Error("You are already in the team.");
      const alreadyInTeam = members?.some((m) => m.user_id === found.id);
      if (alreadyInTeam) throw new Error("User is already in the team.");
      await addUserToTeam(team.id, found.id);
      return found;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", team.id] });
      setInviteEmail("");
      setInviteError(null);
      setInviteSuccess("Member invited successfully.");
      setTimeout(() => setInviteSuccess(null), 3000);
    },
    onError: (err: unknown) => {
      setInviteSuccess(null);
      const message =
        err instanceof Error ? err.message : "Failed to invite member.";
      setInviteError(message);
    },
  });

  const removeMut = useMutation({
    mutationFn: async (memberUserId: number) => {
      const link = await getUserTeamLink(team.id, memberUserId);
      if (!link) throw new Error("Membership not found.");
      await removeUserFromTeam(link.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", team.id] });
    },
  });

  const captainMut = useMutation({
    mutationFn: (memberUserId: number) => changeTeamLeader(team.id, memberUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", team.id] });
      queryClient.invalidateQueries({ queryKey: ["is-team-lead", team.id] });
    },
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.city.trim() || !form.organization.trim()) return;
    updateMut.mutate(form);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteError(null);
    inviteMut.mutate(inviteEmail);
  };

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;
    try {
      await leaveTeam.mutateAsync(team.id);
    } catch {
      // handled in hook
    }
  };

  const displayMembers =
    members && members.length > 0
      ? members
      : [
          {
            user_team_id: 0,
            user_id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            is_lead: true,
          },
        ];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        {isEditing ? (
          <div className={styles.editForm}>
            <div className={styles.field}>
              <label className={styles.label}>Team Name</label>
              <input
                className={styles.input}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>City</label>
              <input
                className={styles.input}
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Organization</label>
              <input
                className={styles.input}
                value={form.organization}
                onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className={styles.cardTitleRow}>
              <h2 className={styles.teamName}>{team.name}</h2>
              {isCaptain && <span className={styles.badgeLead}>Captain</span>}
            </div>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>City</span>
                <span className={styles.metaValue}>{team.city}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Organization</span>
                <span className={styles.metaValue}>{team.organization}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Tournament</span>
                <span className={styles.metaValue}>
                  {team.tournament_id ? (
                    <span className={styles.registered}>Registered</span>
                  ) : (
                    <span className={styles.notRegistered}>Not registered</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Team Members</h3>
        {membersLoading ? (
          <p className={styles.loadingText}>Loading members…</p>
        ) : (
          <ul className={styles.membersList}>
            {displayMembers.map((member) => {
              const isMe = member.user_id === user.id;
              return (
                <li key={member.user_id} className={styles.memberItem}>
                  <div className={styles.memberLeft}>
                    <div className={styles.memberAvatar}>
                      {(member.first_name?.[0] || "") + (member.last_name?.[0] || "")}
                    </div>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberNameRow}>
                        <span className={styles.memberName}>
                          {member.first_name} {member.last_name}
                        </span>
                        {member.is_lead && <span className={styles.badgeLeadSmall}>Captain</span>}
                        {isMe && <span className={styles.badgeYou}>You</span>}
                      </div>
                      <span className={styles.memberEmail}>{member.email}</span>
                    </div>
                  </div>
                  {isCaptain && !isMe && (
                    <div className={styles.memberActions}>
                      <button
                        className={`${styles.btn} ${styles.btnSmall}`}
                        onClick={() => captainMut.mutate(member.user_id)}
                        disabled={captainMut.isPending}
                        title="Make captain"
                      >
                        Make Captain
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnDangerSmall}`}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Remove ${member.first_name} ${member.last_name} from the team?`
                            )
                          ) {
                            removeMut.mutate(member.user_id);
                          }
                        }}
                        disabled={removeMut.isPending}
                        title="Remove"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {isCaptain && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Invite Member</h3>
          <form className={styles.inviteForm} onSubmit={handleInvite}>
            <input
              type="email"
              placeholder="member@example.com"
              className={styles.input}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={inviteMut.isPending}
            />
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={inviteMut.isPending || !inviteEmail.trim()}
            >
              {inviteMut.isPending ? "Inviting…" : "Invite"}
            </button>
          </form>
          {inviteError && <p className={styles.errorText}>{inviteError}</p>}
          {inviteSuccess && <p className={styles.successText}>{inviteSuccess}</p>}
        </div>
      )}

      <div className={styles.actions}>
        {isEditing ? (
          <>
            <button
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={() => {
                setIsEditing(false);
                setForm({
                  name: team.name,
                  city: team.city,
                  organization: team.organization,
                });
              }}
            >
              Cancel
            </button>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleSave}
              disabled={updateMut.isPending}
            >
              {updateMut.isPending ? "Saving…" : "Save Changes"}
            </button>
          </>
        ) : (
          <>
            {isCaptain ? (
              <>
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Team
                </button>
                {!team.tournament_id && (
                  <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() =>
                      navigate(`/app/participant/tournaments?team=${team.id}`)
                    }
                  >
                    Register for Tournament
                  </button>
                )}
              </>
            ) : (
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={handleLeave}
                disabled={leaveTeam.isPending}
              >
                {leaveTeam.isPending ? "Leaving…" : "Leave Team"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ParticipantMyTeam() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: teams, isLoading: teamsLoading } = useMyTeams();

  if (teamsLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>My Team</h1>
        <p className={styles.loadingText}>Loading…</p>
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>My Team</h1>
        <div className={styles.emptyCard}>
          <h2 className={styles.emptyTitle}>No team yet</h2>
          <p className={styles.emptyText}>You are not part of any team yet.</p>
          <button
            onClick={() => navigate("/app/participant/team/create/step1")}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            Create Team
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{teams.length > 1 ? "My Teams" : "My Team"}</h1>
      <div className={styles.teamsList}>
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} user={user!} />
        ))}
      </div>
    </div>
  );
}