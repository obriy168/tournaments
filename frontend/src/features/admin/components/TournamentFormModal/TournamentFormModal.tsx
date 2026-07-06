import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateTournament,
  useUpdateTournament,
} from "@/features/admin/hooks/useTournamentMutations";
import type { Tournament } from "@/services/api";
import { useTranslation } from "react-i18next";
import styles from "./TournamentFormModal.module.css";

const getTournamentSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.string().min(1, t("admin.tournaments.form.errors.nameRequired")),
      description: z
        .string()
        .min(1, t("admin.tournaments.form.errors.descriptionRequired")),
      start_date: z
        .string()
        .min(1, t("admin.tournaments.form.errors.startDateRequired")),
      registration_start_date: z
        .string()
        .min(1, t("admin.tournaments.form.errors.registrationStartRequired")),
      registration_end_date: z
        .string()
        .min(1, t("admin.tournaments.form.errors.registrationEndRequired")),
      max_teams: z.number().min(1, t("admin.tournaments.form.errors.minValue")),
      min_user_count: z
        .number()
        .min(1, t("admin.tournaments.form.errors.minValue")),
      max_user_count: z
        .number()
        .min(1, t("admin.tournaments.form.errors.minValue")),
    })
    .refine(
      (data) =>
        new Date(data.registration_end_date) >
        new Date(data.registration_start_date),
      {
        message: t("admin.tournaments.form.errors.registrationOrder"),
        path: ["registration_end_date"],
      },
    )
    .refine(
      (data) =>
        new Date(data.start_date) > new Date(data.registration_end_date),
      {
        message: t("admin.tournaments.form.errors.startAfterRegistration"),
        path: ["start_date"],
      },
    )
    .refine((data) => data.max_user_count >= data.min_user_count, {
      message: t("admin.tournaments.form.errors.maxMinMembers"),
      path: ["max_user_count"],
    });

type TournamentForm = z.infer<ReturnType<typeof getTournamentSchema>>;

interface Props {
  tournament: Tournament | null;
  onClose: () => void;
}

export default function TournamentFormModal({ tournament, onClose }: Props) {
  const isEdit = !!tournament;
  const createMutation = useCreateTournament();
  const updateMutation = useUpdateTournament();
  const { t } = useTranslation();

  const schema = useMemo(() => getTournamentSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<TournamentForm>({
    resolver: zodResolver(schema),
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
        registration_start_date:
          tournament.registration_start_date?.slice(0, 16) || "",
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
              message:
                err instanceof Error
                  ? err.message
                  : t("admin.tournaments.form.errors.updateFailed"),
            }),
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onClose(),
        onError: (err) =>
          setError("root", {
            message:
              err instanceof Error
                ? err.message
                : t("admin.tournaments.form.errors.createFailed"),
          }),
      });
    }
  };

  const isPending =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEdit
              ? t("admin.tournaments.form.titleEdit")
              : t("admin.tournaments.form.titleCreate")}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          {errors.root && (
            <p className={styles.rootError}>{errors.root.message}</p>
          )}

          <div className={styles.field}>
            <label className={styles.label}>
              {t("admin.tournaments.form.name")}
            </label>
            <input
              className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              {...register("name")}
            />
            {errors.name && (
              <span className={styles.fieldError}>{errors.name.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              {t("admin.tournaments.form.description")}
            </label>
            <textarea
              rows={3}
              className={`${styles.input} ${errors.description ? styles.inputError : ""}`}
              {...register("description")}
            />
            {errors.description && (
              <span className={styles.fieldError}>
                {errors.description.message}
              </span>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>
                {t("admin.tournaments.form.registrationStart")}
              </label>
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
              <label className={styles.label}>
                {t("admin.tournaments.form.registrationEnd")}
              </label>
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
            <label className={styles.label}>
              {t("admin.tournaments.form.tournamentStart")}
            </label>
            <input
              type="datetime-local"
              className={`${styles.input} ${errors.start_date ? styles.inputError : ""}`}
              {...register("start_date")}
            />
            {errors.start_date && (
              <span className={styles.fieldError}>
                {errors.start_date.message}
              </span>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>
                {t("admin.tournaments.form.maxTeams")}
              </label>
              <input
                type="number"
                min={1}
                className={`${styles.input} ${errors.max_teams ? styles.inputError : ""}`}
                {...register("max_teams", { valueAsNumber: true })}
              />
              {errors.max_teams && (
                <span className={styles.fieldError}>
                  {errors.max_teams.message}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                {t("admin.tournaments.form.minMembers")}
              </label>
              <input
                type="number"
                min={1}
                className={`${styles.input} ${
                  errors.min_user_count ? styles.inputError : ""
                }`}
                {...register("min_user_count", { valueAsNumber: true })}
              />
              {errors.min_user_count && (
                <span className={styles.fieldError}>
                  {errors.min_user_count.message}
                </span>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                {t("admin.tournaments.form.maxMembers")}
              </label>
              <input
                type="number"
                min={1}
                className={`${styles.input} ${
                  errors.max_user_count ? styles.inputError : ""
                }`}
                {...register("max_user_count", { valueAsNumber: true })}
              />
              {errors.max_user_count && (
                <span className={styles.fieldError}>
                  {errors.max_user_count.message}
                </span>
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
              {t("admin.tournaments.form.cancel")}
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={isPending}
            >
              {isPending
                ? t("admin.tournaments.form.saving")
                : isEdit
                  ? t("admin.tournaments.form.save")
                  : t("admin.tournaments.form.create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}