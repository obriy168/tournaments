import { Outlet } from "react-router-dom";
import Header from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";
import styles from "./PublicLayout.module.css";

export default function PublicLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}