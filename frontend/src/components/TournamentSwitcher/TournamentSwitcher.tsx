import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import styles from "./TournamentSwitcher.module.css";

interface TournamentOption {
  id: number;
  name: string;
  role: string;
  key: string;
}

function normalizeRole(role: string): string {
  return role.toLowerCase().trim();
}

export default function TournamentSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const activeTournamentId = useAuthStore((s) => s.activeTournamentId);
  const activeRole = useAuthStore((s) => s.activeRole);
  const setActiveTournament = useAuthStore((s) => s.setActiveTournament);
  const { data: tournaments, isLoading } = useTournaments();

  if (isLoading) {
    return (
      <div className={styles.switcher}>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  const options: TournamentOption[] = [];
  if (user?.roles && tournaments) {
    for (const r of user.roles) {
      if (!r.tournament_id) continue;
      const t = tournaments.find((tour) => tour.id === r.tournament_id);
      options.push({
        id: r.tournament_id,
        name: t?.name || `Tournament #${r.tournament_id}`,
        role: r.role,
        key: `${r.tournament_id}-${normalizeRole(r.role)}`,
      });
    }
  }

  if (options.length <= 1) return null;

  const currentValue = activeTournamentId && activeRole
    ? `${activeTournamentId}-${activeRole}`
    : options[0]?.key || "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value;
    const selectedOption = options.find((o) => o.key === selectedKey);
    if (!selectedOption) return;

    const newId = selectedOption.id;
    const newRole = normalizeRole(selectedOption.role);

    setActiveTournament(newId, newRole);

    const path = newRole === "captain" ? "participant" : newRole;
    const targetPath = `/app/${path}`;

    if (location.pathname !== targetPath && !location.pathname.startsWith(targetPath)) {
      navigate(targetPath, { replace: true });
    }
  };

  return (
    <div className={styles.switcher}>
      <label className={styles.label}>Active Tournament</label>
      <select
        className={styles.select}
        value={currentValue}
        onChange={handleChange}
      >
        {options.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.name} ({opt.role})
          </option>
        ))}
      </select>
    </div>
  );
}