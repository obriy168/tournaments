import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import TournamentCard from "@/features/Tournaments/components/tournamentCard/TournamentCard";
import styles from "./MainPage.module.css";

type FilterStatus = "All" | "Registration" | "Running" | "Finished";

const STATUS_ORDER: Record<string, number> = {
  Running: 0,
  Registration: 1,
  Draft: 2,
  Finished: 3,
};

export default function MainPage() {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useTournaments();
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!initializing && user) {
      const rolePath = user.role === "captain" ? "participant" : user.role;
      navigate(`/app/${rolePath}`, { replace: true });
    }
  }, [user, initializing, navigate]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let res = [...data];

    if (filter !== "All") {
      res = res.filter((t) => t.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    res.sort((a, b) => {
      const orderDiff =
        (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
      if (orderDiff !== 0) return orderDiff;

      if (a.status === "Running" || a.status === "Draft") {
        return (
          new Date(a.start_date).getTime() -
          new Date(b.start_date).getTime()
        );
      }
      if (a.status === "Registration") {
        return (
          new Date(a.registration_end_date).getTime() -
          new Date(b.registration_end_date).getTime()
        );
      }
      return (
        new Date(b.start_date).getTime() -
        new Date(a.start_date).getTime()
      );
    });

    return res;
  }, [data, filter, search]);

  const displayed = showAll ? filtered : filtered.slice(0, 6);
  const hasMore = filtered.length > 6;

  const content = useMemo(() => {
    if (isLoading)
      return <div className={styles.loading}>Loading tournaments…</div>;
    if (error)
      return (
        <div className={styles.error}>
          <p>{error.message}</p>
          <button onClick={() => refetch()} className={styles.retry}>
            Retry
          </button>
        </div>
      );
    if (!filtered || filtered.length === 0)
      return (
        <div className={styles.empty}>No tournaments match your criteria.</div>
      );

    return (
      <>
        <div className={styles.tournaments__grid}>
          {displayed.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
        {hasMore && !showAll && (
          <div className={styles.showMoreWrap}>
            <button
              className={styles.showMoreBtn}
              onClick={() => setShowAll(true)}
            >
              Show all {filtered.length} tournaments
            </button>
          </div>
        )}
      </>
    );
  }, [isLoading, error, filtered, displayed, hasMore, showAll, refetch]);

  if (initializing || user) return null;

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.hero__container}>
          <h1 className={styles.hero__title}>Welcome to Skyline</h1>
          <p className={styles.hero__description}>
            Join the world's most prestigious online programming tournaments.
          </p>
          <Link to="/login" className={styles.hero__button}>
            Join a Tournament
          </Link>
        </div>
      </section>

      <section className={styles.tournaments}>
        <div className={styles.tournaments__container}>
          <h2 className={styles.tournaments__title}>Active Tournaments</h2>
          <p className={styles.tournaments__description}>
            Check out the tournaments currently in progress.
          </p>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              {(
                ["All", "Registration", "Running", "Finished"] as FilterStatus[]
              ).map((f) => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${
                    filter === f ? styles.filterBtnActive : ""
                  }`}
                  onClick={() => {
                    setFilter(f);
                    setShowAll(false);
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search tournaments..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowAll(false);
              }}
            />
          </div>

          <div className={styles.tournaments__content}>{content}</div>
        </div>
      </section>
    </>
  );
}