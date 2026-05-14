import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import styles from "./CreateTeam.module.css";

const step1Schema = z.object({
  name: z.string().min(1, "Team name is required"),
  city: z.string().min(1, "City is required"),
  organization: z.string().min(1, "Organization is required"),
  captain_phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .regex(/^[\d\s+\-()]+$/, "Invalid phone format"),
  captain_contact: z
    .string()
    .min(3, "Telegram or Discord username is required"),
});

export type Step1Data = z.infer<typeof step1Schema>;

export default function CreateTeamStep1() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const saved = sessionStorage.getItem("createTeam_step1");
  const savedData: Partial<Step1Data> = saved ? JSON.parse(saved) : {};

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: savedData.name || "",
      city: savedData.city || "",
      organization: savedData.organization || "",
      captain_phone: savedData.captain_phone || "",
      captain_contact: savedData.captain_contact || "",
    },
  });

  const onSubmit = (data: Step1Data) => {
    sessionStorage.setItem("createTeam_step1", JSON.stringify(data));
    navigate("/app/participant/team/create/step2");
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Team creation</h1>
        <div className={styles.user}>
          <span className={styles.userName}>
            {user?.first_name || "User"}
          </span>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.registration}>
          <div className={styles.registrationContent}>
            <div className={styles.registrationHeader}>
              <h2 className={styles.registrationTitle}>
                Step 1: Team Details
              </h2>
              <p className={styles.registrationSubtitle}>
                Provide the foundational details for your team. You will
                add members and select a tournament in the next steps.
              </p>
            </div>

            <div className={styles.captainCard}>
              <div className={styles.captainAvatar}>
                {(user?.first_name?.[0] || "U") +
                  (user?.last_name?.[0] || "")}
              </div>
              <div className={styles.captainInfo}>
                <span className={styles.captainLabel}>Team Captain</span>
                <span className={styles.captainName}>
                  {user?.first_name} {user?.last_name}
                </span>
                <span className={styles.captainEmail}>{user?.email}</span>
              </div>
            </div>

            <form
              className={styles.registrationForm}
              onSubmit={handleSubmit(onSubmit)}
              autoComplete="off"
            >
              <div className={styles.field}>
                <label className={styles.label}>Team Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Byte Bandits"
                  className={`${styles.input} ${
                    errors.name ? styles.inputError : ""
                  }`}
                  {...register("name")}
                  autoComplete="off"
                />
                {errors.name && (
                  <span className={styles.fieldError}>
                    {errors.name.message}
                  </span>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={`${styles.field} ${styles.fieldHalf}`}>
                  <label className={styles.label}>City *</label>
                  <input
                    type="text"
                    placeholder="e.g. New York"
                    className={`${styles.input} ${
                      errors.city ? styles.inputError : ""
                    }`}
                    {...register("city")}
                    autoComplete="off"
                  />
                  {errors.city && (
                    <span className={styles.fieldError}>
                      {errors.city.message}
                    </span>
                  )}
                </div>

                <div className={`${styles.field} ${styles.fieldHalf}`}>
                  <label className={styles.label}>
                    School / Organization *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. University of Technology"
                    className={`${styles.input} ${
                      errors.organization ? styles.inputError : ""
                    }`}
                    {...register("organization")}
                    autoComplete="off"
                  />
                  {errors.organization && (
                    <span className={styles.fieldError}>
                      {errors.organization.message}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.divider} />

              <p className={styles.sectionLabel}>Captain Contact</p>

              <div className={styles.formRow}>
                <div className={`${styles.field} ${styles.fieldHalf}`}>
                  <label className={styles.label}>Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className={`${styles.input} ${
                      errors.captain_phone ? styles.inputError : ""
                    }`}
                    {...register("captain_phone")}
                    autoComplete="off"
                  />
                  {errors.captain_phone && (
                    <span className={styles.fieldError}>
                      {errors.captain_phone.message}
                    </span>
                  )}
                </div>

                <div className={`${styles.field} ${styles.fieldHalf}`}>
                  <label className={styles.label}>
                    Telegram / Discord *
                  </label>
                  <input
                    type="text"
                    placeholder="@username"
                    className={`${styles.input} ${
                      errors.captain_contact ? styles.inputError : ""
                    }`}
                    {...register("captain_contact")}
                    autoComplete="off"
                  />
                  {errors.captain_contact && (
                    <span className={styles.fieldError}>
                      {errors.captain_contact.message}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.actions}>
                <div />
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                >
                  Next Step →
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}