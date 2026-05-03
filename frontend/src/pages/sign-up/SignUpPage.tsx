import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { registerUser } from "../../services/api";
import styles from "../../features/auth/components/Auth.module.css";

const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

function isApiError(
  err: unknown,
): err is { response?: { data?: { detail?: string } } } {
  return typeof err === "object" && err !== null && "response" in err;
}

export default function SignUpPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data);
    } catch (err: unknown) {
      const message =
        isApiError(err) && err.response?.data?.detail
          ? err.response.data.detail
          : "Registration failed. Please try again.";
      setError("root", { message });
      return;
    }

    try {
      await login(data.email, data.password);
      navigate("/app", { replace: true });
    } catch {
      setError("root", {
        message:
          "Account created, but automatic login failed. Please log in manually.",
      });
    }
  };

  return (
    <section className={styles.auth}>
      <div className={styles.auth__container}>
        <h1 className={styles.auth__title}>Create an account</h1>

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
          <div className={styles.auth__field__row}>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="First name"
                autoFocus
                className={`${styles.auth__input} ${errors.first_name ? styles.auth__inputError : ""}`}
                {...register("first_name")}
              />
              {errors.first_name && (
                <span
                  style={{
                    color: "#dc2626",
                    fontSize: 13,
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  {errors.first_name.message}
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Last name"
                className={`${styles.auth__input} ${errors.last_name ? styles.auth__inputError : ""}`}
                {...register("last_name")}
              />
              {errors.last_name && (
                <span
                  style={{
                    color: "#dc2626",
                    fontSize: 13,
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  {errors.last_name.message}
                </span>
              )}
            </div>
          </div>

          <div className={styles.auth__field}>
            <input
              type="email"
              placeholder="Email"
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
            {isSubmitting ? "Signing up…" : "Sign up"}
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