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
});

export type Step1Data = z.infer<typeof step1Schema>;

export default function CreateTeamStep1() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
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
          <span className={styles.userName}>{user?.first_name || "User"}</span>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.registration}>
          <div className={styles.registrationContent}>
            <div className={styles.registrationHeader}>
              <h2 className={styles.registrationTitle}>Step 1: Team Details</h2>
              <p className={styles.registrationSubtitle}>
                Provide the foundational details for your team.
                You will register for tournaments after team creation.
              </p>
            </div>

            <form className={styles.registrationForm} onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.field}>
                <label className={styles.label}>Team Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Byte Bandits"
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  {...register("name")}
                />
                {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>City *</label>
                <input
                  type="text"
                  placeholder="e.g. New York"
                  className={`${styles.input} ${errors.city ? styles.inputError : ""}`}
                  {...register("city")}
                />
                {errors.city && <span className={styles.fieldError}>{errors.city.message}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>School / Organization *</label>
                <input
                  type="text"
                  placeholder="e.g. University of Technology"
                  className={`${styles.input} ${errors.organization ? styles.inputError : ""}`}
                  {...register("organization")}
                />
                {errors.organization && <span className={styles.fieldError}>{errors.organization.message}</span>}
              </div>

              <div className={styles.actions}>
                <div></div>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
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