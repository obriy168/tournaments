import { lazy, Suspense, Component, type ReactNode, useEffect } from "react";
import { createBrowserRouter, Navigate, RouterProvider, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { RequireAuth, PublicOnly, RoleGuard, RoleRedirect } from "@/app/guards/guards";
import PublicLayout from "@/layouts/public/PublicLayout";
import AuthLayout from "@/layouts/authorization/AuthorizationLayout";
import AppLayout from "@/layouts/app/AppLayout";
import SplashScreen from "@/components/SplashScreen/SplashScreen";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import styles from "./Router.module.css";

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
        <div className={styles.errorBoundary}>
          <h2>Something went wrong loading this page.</h2>
          <button onClick={() => window.location.reload()} className={styles.reloadBtn}>
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ErrorBoundaryWrapper({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <RouteErrorBoundary key={location.pathname}>
      {children}
    </RouteErrorBoundary>
  );
}

function ScrollToTopWrapper() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

function SessionGuard() {
  const { initializing, user } = useAuth();

  useEffect(() => {
    const handler = () => {
      window.location.href = "/login";
    };
    window.addEventListener("skyline:session-expired", handler);
    return () => window.removeEventListener("skyline:session-expired", handler);
  }, []);

  useEffect(() => {
    if (!initializing && !user) {
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/signup") {
        const isExpired = (() => {
          try {
            return localStorage.getItem("skyline_auth") === null;
          } catch {
            return true;
          }
        })();
        if (isExpired) {
          window.location.href = "/login";
        }
      }
    }
  }, [initializing, user]);

  return <Outlet />;
}

function PageLoader() {
  return (
    <div className={styles.pageLoader}>
      <div className={styles.loaderBar}>
        <div className={styles.loaderProgress} />
      </div>
    </div>
  );
}

const MainPage = lazy(() => import("@/pages/main-page/MainPage"));
const LogInPage = lazy(() => import("@/pages/login/LogInPage"));
const SignUpPage = lazy(() => import("@/pages/sign-up/SignUpPage"));
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const PrivacyPage = lazy(() => import("@/pages/legal/privacy/PrivacyCookiePage"));
const TermsPage = lazy(() => import("@/pages/legal/terms/TermsPage"));
const AdminDashboard = lazy(() => import("@/pages/dashboard/admin/dashboard/AdminDashboard"));
const AdminTournaments = lazy(() => import("@/pages/dashboard/admin/tournaments/AdminTournaments"));
const AdminTeams = lazy(() => import("@/pages/dashboard/admin/teams/AdminTeams"));
const AdminJury = lazy(() => import("@/pages/dashboard/admin/jury/AdminJury"));
const AdminTasks = lazy(() => import("@/pages/dashboard/admin/tasks/AdminTasks"));
const AdminRounds = lazy(() => import("@/pages/dashboard/admin/rounds/AdminRounds"));
const AdminSubmissions = lazy(() => import("@/pages/dashboard/admin/submissions/AdminSubmissions"));
const JuryDashboard = lazy(() => import("@/pages/dashboard/jury/JuryDashboard"));
const JuryAssignments = lazy(() => import("@/pages/dashboard/jury/JuryAssignments"));
const JuryEvaluation = lazy(() => import("@/pages/dashboard/jury/JuryEvaluation"));
const ParticipantDashboard = lazy(() => import("@/pages/dashboard/participant/dashboard/ParticipantDashboard"));
const ParticipantMyTeam = lazy(() => import("@/pages/dashboard/participant/MyTeam/ParticipantMyTeam"));
const ParticipantSubmissions = lazy(() => import("@/pages/dashboard/participant/submissions/ParticipantSubmissions"));
const TournamentPage = lazy(() => import("@/pages/dashboard/participant/Tournament/TournamentPage"));
const CreateTeamStep1 = lazy(() => import("@/pages/dashboard/participant/CreateTeam/CreateTeamStep1"));
const CreateTeamStep2 = lazy(() => import("@/pages/dashboard/participant/CreateTeam/CreateTeamStep2"));
const CreateTeamStep3 = lazy(() => import("@/pages/dashboard/participant/CreateTeam/CreateTeamStep3"));
const CreateTeamSuccess = lazy(() => import("@/pages/dashboard/participant/CreateTeam/CreateTeamSuccess"));
const OrganizerDashboard = lazy(() => import("@/pages/dashboard/organizer/OrganizerDashboard"));
const OrganizerTournaments = lazy(() => import("@/pages/dashboard/organizer/OrganizerTournaments"));

const wrap = (node: ReactNode) => (
  <ErrorBoundaryWrapper>
    <Suspense fallback={<PageLoader />}>{node}</Suspense>
  </ErrorBoundaryWrapper>
);

const router = createBrowserRouter([
  {
    element: <ScrollToTopWrapper />,
    children: [
      {
        element: <SessionGuard />,
        children: [
          {
            element: <PublicLayout />,
            children: [
              { path: "/", element: wrap(<MainPage />) },
              { path: "/privacy", element: wrap(<PrivacyPage />) },
              { path: "/terms", element: wrap(<TermsPage />) },
            ],
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
                  {
                    element: <RoleGuard allowed={["admin"]} />,
                    children: [
                      { path: "/app/admin", element: wrap(<AdminDashboard />) },
                      { path: "/app/admin/tournaments", element: wrap(<AdminTournaments />) },
                      { path: "/app/admin/teams", element: wrap(<AdminTeams />) },
                      { path: "/app/admin/rounds", element: wrap(<AdminRounds />) },
                      { path: "/app/admin/jury", element: wrap(<AdminJury />) },
                      { path: "/app/admin/tasks", element: wrap(<AdminTasks />) },
                      { path: "/app/admin/submissions", element: wrap(<AdminSubmissions />) },
                      { path: "/app/admin/*", element: <Navigate to="/app/admin" replace /> },
                    ],
                  },
                  {
                    element: <RoleGuard allowed={["organizer"]} />,
                    children: [
                      { path: "/app/organizer", element: wrap(<OrganizerDashboard />) },
                      { path: "/app/organizer/tournaments", element: wrap(<OrganizerTournaments />) },
                      { path: "/app/organizer/*", element: <Navigate to="/app/organizer" replace /> },
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
                      { path: "/app/participant/team/create/step1", element: wrap(<CreateTeamStep1 />) },
                      { path: "/app/participant/team/create/step2", element: wrap(<CreateTeamStep2 />) },
                      { path: "/app/participant/team/create/step3", element: wrap(<CreateTeamStep3 />) },
                      { path: "/app/participant/team/create/success", element: wrap(<CreateTeamSuccess />) },
                      { path: "/app/participant/team", element: wrap(<ParticipantMyTeam />) },
                      { path: "/app/participant/tournament", element: wrap(<TournamentPage />) },
                      { path: "/app/participant/submissions", element: wrap(<ParticipantSubmissions />) },
                      { path: "/app/participant/*", element: <Navigate to="/app/participant" replace /> },
                    ],
                  },
                  { path: "/app", element: <RoleRedirect /> },
                  { path: "/app/profile", element: wrap(<ProfilePage />) },
                ],
              },
            ],
          },
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);

export default function AppRouter() {
  const { initializing } = useAuth();
  return (
    <>
      <SplashScreen visible={initializing} />
      <RouterProvider router={router} />
    </>
  );
}