import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { registerUser } from "@/services/api";
import { getAuthErrorMessage } from "@/features/auth/utils/errors";
import styles from "@/features/auth/components/Auth.module.css";

const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  accepted_terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms of Use and Privacy Policy",
  }),
});

type RegisterForm = z.infer<typeof registerSchema>;

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
    defaultValues: {
      accepted_terms: false,
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data);
    } catch (err: unknown) {
      setError("root", { message: getAuthErrorMessage(err) });
      return;
    }

    try {
      const user = await login(data.email, data.password);
      const rolePath = user.role === "captain" ? "participant" : user.role;
      navigate(`/app/${rolePath}`, { replace: true });
    } catch {
      setError("root", {
        message: "Account created, but automatic login failed. Please log in manually.",
      });
    }
  };

  return (
    <section className={styles.auth}>
      <div className={styles.auth__container}>
        <h1 className={styles.auth__title}>Create an account</h1>

        {errors.root && (
          <p role="alert" className={styles.rootError}>
            {errors.root.message}
          </p>
        )}

        <form className={styles.auth__form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.auth__field__row}>
            <div style={{ flex: 1 }}>
              <input
                id="first_name"
                type="text"
                placeholder="First name"
                autoFocus
                disabled={isSubmitting}
                aria-label="First name"
                aria-invalid={!!errors.first_name}
                aria-describedby={errors.first_name ? "first_name-error" : undefined}
                className={`${styles.auth__input} ${errors.first_name ? styles.auth__inputError : ""}`}
                {...register("first_name")}
              />
              {errors.first_name && (
                <span id="first_name-error" role="alert" className={styles.fieldError}>
                  {errors.first_name.message}
                </span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <input
                id="last_name"
                type="text"
                placeholder="Last name"
                disabled={isSubmitting}
                aria-label="Last name"
                aria-invalid={!!errors.last_name}
                aria-describedby={errors.last_name ? "last_name-error" : undefined}
                className={`${styles.auth__input} ${errors.last_name ? styles.auth__inputError : ""}`}
                {...register("last_name")}
              />
              {errors.last_name && (
                <span id="last_name-error" role="alert" className={styles.fieldError}>
                  {errors.last_name.message}
                </span>
              )}
            </div>
          </div>

          <div className={styles.auth__field}>
            <input
              id="email"
              type="email"
              placeholder="Email"
              disabled={isSubmitting}
              aria-label="Email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`${styles.auth__input} ${errors.email ? styles.auth__inputError : ""}`}
              {...register("email")}
            />
            {errors.email && (
              <span id="email-error" role="alert" className={styles.fieldError}>
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
              <span id="password-error" role="alert" className={styles.fieldError}>
                {errors.password.message}
              </span>
            )}
          </div>

          <div className={styles.auth__field}>
            <label
              className={`${styles.checkboxLabel} ${errors.accepted_terms ? styles.checkboxLabelError : ""}`}
            >
              <input
                type="checkbox"
                disabled={isSubmitting}
                aria-invalid={!!errors.accepted_terms}
                aria-describedby={errors.accepted_terms ? "terms-error" : undefined}
                {...register("accepted_terms")}
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" target="_blank" className={styles.auth__link}>
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link to="/privacy" target="_blank" className={styles.auth__link}>
                  Privacy and Cookie Policy
                </Link>
              </span>
            </label>
            {errors.accepted_terms && (
              <span id="terms-error" role="alert" className={styles.fieldError}>
                {errors.accepted_terms.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={styles.auth__button}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
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