import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTeam,
  getTeamMembers,
  getTournament,
  updateTeam,
  removeUserFromTeamByIds,
  type Team,
  type TeamMemberFull,
} from "@/services/api";
import styles from "./TeamViewModal.module.css";

interface Props {
  teamId: number | null;
  onClose: () => void;
}

export default function TeamViewModal({ teamId, onClose }: Props) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => getTeam(teamId!),
    enabled: !!teamId,
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: () => getTeamMembers(teamId!),
    enabled: !!teamId,
  });

  const { data: tournament } = useQuery({
    queryKey: ["tournament", team?.tournament_id],
    queryFn: () => getTournament(team!.tournament_id!),
    enabled: !!team?.tournament_id,
  });

  const [form, setForm] = useState({
    name: "",
    city: "",
    organization: "",
  });

  const updateMut = useMutation({
    mutationFn: (data: Partial<Team>) => {
      if (!teamId) throw new Error("No team ID");
      return updateTeam(teamId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", teamId] });
      queryClient.invalidateQueries({ queryKey: ["all-teams"] });
      setIsEditing(false);
    },
  });

  const removeMemberMut = useMutation({
    mutationFn: ({ userId, teamId }: { userId: number; teamId: number }) =>
      removeUserFromTeamByIds(userId, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
    },
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.city.trim() || !form.organization.trim()) return;
    updateMut.mutate({
      name: form.name,
      city: form.city,
      organization: form.organization,
    });
  };

  const handleRemoveMember = (member: TeamMemberFull) => {
    if (!teamId) return;
    if (!window.confirm(`Remove ${member.first_name} ${member.last_name} from the team?`)) return;
    removeMemberMut.mutate({ userId: member.id, teamId });
  };

  const handleStartEdit = () => {
    if (team) {
      setForm({
        name: team.name,
        city: team.city,
        organization: team.organization,
      });
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (!teamId) return null;

  const isLoading = teamLoading || membersLoading;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditing ? "Edit Team" : team?.name || "Team Details"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className={styles.content}>
          {isLoading ? (
            <p className={styles.loadingText}>Loading team information…</p>
          ) : (
            <>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Team Information</h3>
                {isEditing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className={styles.field}>
                      <label className={styles.label}>Team Name</label>
                      <input
                        className={styles.input}
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        autoComplete="off"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>City</label>
                      <input
                        className={styles.input}
                        value={form.city}
                        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                        autoComplete="off"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Organization</label>
                      <input
                        className={styles.input}
                        value={form.organization}
                        onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                ) : (
                  <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Team Name</span>
                      <span className={styles.metaValue}>{team?.name}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>City</span>
                      <span className={styles.metaValue}>{team?.city}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Organization</span>
                      <span className={styles.metaValue}>{team?.organization}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Tournament</span>
                      <span className={styles.metaValue}>
                        {team?.tournament_id ? (
                          tournament ? (
                            <span className={styles.registered}>{tournament.name}</span>
                          ) : (
                            <span className={styles.registered}>Registered</span>
                          )
                        ) : (
                          <span className={styles.notRegistered}>Not registered</span>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  Members ({members?.length || 0})
                </h3>
                {members && members.length > 0 ? (
                  <ul className={styles.membersList}>
                    {members.map((member: TeamMemberFull) => (
                      <li key={member.id} className={styles.memberItem}>
                        <div className={styles.memberAvatar}>
                          {(member.first_name?.[0] || "") + (member.last_name?.[0] || "")}
                        </div>
                        <div className={styles.memberInfo}>
                          <span className={styles.memberName}>
                            {member.first_name} {member.last_name}
                          </span>
                          <span className={styles.memberEmail}>{member.email}</span>
                        </div>
                        {member.is_lead && (
                          <span className={styles.badgeLead}>Captain</span>
                        )}
                        {!member.is_lead && (
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnDanger} ${styles.btnSmall}`}
                            onClick={() => handleRemoveMember(member)}
                            disabled={removeMemberMut.isPending && removeMemberMut.variables?.userId === member.id}
                            title="Remove member"
                          >
                            {removeMemberMut.isPending && removeMemberMut.variables?.userId === member.id
                              ? "Removing…"
                              : "Remove"}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.loadingText}>No members found</p>
                )}
              </div>

              <div className={styles.actions}>
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={handleCancelEdit}
                      disabled={updateMut.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={handleSave}
                      disabled={updateMut.isPending}
                    >
                      {updateMut.isPending ? "Saving…" : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={handleStartEdit}
                  >
                    Edit Team
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}