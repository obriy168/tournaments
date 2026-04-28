import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import { FooterMinimal } from "../components/Footer/Footer";

export default function AuthLayout() {
  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <FooterMinimal />
    </>
  );
}