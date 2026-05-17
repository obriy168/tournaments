import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePagination } from "@/features/Pagination/hooks/usePagination";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import {
  getUsersByRole,
  setUserRole,
  getAllUsers,
  type User,
} from "@/services/api";
import styles from "./AdminJury.module.css";

interface JuryMember extends User {
  assignmentId?: number;
}

interface JuryIdResponse {
  user_id?: number;
  id?: number;
}

export default function AdminJury() {
  const queryClient = useQueryClient();
  const { data: tournaments } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | "">("");
  const [searchJury, setSearchJury] = useState("");
  const [searchUsers, setSearchUsers] = useState("");

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: getAllUsers,
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

  const juryMembers = useMemo(() => {
    if (!juryUserIds || !allUsers) return [];
    
    const juryIds = juryUserIds
      .map((j: JuryIdResponse | number) => 
        typeof j === "number" ? j : (j.user_id ?? j.id ?? 0)
      )
      .filter((id): id is number => id !== 0);

    return allUsers
      .filter((u) => juryIds.includes(u.id))
      .map((u) => ({ ...u } as JuryMember));
  }, [juryUserIds, allUsers]);

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
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
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
    },
  });

  const nonJuryUsers = useMemo(() => {
    if (!allUsers || !juryMembers) return [];
    const juryIds = new Set(juryMembers.map((j) => j.id));
    return allUsers.filter((u) => !juryIds.has(u.id));
  }, [allUsers, juryMembers]);

  const filteredJury = useMemo(() => {
    if (!searchJury.trim()) return juryMembers;
    const q = searchJury.toLowerCase();
    return juryMembers.filter(
      (j) =>
        j.first_name?.toLowerCase().includes(q) ||
        j.last_name?.toLowerCase().includes(q) ||
        j.email?.toLowerCase().includes(q)
    );
  }, [juryMembers, searchJury]);

  const filteredUsers = useMemo(() => {
    if (!searchUsers.trim()) return nonJuryUsers;
    const q = searchUsers.toLowerCase();
    return nonJuryUsers.filter(
      (u) =>
        u.first_name?.toLowerCase().includes(q) ||
        u.last_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [nonJuryUsers, searchUsers]);

  const juryPagination = usePagination({
    data: filteredJury,
    defaultPerPage: 15,
    maxPerPage: 15,
  });

  const usersPagination = usePagination({
    data: filteredUsers,
    defaultPerPage: 15,
    maxPerPage: 15,
  });

  const getPageNumbers = (page: number, pages: number) => {
    const nums: (number | string)[] = [];
    for (let i = 1; i <= pages; i++) {
      if (
        i === 1 ||
        i === pages ||
        (i >= page - 2 && i <= page + 2)
      ) {
        nums.push(i);
      } else if (nums[nums.length - 1] !== "...") {
        nums.push("...");
      }
    }
    return nums;
  };

  const handleRemoveJury = (userId: number) => {
    if (!selectedTournament) return;
    if (
      !window.confirm(
        "Are you sure you want to remove this jury member?"
      )
    )
      return;
    removeJuryMutation.mutate({
      userId,
      tournamentId: Number(selectedTournament),
    });
  };

  const isLoading = juryIdsLoading || usersLoading;

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
            setSelectedTournament(Number(e.target.value) || "");
            setSearchJury("");
            setSearchUsers("");
            juryPagination.resetPage();
            usersPagination.resetPage();
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
                Current Jury ({juryMembers.length})
              </h2>
              <input
                type="text"
                placeholder="Search jury members..."
                className={styles.searchInput}
                value={searchJury}
                onChange={(e) => {
                  setSearchJury(e.target.value);
                  juryPagination.resetPage();
                }}
              />
            </div>

            {isLoading ? (
              <div className={styles.loading}>Loading jury members…</div>
            ) : juryPagination.paginatedData.length > 0 ? (
              <>
                <div className={styles.list}>
                  {juryPagination.paginatedData.map((member) => (
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

                {filteredJury.length > 15 && (
                  <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                      Showing <b>{juryPagination.startIndex + 1}</b>–<b>{juryPagination.endIndex}</b> of <b>{juryPagination.totalItems}</b>
                      <select
                        className={styles.perPageSelect}
                        value={juryPagination.itemsPerPage}
                        onChange={(e) => juryPagination.setItemsPerPage(Number(e.target.value))}
                      >
                        <option value={5}>5 / page</option>
                        <option value={10}>10 / page</option>
                        <option value={15}>15 / page</option>
                      </select>
                    </div>

                    <div className={styles.paginationControls}>
                      <button
                        className={styles.pageBtn}
                        disabled={juryPagination.currentPage === 1}
                        onClick={() => juryPagination.goToPage(juryPagination.currentPage - 1)}
                      >
                        ← Prev
                      </button>

                      {getPageNumbers(juryPagination.currentPage, juryPagination.totalPages).map((p, i) =>
                        p === "..." ? (
                          <span key={`dots-${i}`} className={styles.pageDots}>…</span>
                        ) : (
                          <button
                            key={p}
                            className={`${styles.pageBtn} ${
                              juryPagination.currentPage === p ? styles.pageBtnActive : ""
                            }`}
                            onClick={() => juryPagination.goToPage(p as number)}
                          >
                            {p}
                          </button>
                        )
                      )}

                      <button
                        className={styles.pageBtn}
                        disabled={juryPagination.currentPage === juryPagination.totalPages}
                        onClick={() => juryPagination.goToPage(juryPagination.currentPage + 1)}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.empty}>
                {searchJury.trim()
                  ? "No jury members match your search"
                  : "No jury assigned yet"}
              </div>
            )}
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Available Users ({nonJuryUsers.length})
              </h2>
              <input
                type="text"
                placeholder="Search users..."
                className={styles.searchInput}
                value={searchUsers}
                onChange={(e) => {
                  setSearchUsers(e.target.value);
                  usersPagination.resetPage();
                }}
              />
            </div>

            {usersLoading ? (
              <div className={styles.loading}>Loading users…</div>
            ) : usersPagination.paginatedData.length === 0 ? (
              <div className={styles.empty}>
                {searchUsers.trim()
                  ? "No users match your search"
                  : "No available users"}
              </div>
            ) : (
              <>
                <div className={styles.list}>
                  {usersPagination.paginatedData.map((user) => (
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

                {filteredUsers.length > 15 && (
                  <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                      Showing <b>{usersPagination.startIndex + 1}</b>–<b>{usersPagination.endIndex}</b> of <b>{usersPagination.totalItems}</b>
                      <select
                        className={styles.perPageSelect}
                        value={usersPagination.itemsPerPage}
                        onChange={(e) => usersPagination.setItemsPerPage(Number(e.target.value))}
                      >
                        <option value={5}>5 / page</option>
                        <option value={10}>10 / page</option>
                        <option value={15}>15 / page</option>
                      </select>
                    </div>

                    <div className={styles.paginationControls}>
                      <button
                        className={styles.pageBtn}
                        disabled={usersPagination.currentPage === 1}
                        onClick={() => usersPagination.goToPage(usersPagination.currentPage - 1)}
                      >
                        ← Prev
                      </button>

                      {getPageNumbers(usersPagination.currentPage, usersPagination.totalPages).map((p, i) =>
                        p === "..." ? (
                          <span key={`dots-${i}`} className={styles.pageDots}>…</span>
                        ) : (
                          <button
                            key={p}
                            className={`${styles.pageBtn} ${
                              usersPagination.currentPage === p ? styles.pageBtnActive : ""
                            }`}
                            onClick={() => usersPagination.goToPage(p as number)}
                          >
                            {p}
                          </button>
                        )
                      )}

                      <button
                        className={styles.pageBtn}
                        disabled={usersPagination.currentPage === usersPagination.totalPages}
                        onClick={() => usersPagination.goToPage(usersPagination.currentPage + 1)}
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}