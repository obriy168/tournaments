import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import { getUsersByRole, setUserRole, getUsers } from "@/services/api";
import styles from "./AdminJury.module.css";

export default function AdminJury() {
  const queryClient = useQueryClient();
  const { data: tournaments } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | "">("");

  const { data: juryMembers, isLoading } = useQuery({
    queryKey: ["jury", selectedTournament],
    queryFn: () =>
      selectedTournament
        ? getUsersByRole("jury", Number(selectedTournament))
        : [],
    enabled: !!selectedTournament,
  });

  const { data: allUsers } = useQuery({
    queryKey: ["all-users"],
    queryFn: getUsers,
  });

  const addJuryMutation = useMutation({
    mutationFn: ({ userId, tournamentId }: { userId: number; tournamentId: number }) =>
      setUserRole(userId, tournamentId, "Jury"), // ← Исправлено: "Jury" вместо "jury"
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jury", selectedTournament] });
    },
  });

  const nonJuryUsers = (allUsers || []).filter(
    (u) => !juryMembers?.some((j) => j.id === u.id)
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Jury Management</h1>
          <p className={styles.subtitle}>Assign jury members to tournaments</p>
        </div>
      </header>

      <div className={styles.filterSection}>
        <label className={styles.label}>Select Tournament</label>
        <select
          className={styles.select}
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(Number(e.target.value) || "")}
        >
          <option value="">Choose a tournament...</option>
          {(tournaments || []).map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTournament && (
        <>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Current Jury</h2>
            {isLoading ? (
              <div className={styles.loading}>Loading...</div>
            ) : juryMembers && juryMembers.length > 0 ? (
              <div className={styles.list}>
                {juryMembers.map((member) => (
                  <div key={member.id} className={styles.card}>
                    <div className={styles.avatar}>
                      {(member.first_name?.[0] || "") + (member.last_name?.[0] || "")}
                    </div>
                    <div className={styles.info}>
                      <span className={styles.name}>
                        {member.first_name} {member.last_name}
                      </span>
                      <span className={styles.email}>{member.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>No jury assigned yet</div>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Add Jury Member</h2>
            {nonJuryUsers.length === 0 ? (
              <div className={styles.empty}>No available users</div>
            ) : (
              <div className={styles.list}>
                {nonJuryUsers.map((user) => (
                  <div key={user.id} className={styles.card}>
                    <div className={styles.avatar}>
                      {(user.first_name?.[0] || "") + (user.last_name?.[0] || "")}
                    </div>
                    <div className={styles.info}>
                      <span className={styles.name}>
                        {user.first_name} {user.last_name}
                      </span>
                      <span className={styles.email}>{user.email}</span>
                    </div>
                    <button
                      className={styles.addBtn}
                      onClick={() =>
                        addJuryMutation.mutate({
                          userId: user.id,
                          tournamentId: Number(selectedTournament),
                        })
                      }
                      disabled={addJuryMutation.isPending}
                    >
                      {addJuryMutation.isPending ? "Adding..." : "Add"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}