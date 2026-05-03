import { Outlet } from "react-router-dom";
import Header from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";

export default function PublicLayout() {
  return (
    <>
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}