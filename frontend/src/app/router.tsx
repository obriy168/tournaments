import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import { RequireAuth, PublicOnly, RoleGuard, RoleRedirect } from "./guards";
import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthorizationLayout";
import AppLayout from "../layouts/AppLayout";
import SplashScreen from "../components/SplashScreen/SplashScreen";

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

const router = createBrowserRouter([
  {
    element: <PublicOnly />,
    children: [
      {
        element: <PublicLayout />,
        children: [{ path: "/", element: <Suspense fallback={null}><MainPage /></Suspense> }],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <Suspense fallback={null}><LogInPage /></Suspense> },
          { path: "/signup", element: <Suspense fallback={null}><SignUpPage /></Suspense> },
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
          { path: "/app/profile", element: <Suspense fallback={null}><ProfilePage /></Suspense> },
          {
            element: <RoleGuard allowed={["admin"]} />,
            children: [
              { path: "/app/admin", element: <Suspense fallback={null}><AdminDashboard /></Suspense> },
              { path: "/app/admin/tournaments", element: <Suspense fallback={null}><AdminTournaments /></Suspense> },
              { path: "/app/admin/teams", element: <Suspense fallback={null}><AdminTeams /></Suspense> },
              { path: "/app/admin/jury", element: <Suspense fallback={null}><AdminJury /></Suspense> },
              { path: "/app/admin/*", element: <Navigate to="/app/admin" replace /> },
            ],
          },
          {
            element: <RoleGuard allowed={["jury"]} />,
            children: [
              { path: "/app/jury", element: <Suspense fallback={null}><JuryDashboard /></Suspense> },
              { path: "/app/jury/assignments", element: <Suspense fallback={null}><JuryAssignments /></Suspense> },
              { path: "/app/jury/evaluation", element: <Suspense fallback={null}><JuryEvaluation /></Suspense> },
              { path: "/app/jury/*", element: <Navigate to="/app/jury" replace /> },
            ],
          },
          {
            element: <RoleGuard allowed={["participant"]} />,
            children: [
              { path: "/app/participant", element: <Suspense fallback={null}><ParticipantDashboard /></Suspense> },
              { path: "/app/participant/team", element: <Suspense fallback={null}><ParticipantMyTeam /></Suspense> },
              { path: "/app/participant/submissions", element: <Suspense fallback={null}><ParticipantSubmissions /></Suspense> },
              { path: "/app/participant/*", element: <Navigate to="/app/participant" replace /> },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
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