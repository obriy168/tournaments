import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { registerUser } from "../../services/api";
import styles from "../../features/auth/components/Auth.module.css";

export default function SignUpPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const first_name = formData.get("first_name") as string;
    const last_name = formData.get("last_name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await registerUser({ first_name, last_name, email, password });
      await login(email, password);
      navigate("/app", { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.auth}>
      <div className={styles.auth__container}>
        <h1 className={styles.auth__title}>Create an account</h1>
        {error && (
          <p style={{ color: "#dc2626", textAlign: "center", marginBottom: 16 }}>
            {error}
          </p>
        )}
        <form className={styles.auth__form} onSubmit={handleSubmit}>
          <div className={styles.auth__field__row}>
            <input
              type="text"
              name="first_name"
              placeholder="First name"
              required
              className={styles.auth__input}
              id="first_name"
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last name"
              required
              className={styles.auth__input}
              id="last_name"
            />
          </div>
          <div className={styles.auth__field}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className={styles.auth__input}
              id="email"
            />
          </div>
          <div className={styles.auth__field}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              minLength={6}
              className={styles.auth__input}
              id="password"
            />
          </div>
          <button type="submit" className={styles.auth__button} disabled={isSubmitting}>
            {isSubmitting ? "Signing up..." : "Sign up"}
          </button>
        </form>
        <p className={styles.auth__footer}>
          Already have an account?{" "}
          <Link to="/login" className={styles.auth__link}>
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}