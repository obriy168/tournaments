import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateTournament,
  useUpdateTournament,
} from "@/features/admin/hooks/useTournamentMutations";
import type { Tournament } from "@/services/api";
import styles from "./TournamentFormModal.module.css";

const tournamentSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    start_date: z.string().min(1, "Start date is required"),
    registration_start_date: z.string().min(1, "Registration start is required"),
    registration_end_date: z.string().min(1, "Registration end is required"),
    max_teams: z.number().min(1, "Must be at least 1"),
    min_user_count: z.number().min(1, "Must be at least 1"),
    max_user_count: z.number().min(1, "Must be at least 1"),
  })
  .refine(
    (data) => new Date(data.registration_end_date) > new Date(data.registration_start_date),
    {
      message: "Registration end must be after start",
      path: ["registration_end_date"],
    }
  )
  .refine(
    (data) => new Date(data.start_date) > new Date(data.registration_end_date),
    {
      message: "Start date must be after registration end",
      path: ["start_date"],
    }
  )
  .refine((data) => data.max_user_count >= data.min_user_count, {
    message: "Max must be >= min",
    path: ["max_user_count"],
  });

type TournamentForm = z.infer<typeof tournamentSchema>;

interface Props {
  tournament: Tournament | null;
  onClose: () => void;
}

export default function TournamentFormModal({ tournament, onClose }: Props) {
  const isEdit = !!tournament;
  const createMutation = useCreateTournament();
  const updateMutation = useUpdateTournament();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<TournamentForm>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      name: "",
      description: "",
      start_date: "",
      registration_start_date: "",
      registration_end_date: "",
      max_teams: 10,
      min_user_count: 2,
      max_user_count: 5,
    },
  });

  useEffect(() => {
    if (tournament) {
      reset({
        name: tournament.name,
        description: tournament.description,
        start_date: tournament.start_date.slice(0, 16),
        registration_start_date: tournament.registration_start_date?.slice(0, 16) || "",
        registration_end_date: tournament.registration_end_date.slice(0, 16),
        max_teams: tournament.max_teams || 10,
        min_user_count: tournament.min_user_count || 2,
        max_user_count: tournament.max_user_count || 5,
      });
    }
  }, [tournament, reset]);

  const onSubmit = (data: TournamentForm) => {
    const payload = {
      ...data,
      status: (tournament?.status || "Draft") as Tournament["status"],
    };

    if (isEdit && tournament) {
      updateMutation.mutate(
        { id: tournament.id, data: payload },
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
            {isEdit ? "Edit Tournament" : "Create Tournament"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          {errors.root && <p className={styles.rootError}>{errors.root.message}</p>}

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

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Registration Start *</label>
              <input
                type="datetime-local"
                className={`${styles.input} ${
                  errors.registration_start_date ? styles.inputError : ""
                }`}
                {...register("registration_start_date")}
              />
              {errors.registration_start_date && (
                <span className={styles.fieldError}>
                  {errors.registration_start_date.message}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Registration End *</label>
              <input
                type="datetime-local"
                className={`${styles.input} ${
                  errors.registration_end_date ? styles.inputError : ""
                }`}
                {...register("registration_end_date")}
              />
              {errors.registration_end_date && (
                <span className={styles.fieldError}>
                  {errors.registration_end_date.message}
                </span>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tournament Start *</label>
            <input
              type="datetime-local"
              className={`${styles.input} ${errors.start_date ? styles.inputError : ""}`}
              {...register("start_date")}
            />
            {errors.start_date && (
              <span className={styles.fieldError}>{errors.start_date.message}</span>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Max Teams *</label>
              <input
                type="number"
                min={1}
                className={`${styles.input} ${errors.max_teams ? styles.inputError : ""}`}
                {...register("max_teams", { valueAsNumber: true })}
              />
              {errors.max_teams && (
                <span className={styles.fieldError}>{errors.max_teams.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Min Members *</label>
              <input
                type="number"
                min={1}
                className={`${styles.input} ${
                  errors.min_user_count ? styles.inputError : ""
                }`}
                {...register("min_user_count", { valueAsNumber: true })}
              />
              {errors.min_user_count && (
                <span className={styles.fieldError}>{errors.min_user_count.message}</span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Max Members *</label>
              <input
                type="number"
                min={1}
                className={`${styles.input} ${
                  errors.max_user_count ? styles.inputError : ""
                }`}
                {...register("max_user_count", { valueAsNumber: true })}
              />
              {errors.max_user_count && (
                <span className={styles.fieldError}>{errors.max_user_count.message}</span>
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
              {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Tournament"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}