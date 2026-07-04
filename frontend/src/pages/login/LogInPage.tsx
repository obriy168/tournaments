import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import EyeToggle from "@/components/EyeToggle/EyeToggle";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/authStore";
import { getAuthErrorMessage } from "@/features/auth/utils/errors";
import { resetSessionExpired } from "@/services/api";
import styles from "@/features/auth/components/Auth.module.css";
import { useTranslation } from "react-i18next";

interface LocationState {
  from?: { pathname: string };
}

export default function LogInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    resetSessionExpired();
  }, []);

  const loginSchema = z.object({
    email: z.string().email(t("loginpage.errors.invalidEmail")),
    password: z.string().min(1, t("loginpage.errors.passwordRequired")),
  });

  type LoginForm = z.infer<typeof loginSchema>;

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

      const state = location.state as LocationState | null;
      const from = state?.from?.pathname;

      if (from) {
        navigate(from, { replace: true });
        return;
      }

      const { activeRole } = useAuthStore.getState();
      const effectiveRole = activeRole || user.role;
      const rolePath =
        effectiveRole === "captain" ? "participant" : effectiveRole;

      navigate(`/app/${rolePath}`, { replace: true });
    } catch (err: unknown) {
      setError("root", { type: "manual", message: getAuthErrorMessage(err) });
    }
  };

  return (
    <section className={styles.auth}>
      <div className={styles.auth__container}>
        <h1 className={styles.auth__title}>{t("loginpage.title")}</h1>

        {errors.root && (
          <p role="alert" className={styles.rootError}>
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
              id="email"
              type="email"
              placeholder={t("loginpage.email")}
              autoFocus
              disabled={isSubmitting}
              aria-label={t("loginpage.email")}
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
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("loginpage.password")}
                disabled={isSubmitting}
                aria-label={t("loginpage.password")}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className={`${styles.auth__input} ${styles.auth__inputPassword} ${errors.password ? styles.auth__inputError : ""}`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword
                    ? t("loginpage.hidePassword")
                    : t("loginpage.showPassword")
                }
                aria-pressed={showPassword}
                disabled={isSubmitting}
                className={styles.eyeButton}
              >
                <EyeToggle visible={showPassword} />
              </button>
            </div>
            {errors.password && (
              <span
                id="password-error"
                role="alert"
                className={styles.fieldError}
              >
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
            {isSubmitting ? t("loginpage.submitting") : t("loginpage.submit")}
          </button>
        </form>

        <p className={styles.auth__footer}>
          {t("loginpage.signupPrompt")}{" "}
          <Link to="/signup" className={styles.auth__link}>
            {t("loginpage.signupLink")}
          </Link>
        </p>
      </div>
    </section>
  );
}