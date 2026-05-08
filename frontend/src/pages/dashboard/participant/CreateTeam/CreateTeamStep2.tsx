import { useState, useRef, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUserLookup } from "@/features/users/hooks/useUserLookup";
import styles from "./CreateTeam.module.css";

const memberSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

type MemberData = z.infer<typeof memberSchema>;

export interface TeamMember {
  id: number;
  fullName: string;
  email: string;
  userId?: number;
  isLead: boolean;
}

export default function CreateTeamStep2() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lookupEmail, setLookupEmail] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<MemberData | null>(null);
  const idCounter = useRef(1);
  const processedEmail = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberData>({
    resolver: zodResolver(memberSchema),
  });

  const { data: foundUser, isLoading: isLookingUp } = useUserLookup(
    lookupEmail || ""
  );

  useEffect(() => {
    if (
      lookupEmail &&
      !isLookingUp &&
      foundUser !== undefined &&
      lookupEmail !== processedEmail.current
    ) {
      processedEmail.current = lookupEmail;

      if (foundUser && pendingData) {
        const newMember: TeamMember = {
          id: idCounter.current++,
          fullName: `${foundUser.first_name} ${foundUser.last_name}`,
          email: pendingData.email.toLowerCase().trim(),
          userId: foundUser.id,
          isLead: false,
        };
        setMembers((prev) => [...prev, newMember]);
        setError(null);
        reset();
      } else if (pendingData) {
        setError(
          `User ${lookupEmail} is not registered. Ask them to sign up first, then add them again.`
        );
      }

      setLookupEmail(null);
      setPendingData(null);
    }
  }, [lookupEmail, isLookingUp, foundUser, pendingData, reset]);

  const onAddMember = useCallback(
    (data: MemberData) => {
      setError(null);

      const alreadyAdded = members.some(
        (m) => m.email.toLowerCase() === data.email.toLowerCase()
      );
      if (alreadyAdded) {
        setError("This email is already added to the team.");
        return;
      }

      if (data.email.toLowerCase() === user?.email?.toLowerCase()) {
        setError("You are already the team lead.");
        return;
      }

      setPendingData(data);
      setLookupEmail(data.email);
    },
    [members, user?.email]
  );

  const handleAddMember = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleSubmit(onAddMember)(e);
    },
    [handleSubmit, onAddMember]
  );

  const onRemoveMember = useCallback((id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setError(null);
  }, []);

  const onNext = useCallback(() => {
    const verifiedMembers = members.filter((m) => m.userId);
    const pendingMembers = members.filter((m) => !m.userId);

    sessionStorage.setItem(
      "createTeam_verifiedMembers",
      JSON.stringify(verifiedMembers)
    );
    sessionStorage.setItem(
      "createTeam_pendingMembers",
      JSON.stringify(pendingMembers)
    );

    navigate("/app/participant/team/create/step3");
  }, [members, navigate]);

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
              <h2 className={styles.registrationTitle}>Step 2: Team Members</h2>
              <p className={styles.registrationSubtitle}>
                Add registered team members by email. They must have an account to join automatically.
              </p>
            </div>

            <div className={styles.formInline}>
              <p className={styles.sectionTitle}>Add a Member</p>

              <form className={styles.formRow} onSubmit={handleAddMember}>
                <div className={styles.field}>
                  <label className={styles.label}>Full Name *</label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    className={`${styles.input} ${errors.fullName ? styles.inputError : ""}`}
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <span className={styles.fieldError}>{errors.fullName.message}</span>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Email Address *</label>
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                    {...register("email")}
                  />
                  {errors.email && (
                    <span className={styles.fieldError}>{errors.email.message}</span>
                  )}
                </div>

                <button type="submit" className={styles.addBtn} disabled={isLookingUp}>
                  {isLookingUp ? "..." : "+ Add"}
                </button>
              </form>

              {error && (
                <p className={styles.fieldError} style={{ marginTop: 8 }}>
                  {error}
                </p>
              )}
            </div>

            <div className={styles.roster}>
              <p className={styles.sectionTitle}>Current Roster</p>

              <div className={styles.member}>
                <div className={styles.memberAvatar}>
                  {(user?.first_name?.[0] || "U") + (user?.last_name?.[0] || "")}
                </div>
                <div className={styles.memberInfo}>
                  <div className={styles.memberHeader}>
                    <span className={styles.memberName}>
                      {user?.first_name} {user?.last_name}
                    </span>
                    <span className={styles.memberRole}>Team Lead</span>
                  </div>
                  <span className={styles.memberEmail}>{user?.email}</span>
                </div>
              </div>

              {members.map((member) => (
                <div key={member.id} className={styles.member}>
                  <div className={styles.memberAvatar}>
                    {member.fullName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className={styles.memberInfo}>
                    <div className={styles.memberHeader}>
                      <span className={styles.memberName}>{member.fullName}</span>
                      {member.userId ? (
                        <span className={styles.memberRole} style={{ background: "#dcfce7", color: "#166534" }}>
                          Auto-join
                        </span>
                      ) : (
                        <span className={styles.memberRole} style={{ background: "#fee2e2", color: "#991b1b" }}>
                          Pending signup
                        </span>
                      )}
                    </div>
                    <span className={styles.memberEmail}>{member.email}</span>
                  </div>
                  <button
                    type="button"
                    className={styles.memberDelete}
                    onClick={() => onRemoveMember(member.id)}
                    aria-label={`Remove ${member.fullName}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => navigate("/app/participant/team/create/step1")}
              >
                ← Previous
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={onNext}
              >
                Next Step →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}