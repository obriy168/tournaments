import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTask, useUpdateTask } from "@/features/organizer/hooks/useTasks"
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import type { Task } from "@/services/api";
import styles from "./TaskFormModal.module.css";

const taskSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    specifications: z.string().min(1, "Specifications are required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    tournament_id: z.number().min(1, "Tournament is required"),
  })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: "End date must be after start date",
    path: ["end_date"],
  });

type TaskForm = z.infer<typeof taskSchema>;

interface Props {
  task: Task | null;
  defaultTournamentId?: number;
  onClose: () => void;
}

export default function TaskFormModal({ task, defaultTournamentId = 0, onClose }: Props) {
  const isEdit = !!task;
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const { data: tournaments, isLoading: tournamentsLoading } = useTournaments();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
    setValue,
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: "",
      description: "",
      specifications: "",
      start_date: "",
      end_date: "",
      tournament_id: defaultTournamentId || 0,
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        name: task.name,
        description: task.description,
        specifications: task.specifications,
        start_date: task.start_date.slice(0, 16),
        end_date: task.end_date.slice(0, 16),
        tournament_id: task.tournament_id,
      });
    } else if (defaultTournamentId && defaultTournamentId > 0) {
      setValue("tournament_id", defaultTournamentId);
    }
  }, [task, defaultTournamentId, reset, setValue]);

  const onSubmit = (data: TaskForm) => {
    const payload = {
      ...data,
      status: (task?.status || "Draft") as Task["status"],
    };

    if (isEdit && task) {
      updateMutation.mutate(
        { id: task.id, data: payload },
        {
          onSuccess: () => onClose(),
          onError: (err) =>
            setError("root", {
              message: err instanceof Error ? err.message : "Update failed",
            }),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onClose(),
        onError: (err) =>
          setError("root", {
            message: err instanceof Error ? err.message : "Create failed",
          }),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEdit ? "Edit Task" : "Create Task"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          {errors.root && <p className={styles.rootError}>{errors.root.message}</p>}

          <div className={styles.field}>
            <label className={styles.label}>Tournament *</label>
            {tournamentsLoading ? (
              <p className={styles.loadingText}>Loading tournaments…</p>
            ) : (
              <select
                className={`${styles.input} ${errors.tournament_id ? styles.inputError : ""}`}
                {...register("tournament_id", { valueAsNumber: true })}
                disabled={isEdit}
              >
                <option value={0}>Select a tournament...</option>
                {(tournaments || []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
            {errors.tournament_id && (
              <span className={styles.fieldError}>{errors.tournament_id.message}</span>
            )}
            {isEdit && (
              <span className={styles.hintText}>Tournament cannot be changed after creation</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Name *</label>
            <input
              className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              {...register("name")}
            />
            {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description *</label>
            <textarea
              rows={3}
              className={`${styles.input} ${errors.description ? styles.inputError : ""}`}
              {...register("description")}
            />
            {errors.description && (
              <span className={styles.fieldError}>{errors.description.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Specifications *</label>
            <textarea
              rows={3}
              className={`${styles.input} ${errors.specifications ? styles.inputError : ""}`}
              {...register("specifications")}
            />
            {errors.specifications && (
              <span className={styles.fieldError}>{errors.specifications.message}</span>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Start Date *</label>
              <input
                type="datetime-local"
                className={`${styles.input} ${errors.start_date ? styles.inputError : ""}`}
                {...register("start_date")}
              />
              {errors.start_date && (
                <span className={styles.fieldError}>{errors.start_date.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>End Date *</label>
              <input
                type="datetime-local"
                className={`${styles.input} ${errors.end_date ? styles.inputError : ""}`}
                {...register("end_date")}
              />
              {errors.end_date && (
                <span className={styles.fieldError}>{errors.end_date.message}</span>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}