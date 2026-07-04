import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import EyeToggle from "@/components/EyeToggle/EyeToggle";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { registerUser } from "@/services/api";
import { getAuthErrorMessage } from "@/features/auth/utils/errors";
import styles from "@/features/auth/components/Auth.module.css";
import { useTranslation } from "react-i18next";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const registerSchema = z.object({
    first_name: z.string().min(1, t("signuppage.errors.firstNameRequired")),
    last_name: z.string().min(1, t("signuppage.errors.lastNameRequired")),
    email: z.string().email(t("signuppage.errors.invalidEmail")),
    password: z.string().min(8, t("signuppage.errors.passwordMin")),
    accepted_terms: z.boolean().refine((val) => val === true, {
      message: t("signuppage.errors.acceptTerms"),
    }),
  });

  type RegisterForm = z.infer<typeof registerSchema>;

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
        message: t("signuppage.autoLoginFailed"),
      });
    }
  };

  return (
    <section className={styles.auth}>
      <div className={styles.auth__container}>
        <h1 className={styles.auth__title}>{t("signuppage.title")}</h1>

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
          <div className={styles.auth__field__row}>
            <div>
              <input
                id="first_name"
                type="text"
                placeholder={t("signuppage.firstname")}
                autoFocus
                disabled={isSubmitting}
                aria-label={t("signuppage.firstname")}
                aria-invalid={!!errors.first_name}
                aria-describedby={
                  errors.first_name ? "first_name-error" : undefined
                }
                className={`${styles.auth__input} ${errors.first_name ? styles.auth__inputError : ""}`}
                {...register("first_name")}
              />
              {errors.first_name && (
                <span
                  id="first_name-error"
                  role="alert"
                  className={styles.fieldError}
                >
                  {errors.first_name.message}
                </span>
              )}
            </div>
            <div>
              <input
                id="last_name"
                type="text"
                placeholder={t("signuppage.lastname")}
                disabled={isSubmitting}
                aria-label={t("signuppage.lastname")}
                aria-invalid={!!errors.last_name}
                aria-describedby={
                  errors.last_name ? "last_name-error" : undefined
                }
                className={`${styles.auth__input} ${errors.last_name ? styles.auth__inputError : ""}`}
                {...register("last_name")}
              />
              {errors.last_name && (
                <span
                  id="last_name-error"
                  role="alert"
                  className={styles.fieldError}
                >
                  {errors.last_name.message}
                </span>
              )}
            </div>
          </div>

          <div className={styles.auth__field}>
            <input
              id="email"
              type="email"
              placeholder={t("signuppage.email")}
              disabled={isSubmitting}
              aria-label={t("signuppage.email")}
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
                placeholder={t("signuppage.password")}
                disabled={isSubmitting}
                aria-label={t("signuppage.password")}
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
                    ? t("signuppage.hidePassword")
                    : t("signuppage.showPassword")
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

          <div className={styles.auth__field}>
            <label
              className={`${styles.checkboxLabel} ${errors.accepted_terms ? styles.checkboxLabelError : ""}`}
            >
              <input
                type="checkbox"
                disabled={isSubmitting}
                aria-invalid={!!errors.accepted_terms}
                aria-describedby={
                  errors.accepted_terms ? "terms-error" : undefined
                }
                {...register("accepted_terms")}
              />
              <span>
                {t("signuppage.termsAgree")}{" "}
                <Link to="/terms" target="_blank" className={styles.auth__link}>
                  {t("footer.terms")}
                </Link>{" "}
                {t("signuppage.and")}{" "}
                <Link
                  to="/privacy"
                  target="_blank"
                  className={styles.auth__link}
                >
                  {t("footer.privacy")}
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
            {isSubmitting ? t("signuppage.submitting") : t("signuppage.submit")}
          </button>
        </form>

        <p className={styles.auth__footer}>
          {t("signuppage.loginPrompt")}{" "}
          <Link to="/login" className={styles.auth__link}>
            {t("header.login")}
          </Link>
        </p>
      </div>
    </section>
  );
}