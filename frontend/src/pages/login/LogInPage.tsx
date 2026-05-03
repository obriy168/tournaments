import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getAuthErrorMessage } from "@/features/auth/utils/errors";
import styles from "@/features/auth/components/Auth.module.css";

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
    clearErrors,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    clearErrors("root");
    try {
      const user = await login(data.email, data.password);
      const rolePath = user.role === "captain" ? "participant" : user.role;
      const state = location.state as LocationState | null;
      const from = state?.from?.pathname || `/app/${rolePath}`;
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError("root", { type: "manual", message: getAuthErrorMessage(err) });
    }
  };

  return (
    <section className={styles.auth}>
      <div className={styles.auth__container}>
        <h1 className={styles.auth__title}>Welcome back</h1>

        {errors.root && (
          <p role="alert" style={{ color: "#dc2626", textAlign: "center", marginBottom: 16 }}>
            {errors.root.message}
          </p>
        )}

        <form className={styles.auth__form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.auth__field}>
            <input
              id="email"
              type="email"
              placeholder="Email"
              autoFocus
              disabled={isSubmitting}
              aria-label="Email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`${styles.auth__input} ${errors.email ? styles.auth__inputError : ""}`}
              {...register("email")}
            />
            {errors.email && (
              <span id="email-error" role="alert" style={{ color: "#dc2626", fontSize: 13, marginTop: 4, display: "block" }}>
                {errors.email.message}
              </span>
            )}
          </div>

          <div className={styles.auth__field}>
            <input
              id="password"
              type="password"
              placeholder="Password"
              disabled={isSubmitting}
              aria-label="Password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={`${styles.auth__input} ${errors.password ? styles.auth__inputError : ""}`}
              {...register("password")}
            />
            {errors.password && (
              <span id="password-error" role="alert" style={{ color: "#dc2626", fontSize: 13, marginTop: 4, display: "block" }}>
                {errors.password.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={styles.auth__button}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
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