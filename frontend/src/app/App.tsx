import { AuthProvider } from "@/features/auth/context/AuthContext";
import AppRouter from "./router/router";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;