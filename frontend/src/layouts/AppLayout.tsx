import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";

const SIDEBAR_WIDTH = 260;

export default function AppLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main
        style={{
          flex: 1,
          padding: "40px",
          marginLeft: `${SIDEBAR_WIDTH}px`,
          minWidth: 0,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}