import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useRequirements,
  useRequirementGroups,
  useCreateRequirement,
  useDeleteRequirements,
  useCreateRequirementGroup,
  useDeleteRequirementGroup,
} from "@/features/admin/hooks/useRounds";
import type { Task, Requirement, RequirementGroup } from "@/services/api";
import styles from "./RoundRequirementsModal.module.css";

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
});

const requirementSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  max_score: z.number().min(1, "Max score must be at least 1"),
  requirement_group_id: z.number().min(1, "Group is required"),
});

type GroupForm = z.infer<typeof groupSchema>;
type RequirementForm = z.infer<typeof requirementSchema>;

interface Props {
  round: Task;
  onClose: () => void;
}

export default function RoundRequirementsModal({ round, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"groups" | "requirements">("groups");
  const [selectedGroup] = useState<number | null>(null);

  const { data: groups, isLoading: groupsLoading } = useRequirementGroups(round.id);
  const { data: requirements, isLoading: reqLoading } = useRequirements(round.id);

  const createGroupMut = useCreateRequirementGroup();
  const deleteGroupMut = useDeleteRequirementGroup();
  const createReqMut = useCreateRequirement();
  const deleteReqMut = useDeleteRequirements();

  const groupForm = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
  });

  const reqForm = useForm<RequirementForm>({
    resolver: zodResolver(requirementSchema),
    defaultValues: { max_score: 10 },
  });

  const onCreateGroup = (data: GroupForm) => {
    createGroupMut.mutate(
      { name: data.name, task_id: round.id },
      { onSuccess: () => groupForm.reset() }
    );
  };

  const onCreateRequirement = (data: RequirementForm) => {
    createReqMut.mutate(
      {
        name: data.name,
        description: data.description,
        max_score: data.max_score,
        requirement_group_id: data.requirement_group_id,
      },
      { onSuccess: () => reqForm.reset() }
    );
  };

  const handleDeleteRequirements = (ids: number[]) => {
    if (!window.confirm(`Delete ${ids.length} requirement(s)?`)) return;
    deleteReqMut.mutate(ids);
  };

  const handleDeleteGroup = (id: number) => {
    if (!window.confirm("Delete this group and all its requirements?")) return;
    deleteGroupMut.mutate(id);
  };

  const filteredRequirements = requirements?.filter(
    (r) => !selectedGroup || r.requirement_group_id === selectedGroup
  );

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Manage Requirements</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "groups" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("groups")}
          >
            Groups
          </button>
          <button
            className={`${styles.tab} ${activeTab === "requirements" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("requirements")}
          >
            Requirements
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === "groups" ? (
            <div className={styles.section}>
              <form className={styles.inlineForm} onSubmit={groupForm.handleSubmit(onCreateGroup)} autoComplete="off">
                <input
                  placeholder="New group name..."
                  className={`${styles.input} ${groupForm.formState.errors.name ? styles.inputError : ""}`}
                  {...groupForm.register("name")}
                />
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={createGroupMut.isPending}
                >
                  {createGroupMut.isPending ? "Adding…" : "Add Group"}
                </button>
              </form>
              {groupForm.formState.errors.name && (
                <span className={styles.fieldError}>{groupForm.formState.errors.name.message}</span>
              )}

              {groupsLoading ? (
                <p className={styles.loadingText}>Loading groups…</p>
              ) : !groups || groups.length === 0 ? (
                <p className={styles.emptyText}>No groups yet</p>
              ) : (
                <div className={styles.list}>
                  {groups.map((group: RequirementGroup) => (
                    <div key={group.id} className={styles.item}>
                      <span className={styles.itemName}>{group.name}</span>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => handleDeleteGroup(group.id)}
                        disabled={deleteGroupMut.isPending}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.section}>
              <form className={styles.form} onSubmit={reqForm.handleSubmit(onCreateRequirement)} autoComplete="off">
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Group *</label>
                    <select
                      className={styles.input}
                      {...reqForm.register("requirement_group_id", { valueAsNumber: true })}
                    >
                      <option value={0}>Select group...</option>
                      {(groups || []).map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Max Score *</label>
                    <input
                      type="number"
                      min={1}
                      className={styles.input}
                      {...reqForm.register("max_score", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Name *</label>
                  <input
                    className={styles.input}
                    {...reqForm.register("name")}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Description *</label>
                  <textarea
                    rows={2}
                    className={styles.input}
                    {...reqForm.register("description")}
                  />
                </div>
                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={createReqMut.isPending}
                >
                  {createReqMut.isPending ? "Adding…" : "Add Requirement"}
                </button>
              </form>

              {reqLoading ? (
                <p className={styles.loadingText}>Loading requirements…</p>
              ) : !filteredRequirements || filteredRequirements.length === 0 ? (
                <p className={styles.emptyText}>No requirements yet</p>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Max Score</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequirements.map((req: Requirement) => (
                        <tr key={req.id}>
                          <td className={styles.cellName}>{req.name}</td>
                          <td>{req.description}</td>
                          <td>{req.max_score}</td>
                          <td>
                            <button
                              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                              onClick={() => handleDeleteRequirements([req.id])}
                              disabled={deleteReqMut.isPending}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}