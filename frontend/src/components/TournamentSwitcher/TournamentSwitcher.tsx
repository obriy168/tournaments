import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import styles from "./TournamentSwitcher.module.css";

export default function TournamentSwitcher() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const activeTournamentId = useAuthStore((s) => s.activeTournamentId);
  const setActiveTournament = useAuthStore((s) => s.setActiveTournament);
  const { data: tournaments, isLoading } = useTournaments();

  const roles = user?.roles;
  let options: { id: number; name: string; role: string }[] = [];
  if (roles && tournaments) {
    options = roles
      .filter((r): r is { role: string; tournament_id: number } => !!r.tournament_id)
      .map((r) => {
        const t = tournaments.find((tour) => tour.id === r.tournament_id);
        return {
          id: r.tournament_id,
          name: t?.name || `Tournament #${r.tournament_id}`,
          role: r.role,
        };
      });
  }

  if (isLoading) {
    return (
      <div className={styles.switcher}>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  if (options.length <= 1) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = Number(e.target.value);
    const roleEntry = user?.roles?.find((r) => r.tournament_id === newId);
    const newRole = roleEntry ? roleEntry.role.toLowerCase() : user?.role || "participant";

    setActiveTournament(newId);

    const path = newRole === "captain" ? "participant" : newRole;
    navigate(`/app/${path}`, { replace: true });
    window.location.reload();
  };

  return (
    <div className={styles.switcher}>
      <label className={styles.label}>Active Tournament</label>
      <select
        className={styles.select}
        value={activeTournamentId ?? ""}
        onChange={handleChange}
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name} ({opt.role})
          </option>
        ))}
      </select>
    </div>
  );
}