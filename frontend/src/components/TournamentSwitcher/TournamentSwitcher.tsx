import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import { useMemo } from "react";
import styles from "./TournamentSwitcher.module.css";

interface TournamentOption {
  id: number | null;
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

  const isGlobalAdmin = useMemo(() => {
    if (!user?.roles) return false;
    return user.roles.some(
      (r) => !r.tournament_id && normalizeRole(r.role) === "admin"
    );
  }, [user]);

  const options = useMemo(() => {
    const opts: TournamentOption[] = [];
    if (!user?.roles || !tournaments) return opts;

    if (isGlobalAdmin) {
      opts.push({
        id: null,
        name: "All Tournaments",
        role: "admin",
        key: "global-admin",
      });
      return opts;
    }

    for (const r of user.roles) {
      if (!r.tournament_id) continue;
      const t = tournaments.find((tour) => tour.id === r.tournament_id);
      const normalizedRole = normalizeRole(r.role);
      opts.push({
        id: r.tournament_id,
        name: t?.name || `Tournament #${r.tournament_id}`,
        role: normalizedRole,
        key: `${r.tournament_id}-${normalizedRole}`,
      });
    }

    return opts;
  }, [user, tournaments, isGlobalAdmin]);

  const currentValue = useMemo(() => {
    if (isGlobalAdmin) {
      return "global-admin";
    }

    const normalizedActiveRole = activeRole ? normalizeRole(activeRole) : null;

    if (activeTournamentId && normalizedActiveRole) {
      const match = options.find(
        (o) => o.id === activeTournamentId && o.role === normalizedActiveRole
      );
      if (match) return match.key;
    }

    if (activeTournamentId) {
      const matchById = options.find((o) => o.id === activeTournamentId);
      if (matchById) return matchById.key;
    }

    return options[0]?.key ?? "";
  }, [activeTournamentId, activeRole, options, isGlobalAdmin]);

  if (isLoading) {
    return (
      <div className={styles.switcher}>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  if (!isGlobalAdmin && options.length <= 1) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value;
    const selectedOption = options.find((o) => o.key === selectedKey);
    if (!selectedOption) return;

    const newId = selectedOption.id;
    const newRole = selectedOption.role;

    if (newId === null) {
      setActiveTournament(0, newRole);
    } else {
      setActiveTournament(newId, newRole);
    }

    const path = newRole === "captain" ? "participant" : newRole;
    const targetPath = `/app/${path}`;

    if (location.pathname !== targetPath && !location.pathname.startsWith(targetPath)) {
      navigate(targetPath, { replace: true });
    }
  };

  return (
    <div className={styles.switcher}>
      <label className={styles.label}>Active Tournament</label>
      <select className={styles.select} value={currentValue} onChange={handleChange}>
        {options.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.name} ({opt.role})
          </option>
        ))}
      </select>
    </div>
  );
}