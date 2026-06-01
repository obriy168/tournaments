import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar/Sidebar";
import { useAuthStore } from "@/features/auth/store/authStore";
import styles from "./AppLayout.module.css";

export default function AppLayout() {
  const activeTournamentId = useAuthStore((s) => s.activeTournamentId);

  return (
    <div className={styles.layout} key={activeTournamentId ?? "no-tournament"}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}