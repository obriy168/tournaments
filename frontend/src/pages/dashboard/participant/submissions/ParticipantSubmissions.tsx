import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useActiveTeam } from "@/features/teams/hooks/useActiveTeam";
import {
  useQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import {
  getTasks,
  getSubmissionsByTask,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  getRequirements,
  type Submission,
  type Task,
} from "@/services/api";
import styles from "./ParticipantSubmissions.module.css";

const submissionSchema = z.object({
  github_url: z
    .string()
    .min(1, "GitHub URL is required")
    .url("Invalid URL")
    .refine(
      (val) =>
        val.includes("github.com") ||
        val.includes("gitlab.com") ||
        val.includes("bitbucket.org"),
      { message: "Must be a GitHub, GitLab or Bitbucket URL" }
    ),
  video_url: z
    .string()
    .min(1, "Video URL is required")
    .url("Invalid URL")
    .refine(
      (val) =>
        val.includes("youtube.com") ||
        val.includes("youtu.be") ||
        val.includes("drive.google.com"),
      { message: "Must be a YouTube or Google Drive URL" }
    ),
  live_demo_url: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, "Description must be under 1000 characters")
    .optional(),
});

type SubmissionForm = z.infer<typeof submissionSchema>;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TaskSubmissionCard({
  task,
  teamId,
  existingSubmission,
  onSubmissionChange,
}: {
  task: Task;
  teamId: number;
  existingSubmission: Submission | undefined;
  onSubmissionChange: () => void;
}) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(!existingSubmission?.id);
  const [rootError, setRootError] = useState<string | null>(null);

  const { data: requirements, isLoading: reqLoading } = useQuery({
    queryKey: ["requirements", task.id],
    queryFn: () => getRequirements(task.id),
    enabled: !!task.id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionForm>({
    resolver: zodResolver(submissionSchema),
    defaultValues: existingSubmission
      ? {
          github_url: existingSubmission.github_url,
          video_url: existingSubmission.video_url,
          live_demo_url: existingSubmission.live_demo_url || "",
          description: existingSubmission.description || "",
        }
      : {},
  });

  const createMut = useMutation({
    mutationFn: (data: SubmissionForm) =>
      createSubmission({
        team_id: teamId,
        task_id: task.id,
        created_on: new Date().toISOString(),
        github_url: data.github_url.trim(),
        video_url: data.video_url.trim(),
        live_demo_url: data.live_demo_url?.trim() || undefined,
        description: data.description?.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["submissions", task.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["submissions-by-task", task.id],
      });
      onSubmissionChange();
      setIsEditing(false);
      setRootError(null);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to submit. Please try again.";
      setRootError(message);
    },
  });

  const updateMut = useMutation({
    mutationFn: (data: SubmissionForm) => {
      if (!existingSubmission?.id) throw new Error("No submission to update");
      return updateSubmission(existingSubmission.id, {
        team_id: teamId,
        task_id: task.id,
        created_on: existingSubmission.created_on,
        github_url: data.github_url.trim(),
        video_url: data.video_url.trim(),
        live_demo_url: data.live_demo_url?.trim() || undefined,
        description: data.description?.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["submissions", task.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["submissions-by-task", task.id],
      });
      onSubmissionChange();
      setIsEditing(false);
      setRootError(null);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to update submission. Please try again.";
      setRootError(message);
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => {
      if (!existingSubmission?.id) throw new Error("No submission to delete");
      return deleteSubmission(existingSubmission.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["submissions", task.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["submissions-by-task", task.id],
      });
      reset();
      setIsEditing(true);
      onSubmissionChange();
    },
    onError: () => setRootError("Failed to delete submission."),
  });

  const onSubmit = (data: SubmissionForm) => {
    setRootError(null);
    if (existingSubmission?.id) {
      updateMut.mutate(data);
    } else {
      createMut.mutate(data);
    }
  };

  const active = task.status === "Active";

  return (
    <div className={styles.taskCard}>
      <div className={styles.taskHeader}>
        <div>
          <h3 className={styles.taskName}>{task.name}</h3>
          <p className={styles.taskDesc}>{task.description}</p>
        </div>
        <span
          className={`${styles.taskStatusBadge} ${
            task.status === "Active"
              ? styles.statusActive
              : task.status === "SubmissionClosed" || task.status === "Evaluated"
              ? styles.statusClosed
              : styles.statusDraft
          }`}
        >
          {task.status === "Active" ? "Active" : task.status === "SubmissionClosed" ? "Closed" : task.status}
        </span>
      </div>

      <div className={styles.taskMeta}>
        <span>Starts: {formatDate(task.start_date)}</span>
        <span>Ends: {formatDate(task.end_date)}</span>
      </div>

      {reqLoading ? (
        <p className={styles.loadingText}>Loading requirements…</p>
      ) : requirements && requirements.length > 0 ? (
        <div className={styles.requirementsBlock}>
          <h4 className={styles.submissionTitle}>Requirements</h4>
          <ul className={styles.requirementsList}>
            {requirements.map((r) => (
              <li key={r.id} className={styles.requirementItem}>
                <span className={styles.requirementDot}>•</span>
                {r.description}{" "}
                <span className={styles.requirementScore}>
                  ({r.max_score} pts)
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {existingSubmission?.id && !isEditing ? (
        <div className={styles.submissionView}>
          <h4 className={styles.submissionTitle}>Your Submission</h4>
          <div className={styles.submissionField}>
            <span className={styles.submissionLabel}>GitHub</span>
            <a
              href={existingSubmission.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.submissionLink}
            >
              {existingSubmission.github_url}
            </a>
          </div>
          <div className={styles.submissionField}>
            <span className={styles.submissionLabel}>Video</span>
            <a
              href={existingSubmission.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.submissionLink}
            >
              {existingSubmission.video_url}
            </a>
          </div>
          {existingSubmission.live_demo_url && (
            <div className={styles.submissionField}>
              <span className={styles.submissionLabel}>Live Demo</span>
              <a
                href={existingSubmission.live_demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.submissionLink}
              >
                {existingSubmission.live_demo_url}
              </a>
            </div>
          )}
          {existingSubmission.description && (
            <div className={styles.submissionField}>
              <span className={styles.submissionLabel}>Description</span>
              <p className={styles.submissionText}>
                {existingSubmission.description}
              </p>
            </div>
          )}
          <div className={styles.submissionActions}>
            {active && (
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => setIsEditing(true)}
              >
                Edit Submission
              </button>
            )}
            <button
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this submission?"
                  )
                ) {
                  deleteMut.mutate();
                }
              }}
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      ) : active ? (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          {rootError && <p className={styles.rootError}>{rootError}</p>}

          <div className={styles.field}>
            <label className={styles.label}>GitHub Repository URL *</label>
            <input
              type="url"
              placeholder="https://github.com/your-team/project"
              className={`${styles.input} ${
                errors.github_url ? styles.inputError : ""
              }`}
              {...register("github_url")}
              autoComplete="off"
            />
            {errors.github_url && (
              <span className={styles.fieldError}>
                {errors.github_url.message}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Video Demo URL *</label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              className={`${styles.input} ${
                errors.video_url ? styles.inputError : ""
              }`}
              {...register("video_url")}
              autoComplete="off"
            />
            {errors.video_url && (
              <span className={styles.fieldError}>
                {errors.video_url.message}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Live Demo URL (optional)</label>
            <input
              type="url"
              placeholder="https://your-demo.vercel.app"
              className={`${styles.input} ${
                errors.live_demo_url ? styles.inputError : ""
              }`}
              {...register("live_demo_url")}
              autoComplete="off"
            />
            {errors.live_demo_url && (
              <span className={styles.fieldError}>
                {errors.live_demo_url.message}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description (optional)</label>
            <textarea
              rows={4}
              placeholder="Describe what you built, how to run it..."
              className={`${styles.input} ${styles.textarea}`}
              {...register("description")}
            />
            {errors.description && (
              <span className={styles.fieldError}>
                {errors.description.message}
              </span>
            )}
          </div>

          <div className={styles.actions}>
            {existingSubmission?.id && (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={
                isSubmitting || createMut.isPending || updateMut.isPending
              }
            >
              {existingSubmission?.id
                ? updateMut.isPending
                  ? "Updating…"
                  : "Update Submission"
                : createMut.isPending
                ? "Submitting…"
                : "Submit Solution"}
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.closedNotice}>
          <p>
            {task.status === "SubmissionClosed" || task.status === "Evaluated"
              ? "Submissions are closed."
              : "This task is not yet active."}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ParticipantSubmissions() {
  const { user } = useAuth();
  const { team, isLoading: teamsLoading, hasTeam } = useActiveTeam();
  const activeTournamentId = useAuthStore((s) => s.activeTournamentId);
  const teamId = team?.id;

  const queryClient = useQueryClient();
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: tasks,
    isLoading: tasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ["tasks", activeTournamentId],
    queryFn: () => getTasks(activeTournamentId!),
    enabled: !!activeTournamentId,
  });

  const {
    data: allSubmissions,
    isLoading: submissionsLoading,
  } = useQuery({
    queryKey: ["submissions-by-task", tasks?.map(t => t.id), teamId, refreshKey],
    queryFn: async () => {
      if (!tasks || tasks.length === 0 || !teamId) return [];
      const results: Array<{ taskId: number; submission: Submission | undefined }> = [];
      for (const task of tasks) {
        const all = await getSubmissionsByTask(task.id);
        const submission = all.find((s) => s.team_id === teamId);
        results.push({ taskId: task.id, submission });
      }
      return results;
    },
    enabled: !!teamId && !!tasks && tasks.length > 0,
  });

  const submissionsMap = useMemo(() => {
    const map = new Map<number, Submission>();
    allSubmissions?.forEach(({ taskId, submission }) => {
      if (submission) map.set(taskId, submission);
    });
    return map;
  }, [allSubmissions]);

  const handleSubmissionChange = () => {
    setRefreshKey(k => k + 1);
    queryClient.invalidateQueries({ queryKey: ["submissions-by-task"] });
  };

  if (teamsLoading || tasksLoading || submissionsLoading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Submissions</h1>
        </header>
        <p className={styles.loadingText}>Loading…</p>
      </div>
    );
  }

  if (!hasTeam) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Submissions</h1>
            <p className={styles.subtitle}>
              Create a team to access submissions.
            </p>
          </div>
          <div className={styles.user}>
            <span className={styles.userName}>
              {user?.first_name || "User"}
            </span>
          </div>
        </header>
        <div className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>No team</h2>
          <p className={styles.emptyText}>
            You need to create or join a team first.
          </p>
        </div>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Submissions</h1>
            <p className={styles.subtitle}>
              Submit your solutions for tournament tasks.
            </p>
          </div>
          <div className={styles.user}>
            <span className={styles.userName}>
              {user?.first_name || "User"}
            </span>
          </div>
        </header>
        <div className={styles.emptyState}>
          <p className={styles.errorText}>Failed to load tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Submissions</h1>
          <p className={styles.subtitle}>
            Submit your solutions for the tournament tasks.
          </p>
        </div>
        <div className={styles.user}>
          <span className={styles.userName}>
            {user?.first_name || "User"}
          </span>
        </div>
      </header>

      <div className={styles.content}>
        {!tasks || tasks.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              No tasks have been published for your tournament yet.
            </p>
          </div>
        ) : (
          <div className={styles.tasksList}>
            {tasks.map((task) => (
              <TaskSubmissionCard
                key={task.id}
                task={task}
                teamId={team!.id}
                existingSubmission={submissionsMap.get(task.id)}
                onSubmissionChange={handleSubmissionChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}