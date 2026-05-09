import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCreateTeam } from "@/features/teams/hooks/useCreateTeam";
import styles from "./CreateTeam.module.css";

export default function CreateTeamStep3() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createTeam = useCreateTeam();
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");

  const onSubmit = async () => {
    const step1Data = JSON.parse(sessionStorage.getItem("createTeam_step1") || "{}");
    const verifiedMembers = JSON.parse(
      sessionStorage.getItem("createTeam_verifiedMembers") || "[]"
    );
    const pendingMembers = JSON.parse(
      sessionStorage.getItem("createTeam_pendingMembers") || "[]"
    );

    if (!step1Data.name) {
      navigate("/app/participant/team/create/step1");
      return;
    }

    try {
      await createTeam.mutateAsync({
        ...step1Data,
        verifiedMembers,
        pendingMembers,
      });

      sessionStorage.removeItem("createTeam_step1");
      sessionStorage.removeItem("createTeam_verifiedMembers");
      sessionStorage.removeItem("createTeam_pendingMembers");

      navigate("/app/participant/team/create/success");
    } catch (err) {
      console.error("Failed to create team:", err);
    }
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
              <h2 className={styles.registrationTitle}>Step 3: Contact Info</h2>
              <p className={styles.registrationSubtitle}>
                Provide communication details for the team captain.
                You will register for tournaments after team creation.
              </p>
            </div>

            <div className={styles.registrationForm}>
              <div className={styles.field}>
                <label className={styles.label}>Captain Phone Number *</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Telegram/Discord username *</label>
                <input
                  type="text"
                  placeholder="@username"
                  className={styles.input}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {createTeam.isError && (
              <p className={styles.errorText}>
                Failed to create team. Please try again.
              </p>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => navigate("/app/participant/team/create/step2")}
              >
                ← Previous
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={onSubmit}
                disabled={createTeam.isPending}
              >
                {createTeam.isPending ? "Creating..." : "Create Team"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}