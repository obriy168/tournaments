import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTeams, getTournament } from "@/services/api";
import styles from "./AdminTeams.module.css";

export default function AdminTeams() {
  const [search, setSearch] = useState("");

  const { data: teams, isLoading } = useQuery({
    queryKey: ["all-teams"],
    queryFn: getTeams,
  });

  const tournamentIds = useMemo(
    () => [...new Set((teams || []).map((t) => t.tournament_id).filter(Boolean))],
    [teams]
  );

  const tournamentQueries = useQuery({
    queryKey: ["tournament-names", tournamentIds],
    queryFn: async () => {
      const results = await Promise.all(
        tournamentIds.map((id) => getTournament(id!))
      );
      return Object.fromEntries(results.map((t) => [t.id, t.name]));
    },
    enabled: tournamentIds.length > 0,
  });

  const tournamentNames = tournamentQueries.data || {};

  const filtered = useMemo(() => {
    if (!teams) return [];
    let res = [...teams];
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter((t) => t.name.toLowerCase().includes(q));
    }
    return res;
  }, [teams, search]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Teams</h1>
          <p className={styles.subtitle}>All registered teams</p>
        </div>
        <input
          type="text"
          placeholder="Search teams..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {isLoading ? (
        <div className={styles.loading}>Loading teams…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No teams found</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Team Name</th>
                <th>Tournament</th>
                <th>City</th>
                <th>Organization</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((team) => (
                <tr key={team.id}>
                  <td className={styles.cellName}>{team.name}</td>
                  <td>
                    {team.tournament_id
                      ? tournamentNames[team.tournament_id] || `Tournament #${team.tournament_id}`
                      : "Not registered"}
                  </td>
                  <td>{team.city}</td>
                  <td>{team.organization}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}