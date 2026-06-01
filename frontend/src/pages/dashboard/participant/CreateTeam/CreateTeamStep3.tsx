import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCreateTeam } from "@/features/teams/hooks/useCreateTeam";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import type { Tournament } from "@/services/api";
import styles from "./CreateTeam.module.css";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CreateTeamStep3() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createTeam = useCreateTeam();
  const { data: allTournaments, isLoading, error } = useTournaments();

  const [selectedTournamentId, setSelectedTournamentId] = useState<
    number | null
  >(null);
  const [validationError, setValidationError] = useState<string | null>(
    null
  );
  const [search, setSearch] = useState("");

  const tournaments = useMemo(() => {
    if (!allTournaments) return [];
    const now = new Date();
    return allTournaments
      .filter((t) => {
        if (t.status !== "Registration") return false;
        return now <= new Date(t.registration_end_date);
      })
      .sort(
        (a, b) =>
          new Date(a.registration_end_date).getTime() -
          new Date(b.registration_end_date).getTime()
      );
  }, [allTournaments]);

  const filteredTournaments = useMemo(() => {
    if (!search.trim()) return tournaments;
    const q = search.toLowerCase();
    return tournaments.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [tournaments, search]);

  const selectedTournament = useMemo(
    () => tournaments.find((t) => t.id === selectedTournamentId),
    [tournaments, selectedTournamentId]
  );

  const onSubmit = async () => {
    if (!selectedTournamentId) {
      setValidationError(
        "Please select a tournament to register your team."
      );
      return;
    }

    const step1Data = JSON.parse(
      sessionStorage.getItem("createTeam_step1") || "{}"
    );
    const verifiedMembers = JSON.parse(
      sessionStorage.getItem("createTeam_verifiedMembers") || "[]"
    );
    const pendingMembers = JSON.parse(
      sessionStorage.getItem("createTeam_pendingMembers") || "[]"
    );

    if (!step1Data.name) {
      navigate("/app/participant/team/create/step1");
      return;
    }

    try {
      await createTeam.mutateAsync({
        ...step1Data,
        tournament_id: selectedTournamentId,
        verifiedMembers,
        pendingMembers,
      });

      sessionStorage.removeItem("createTeam_step1");
      sessionStorage.removeItem("createTeam_verifiedMembers");
      sessionStorage.removeItem("createTeam_pendingMembers");

      navigate("/app/participant/team/create/success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create team";
      setValidationError(message);
      console.error("Failed to create team:", err);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Team creation</h1>
        <div className={styles.user}>
          <span className={styles.userName}>
            {user?.first_name || "User"}
          </span>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.registration}>
          <div className={styles.registrationContent}>
            <div className={styles.registrationHeader}>
              <h2 className={styles.registrationTitle}>
                Step 3: Select Tournament
              </h2>
              <p className={styles.registrationSubtitle}>
                Choose a tournament to register your team for. Only
                tournaments with open registration are shown.
              </p>
            </div>

            {isLoading ? (
              <p className={styles.loadingText}>Loading tournaments…</p>
            ) : error ? (
              <p className={styles.errorText}>
                Failed to load tournaments.
              </p>
            ) : tournaments.length === 0 ? (
              <div className={styles.emptyStateSmall}>
                <p className={styles.emptyText}>
                  No tournaments with open registration at the moment.
                </p>
                <p className={styles.emptySubtext}>
                  Check back later or contact the organizer.
                </p>
              </div>
            ) : (
              <>
                <div className={styles.searchField}>
                  <input
                    type="text"
                    placeholder="Search tournaments by name or description..."
                    className={styles.input}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSelectedTournamentId(null);
                      setValidationError(null);
                    }}
                    autoComplete="off"
                  />
                </div>

                <div className={styles.tournamentList}>
                  {filteredTournaments.map((t) => (
                    <TournamentOption
                      key={t.id}
                      tournament={t}
                      selected={selectedTournamentId === t.id}
                      onSelect={() => {
                        setSelectedTournamentId(t.id);
                        setValidationError(null);
                      }}
                    />
                  ))}
                </div>

                {search.trim() && filteredTournaments.length === 0 && (
                  <p className={styles.emptyText} style={{ marginTop: 16 }}>
                    No tournaments match your search.
                  </p>
                )}
              </>
            )}

            {selectedTournament && (
              <div className={styles.tournamentMeta}>
                <span>
                  Team size: {selectedTournament.min_user_count}-
                  {selectedTournament.max_user_count} members
                </span>
              </div>
            )}

            {validationError && (
              <p
                className={styles.fieldError}
                style={{ marginTop: 12 }}
              >
                {validationError}
              </p>
            )}

            {createTeam.isError && (
              <p className={styles.errorText}>
                Failed to create team. Please try again.
              </p>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() =>
                  navigate("/app/participant/team/create/step2")
                }
              >
                ← Previous
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={onSubmit}
                disabled={
                  createTeam.isPending || tournaments.length === 0
                }
              >
                {createTeam.isPending
                  ? "Creating…"
                  : "Create & Register Team"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TournamentOption({
  tournament,
  selected,
  onSelect,
}: {
  tournament: Tournament;
  selected: boolean;
  onSelect: () => void;
}) {
  const daysLeft = useMemo(() => {
    const end = new Date(tournament.registration_end_date);
    const now = new Date();
    return Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  }, [tournament.registration_end_date]);

  return (
    <button
      type="button"
      className={`${styles.tournamentOption} ${
        selected ? styles.tournamentOptionSelected : ""
      }`}
      onClick={onSelect}
    >
      <div className={styles.tournamentOptionHeader}>
        <span className={styles.tournamentOptionName}>
          {tournament.name}
        </span>
        <span
          className={`${styles.tournamentOptionStatus} ${styles.statusOpen}`}
        >
          <span className={styles.dot} />
          Registration open
        </span>
      </div>
      <p className={styles.tournamentOptionDesc}>
        {tournament.description}
      </p>
      <div className={styles.tournamentOptionMeta}>
        <span>Closes: {formatDate(tournament.registration_end_date)}</span>
        <span className={daysLeft <= 3 ? styles.urgent : ""}>
          {daysLeft > 0
            ? `${daysLeft} day(s) left`
            : "Closing today"}
        </span>
      </div>
    </button>
  );
}