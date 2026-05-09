import { Outlet } from "react-router-dom";
import Header from "@/components/Header/Header";
import { FooterMinimal } from "@/components/Footer/Footer";
import styles from "./AuthorizationLayout.module.css";

export default function AuthLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <FooterMinimal />
    </div>
  );
}