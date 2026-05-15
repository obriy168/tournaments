import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTeams } from "@/services/api";
import { useAuthStore } from "@/features/auth/store/authStore";
import TeamViewModal from "@/features/organizer/components/TeamViewModel/TeamViewModal";
import styles from "./OrganizerTeams.module.css";

export default function OrganizerTeams() {
  const activeTournamentId = useAuthStore((s) => s.activeTournamentId);
  const [search, setSearch] = useState("");
  const [viewingTeamId, setViewingTeamId] = useState<number | null>(null);

  const { data: allTeams, isLoading } = useQuery({
    queryKey: ["teams", activeTournamentId],
    queryFn: getTeams,
    enabled: !!activeTournamentId,
  });

  const filtered = useMemo(() => {
    if (!allTeams || !activeTournamentId) return [];
    
    let res = allTeams.filter(t => t.tournament_id === activeTournamentId);

    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter((t) => t.name.toLowerCase().includes(q));
    }
    return res;
  }, [allTeams, activeTournamentId, search]);

  if (!activeTournamentId) {
    return <div className={styles.empty}>Please select a tournament first.</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Teams</h1>
          <p className={styles.subtitle}>Registered teams for this tournament</p>
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
        <div className={styles.empty}>No teams found for this tournament.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Team Name</th>
                <th>City</th>
                <th>Organization</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((team) => (
                <tr key={team.id}>
                  <td className={styles.cellName}>{team.name}</td>
                  <td>{team.city}</td>
                  <td>{team.organization}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => setViewingTeamId(team.id)}
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TeamViewModal
        teamId={viewingTeamId}
        onClose={() => setViewingTeamId(null)}
      />
    </div>
  );
}