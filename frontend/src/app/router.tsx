import { lazy, Suspense, Component, type ReactNode } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { RequireAuth, PublicOnly, RoleGuard, RoleRedirect } from "./guards";
import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthorizationLayout";
import AppLayout from "../layouts/AppLayout";
import SplashScreen from "../components/SplashScreen/SplashScreen";

class RouteErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error("Route error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          <h2>Something went wrong loading this page.</h2>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: "10px 24px",
              border: "2px solid black",
              borderRadius: 12,
              background: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainPage = lazy(() => import("../pages/main-page/MainPage"));
const LogInPage = lazy(() => import("../pages/login/LogInPage"));
const SignUpPage = lazy(() => import("../pages/sign-up/SignUpPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const AdminDashboard = lazy(() => import("../pages/dashboard/admin/AdminDashboard"));
const AdminTournaments = lazy(() => import("../pages/dashboard/admin/AdminTournaments"));
const AdminTeams = lazy(() => import("../pages/dashboard/admin/AdminTeams"));
const AdminJury = lazy(() => import("../pages/dashboard/admin/AdminJury"));
const JuryDashboard = lazy(() => import("../pages/dashboard/jury/JuryDashboard"));
const JuryAssignments = lazy(() => import("../pages/dashboard/jury/JuryAssignments"));
const JuryEvaluation = lazy(() => import("../pages/dashboard/jury/JuryEvaluation"));
const ParticipantDashboard = lazy(() => import("../pages/dashboard/participant/ParticipantDashboard"));
const ParticipantMyTeam = lazy(() => import("../pages/dashboard/participant/ParticipantMyTeam"));
const ParticipantSubmissions = lazy(() => import("../pages/dashboard/participant/ParticipantSubmissions"));

const wrap = (node: ReactNode) => (
  <RouteErrorBoundary>
    <Suspense fallback={null}>{node}</Suspense>
  </RouteErrorBoundary>
);

const router = createBrowserRouter(
  [
    {
      element: <PublicLayout />,
      children: [{ path: "/", element: wrap(<MainPage />) }],
    },

    {
      element: <PublicOnly />,
      children: [
        {
          element: <AuthLayout />,
          children: [
            { path: "/login", element: wrap(<LogInPage />) },
            { path: "/signup", element: wrap(<SignUpPage />) },
          ],
        },
      ],
    },

    {
      element: <RequireAuth />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { path: "/app", element: <RoleRedirect /> },
            { path: "/app/profile", element: wrap(<ProfilePage />) },
            {
              element: <RoleGuard allowed={["admin"]} />,
              children: [
                { path: "/app/admin", element: wrap(<AdminDashboard />) },
                { path: "/app/admin/tournaments", element: wrap(<AdminTournaments />) },
                { path: "/app/admin/teams", element: wrap(<AdminTeams />) },
                { path: "/app/admin/jury", element: wrap(<AdminJury />) },
                { path: "/app/admin/*", element: <Navigate to="/app/admin" replace /> },
              ],
            },
            {
              element: <RoleGuard allowed={["jury"]} />,
              children: [
                { path: "/app/jury", element: wrap(<JuryDashboard />) },
                { path: "/app/jury/assignments", element: wrap(<JuryAssignments />) },
                { path: "/app/jury/evaluation", element: wrap(<JuryEvaluation />) },
                { path: "/app/jury/*", element: <Navigate to="/app/jury" replace /> },
              ],
            },
            {
              element: <RoleGuard allowed={["participant", "captain"]} />,
              children: [
                { path: "/app/participant", element: wrap(<ParticipantDashboard />) },
                { path: "/app/participant/team", element: wrap(<ParticipantMyTeam />) },
                { path: "/app/participant/submissions", element: wrap(<ParticipantSubmissions />) },
                { path: "/app/participant/*", element: <Navigate to="/app/participant" replace /> },
              ],
            },
          ],
        },
      ],
    },
    { path: "*", element: <Navigate to="/" replace /> },
  ]
);

export default function AppRouter() {
  const { initializing } = useAuth();
  return (
    <>
      <SplashScreen visible={initializing} />
      <RouterProvider router={router} />
    </>
  );
}