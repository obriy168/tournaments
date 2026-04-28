import { AuthProvider } from "../features/auth/context/AuthContext";
import AppRouter from "./router";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;