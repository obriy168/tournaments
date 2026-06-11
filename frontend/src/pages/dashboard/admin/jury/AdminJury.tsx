import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePagination } from "@/hooks/usePagination";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import {
  getUsersByRole,
  setUserRole,
  searchUsers,
  type User,
} from "@/services/api";
import Pagination from "@/components/Pagination/Pagination";
import styles from "./AdminJury.module.css";

interface JuryIdResponse {
  user_id?: number;
  id?: number;
}

export default function AdminJury() {
  const queryClient = useQueryClient();
  const { data: tournaments } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | "">("");
  const [jurySearch, setJurySearch] = useState("");
  const [usersSearch, setUsersSearch] = useState("");

  const {
    data: juryData,
    meta: juryMeta,
    isLoading: juryLoading,
    page: juryCurrentPage,
    setPage: setJuryPage,
    pageSize: juryPageSize,
    setPageSize: setJuryPageSize,
  } = usePagination<User>({
    queryKey: ["jury-users", selectedTournament],
    fetchFn: (params) => searchUsers(jurySearch, params),
    enabled: !!selectedTournament,
    extraDeps: [jurySearch],
  });

  const {
    data: usersData,
    meta: usersMeta,
    isLoading: usersLoading,
    page: usersCurrentPage,
    setPage: setUsersPage,
    pageSize: usersPageSize,
    setPageSize: setUsersPageSize,
  } = usePagination<User>({
    queryKey: ["available-users"],
    fetchFn: (params) => searchUsers(usersSearch, params),
    enabled: !!selectedTournament,
    extraDeps: [usersSearch],
  });

  const {
    data: juryUserIds,
    isLoading: juryIdsLoading,
  } = useQuery({
    queryKey: ["jury-ids", selectedTournament],
    queryFn: async () => {
      if (!selectedTournament) return [];
      const result = await getUsersByRole("Jury", Number(selectedTournament));
      return Array.isArray(result) ? result : [];
    },
    enabled: !!selectedTournament,
  });

  const juryIdsSet = useMemo(() => {
    if (!juryUserIds) return new Set<number>();
    const ids = juryUserIds
      .map((j: JuryIdResponse | number) => 
        typeof j === "number" ? j : (j.user_id ?? j.id ?? 0)
      )
      .filter((id): id is number => id !== 0);
    return new Set(ids);
  }, [juryUserIds]);

  const filteredJury = useMemo(() => {
    return (juryData || []).filter((u) => juryIdsSet.has(u.id));
  }, [juryData, juryIdsSet]);

  const filteredUsers = useMemo(() => {
    return (usersData || []).filter((u) => !juryIdsSet.has(u.id));
  }, [usersData, juryIdsSet]);

  const addJuryMutation = useMutation({
    mutationFn: ({
      userId,
      tournamentId,
    }: {
      userId: number;
      tournamentId: number;
    }) => setUserRole(userId, tournamentId, "Jury"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["jury-ids", selectedTournament],
      });
      queryClient.invalidateQueries({
        queryKey: ["jury-users", selectedTournament],
      });
      queryClient.invalidateQueries({
        queryKey: ["available-users"],
      });
    },
  });

  const removeJuryMutation = useMutation({
    mutationFn: async ({
      userId,
      tournamentId,
    }: {
      userId: number;
      tournamentId: number;
    }) => {
      return setUserRole(userId, tournamentId, "Participant");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["jury-ids", selectedTournament],
      });
      queryClient.invalidateQueries({
        queryKey: ["jury-users", selectedTournament],
      });
      queryClient.invalidateQueries({
        queryKey: ["available-users"],
      });
    },
  });

  const handleRemoveJury = useCallback((userId: number) => {
    if (!selectedTournament) return;
    if (!window.confirm("Are you sure you want to remove this jury member?")) return;
    removeJuryMutation.mutate({
      userId,
      tournamentId: Number(selectedTournament),
    });
  }, [selectedTournament, removeJuryMutation]);

  const isLoading = juryIdsLoading || juryLoading;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Jury Management</h1>
          <p className={styles.subtitle}>
            Assign and manage jury members for tournaments
          </p>
        </div>
      </header>

      <div className={styles.filterSection}>
        <label className={styles.label}>Select Tournament</label>
        <select
          className={styles.select}
          value={selectedTournament}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedTournament(value ? Number(value) : "");
            setJurySearch("");
            setUsersSearch("");
            setJuryPage(1);
            setUsersPage(1);
          }}
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
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Current Jury
              </h2>
              <input
                type="text"
                placeholder="Search jury members..."
                className={styles.searchInput}
                value={jurySearch}
                onChange={(e) => {
                  setJurySearch(e.target.value);
                  setJuryPage(1);
                }}
              />
            </div>

            {isLoading ? (
              <div className={styles.loading}>Loading jury members…</div>
            ) : filteredJury.length > 0 ? (
              <>
                <div className={styles.list}>
                  {filteredJury.map((member) => (
                    <div key={member.id} className={styles.card}>
                      <div className={styles.avatar}>
                        {(member.first_name?.[0] || "") +
                          (member.last_name?.[0] || "")}
                      </div>
                      <div className={styles.info}>
                        <span className={styles.name}>
                          {member.first_name} {member.last_name}
                        </span>
                        <span className={styles.email}>{member.email}</span>
                      </div>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => handleRemoveJury(member.id)}
                        disabled={removeJuryMutation.isPending}
                        title="Remove from jury"
                      >
                        {removeJuryMutation.isPending &&
                        removeJuryMutation.variables?.userId === member.id
                          ? "Removing…"
                          : "Remove"}
                      </button>
                    </div>
                  ))}
                </div>
                {juryMeta && (
                  <Pagination
                    page={juryCurrentPage}
                    totalPages={juryMeta.pages}
                    onPageChange={setJuryPage}
                    pageSize={juryPageSize}
                    onPageSizeChange={setJuryPageSize}
                    totalItems={juryMeta.total}
                  />
                )}
              </>
            ) : (
              <div className={styles.empty}>
                {jurySearch.trim()
                  ? "No jury members match your search"
                  : "No jury assigned yet"}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Available Users
              </h2>
              <input
                type="text"
                placeholder="Search users..."
                className={styles.searchInput}
                value={usersSearch}
                onChange={(e) => {
                  setUsersSearch(e.target.value);
                  setUsersPage(1);
                }}
              />
            </div>

            {usersLoading ? (
              <div className={styles.loading}>Loading users…</div>
            ) : filteredUsers.length === 0 ? (
              <div className={styles.empty}>
                {usersSearch.trim()
                  ? "No users match your search"
                  : "No available users"}
              </div>
            ) : (
              <>
                <div className={styles.list}>
                  {filteredUsers.map((user) => (
                    <div key={user.id} className={styles.card}>
                      <div className={styles.avatar}>
                        {(user.first_name?.[0] || "") +
                          (user.last_name?.[0] || "")}
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
                        {addJuryMutation.isPending &&
                        addJuryMutation.variables?.userId === user.id
                          ? "Adding…"
                          : "Add to Jury"}
                      </button>
                    </div>
                  ))}
                </div>
                {usersMeta && (
                  <Pagination
                    page={usersCurrentPage}
                    totalPages={usersMeta.pages}
                    onPageChange={setUsersPage}
                    pageSize={usersPageSize}
                    onPageSizeChange={setUsersPageSize}
                    totalItems={usersMeta.total}
                  />
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}