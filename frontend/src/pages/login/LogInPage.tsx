import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import styles from "../../features/auth/components/Auth.module.css";

export default function LogInPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const user = await login(email, password);
      navigate(`/app/${user.role}`, { replace: true });
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <section className={styles.auth}>
      <div className={styles.auth__container}>
        <h1 className={styles.auth__title}>Welcome back</h1>
        {error && (
          <p style={{ color: "#dc2626", textAlign: "center", marginBottom: 16 }}>
            {error}
          </p>
        )}
        <form className={styles.auth__form} onSubmit={handleSubmit}>
          <div className={styles.auth__field}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className={styles.auth__input}
            />
          </div>
          <div className={styles.auth__field}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className={styles.auth__input}
            />
          </div>
          <button type="submit" className={styles.auth__button}>
            Log in
          </button>
        </form>
        <p className={styles.auth__footer}>
          Don't have an account?{" "}
          <Link to="/signup" className={styles.auth__link}>
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}