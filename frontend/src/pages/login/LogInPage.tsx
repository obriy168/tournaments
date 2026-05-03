import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import styles from "../../features/auth/components/Auth.module.css";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LocationState {
  from?: { pathname: string };
}

export default function LogInPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const user = await login(data.email, data.password);
      const rolePath = user.role === "captain" ? "participant" : user.role;
      const state = location.state as LocationState | null;
      const from = state?.from?.pathname || `/app/${rolePath}`;
      navigate(from, { replace: true });
    } catch {
      setError("root", { message: "Invalid email or password" });
    }
  };

  return (
    <section className={styles.auth}>
      <div className={styles.auth__container}>
        <h1 className={styles.auth__title}>Welcome back</h1>

        {errors.root && (
          <p
            style={{ color: "#dc2626", textAlign: "center", marginBottom: 16 }}
          >
            {errors.root.message}
          </p>
        )}

        <form
          className={styles.auth__form}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className={styles.auth__field}>
            <input
              type="email"
              placeholder="Email"
              autoFocus
              className={`${styles.auth__input} ${errors.email ? styles.auth__inputError : ""}`}
              {...register("email")}
            />
            {errors.email && (
              <span
                style={{
                  color: "#dc2626",
                  fontSize: 13,
                  marginTop: 4,
                  display: "block",
                }}
              >
                {errors.email.message}
              </span>
            )}
          </div>

          <div className={styles.auth__field}>
            <input
              type="password"
              placeholder="Password"
              className={`${styles.auth__input} ${errors.password ? styles.auth__inputError : ""}`}
              {...register("password")}
            />
            {errors.password && (
              <span
                style={{
                  color: "#dc2626",
                  fontSize: 13,
                  marginTop: 4,
                  display: "block",
                }}
              >
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={styles.auth__button}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in…" : "Log in"}
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