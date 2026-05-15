import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTournaments } from "@/features/Tournaments/hooks/useTournaments";
import {
  getTasks,
  getSubmissionsByTask,
  getTeam,
  getRequirements,
  getEvaluationsByTask,
  type Submission,
  type Task,
  type Team,
  type Requirement,
  type Evaluation,
} from "@/services/api";
import styles from "./AdminSubmissions.module.css";

interface SubmissionWithDetails extends Submission {
  taskName: string;
  teamName: string;
  tournamentId: number;
  tournamentName: string;
  requirements: Requirement[];
  evaluations: Evaluation[];
  totalScore: number | null;
  maxPossibleScore: number;
}

export default function AdminSubmissions() {
  const { data: tournaments } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<number | "all">("all");
  const [selectedTask, setSelectedTask] = useState<number | "all">("all");
  const [search, setSearch] = useState("");

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["admin-tasks", selectedTournament],
    queryFn: async () => {
      if (selectedTournament === "all") {
        if (!tournaments) return [];
        const allTasks: Task[] = [];
        for (const t of tournaments) {
          const tournamentTasks = await getTasks(t.id);
          allTasks.push(...tournamentTasks);
        }
        return allTasks;
      }
      return getTasks(Number(selectedTournament));
    },
    enabled: !!tournaments && tournaments.length > 0,
  });

  const { data: submissionsWithDetails, isLoading: submissionsLoading } = useQuery({
    queryKey: ["admin-submissions", selectedTask, selectedTournament, tasks?.map(t => t.id)],
    queryFn: async () => {
      const tasksToFetch = selectedTask === "all" 
        ? (tasks || []) 
        : (tasks || []).filter(t => t.id === Number(selectedTask));
      
      const result: SubmissionWithDetails[] = [];
      
      for (const task of tasksToFetch) {
        const [submissions, requirements, evaluations] = await Promise.all([
          getSubmissionsByTask(task.id),
          getRequirements(task.id),
          getEvaluationsByTask(task.id),
        ]);

        const teamPromises = submissions.map(s => getTeam(s.team_id).catch(() => null));
        const teams = await Promise.all(teamPromises);

        const tournament = tournaments?.find(t => t.id === task.tournament_id);

        for (let i = 0; i < submissions.length; i++) {
          const sub = submissions[i];
          const team = teams[i] as Team | null;
          
          const subEvaluations = evaluations.filter(e => e.submission_id === sub.id);
          const totalScore = subEvaluations.length > 0
            ? subEvaluations.reduce((sum, e) => sum + e.scores, 0) / subEvaluations.length
            : null;
          
          const maxPossibleScore = requirements.reduce((sum, r) => sum + r.max_score, 0);

          result.push({
            ...sub,
            taskName: task.name,
            teamName: team?.name || `Team #${sub.team_id}`,
            tournamentId: task.tournament_id,
            tournamentName: tournament?.name || `Tournament #${task.tournament_id}`,
            requirements,
            evaluations: subEvaluations,
            totalScore,
            maxPossibleScore,
          });
        }
      }

      return result.sort((a, b) => {
        if (a.tournamentId !== b.tournamentId) return a.tournamentId - b.tournamentId;
        if (a.task_id !== b.task_id) return a.task_id - b.task_id;
        return new Date(b.created_on).getTime() - new Date(a.created_on).getTime();
      });
    },
    enabled: !!tasks && tasks.length > 0,
  });

  const filtered = useMemo(() => {
    if (!submissionsWithDetails) return [];
    let res = [...submissionsWithDetails];
    
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(s => 
        s.teamName.toLowerCase().includes(q) ||
        s.taskName.toLowerCase().includes(q) ||
        s.github_url.toLowerCase().includes(q)
      );
    }
    
    return res;
  }, [submissionsWithDetails, search]);

  const groupedByTournament = useMemo(() => {
    const groups = new Map<string, SubmissionWithDetails[]>();
    filtered.forEach(sub => {
      const key = `${sub.tournamentId}-${sub.tournamentName}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(sub);
    });
    return groups;
  }, [filtered]);

  const isLoading = tasksLoading || submissionsLoading;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Submissions</h1>
          <p className={styles.subtitle}>Review all team submissions across tournaments</p>
        </div>
      </header>

      <div className={styles.filters}>
        <select
          className={styles.select}
          value={selectedTournament}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedTournament(value === "all" ? "all" : Number(value));
            setSelectedTask("all");
          }}
        >
          <option value="all">All Tournaments</option>
          {(tournaments || []).map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <select
          className={styles.select}
          value={selectedTask}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedTask(value === "all" ? "all" : Number(value));
          }}
          disabled={selectedTournament === "all"}
        >
          <option value="all">All Tasks</option>
          {(tasks || []).map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by team, task, or GitHub URL..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading submissions…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No submissions found</div>
      ) : selectedTournament === "all" ? (
        <div className={styles.groupsList}>
          {Array.from(groupedByTournament.entries()).map(([key, subs]) => {
            const [, tournamentName] = key.split("-", 2);
            return (
              <div key={key} className={styles.tournamentGroup}>
                <div className={styles.tournamentGroupHeader}>
                  <h3 className={styles.tournamentGroupTitle}>{tournamentName}</h3>
                  <span className={styles.tournamentGroupCount}>
                    {subs.length} submission{subs.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <SubmissionsTable submissions={subs} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <SubmissionsTable submissions={filtered} />
        </div>
      )}
    </div>
  );
}

function SubmissionsTable({ submissions }: { submissions: SubmissionWithDetails[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Team</th>
          <th>Task</th>
          <th>Submitted</th>
          <th>GitHub</th>
          <th>Video</th>
          <th>Score</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {submissions.map(sub => {
          const isExpanded = expandedId === sub.id;
          const hasEvaluations = sub.evaluations.length > 0;
          const scorePercent = sub.totalScore !== null && sub.maxPossibleScore > 0
            ? Math.round((sub.totalScore / sub.maxPossibleScore) * 100)
            : null;

          return (
            <React.Fragment key={sub.id}>
              <tr className={isExpanded ? styles.rowExpanded : ""}>
                <td className={styles.cellName}>{sub.teamName}</td>
                <td>{sub.taskName}</td>
                <td>{new Date(sub.created_on).toLocaleDateString()}</td>
                <td>
                  <a 
                    href={sub.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    GitHub
                  </a>
                </td>
                <td>
                  <a 
                    href={sub.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    Video
                  </a>
                </td>
                <td>
                  {sub.totalScore !== null ? (
                    <span className={styles.score}>
                      {sub.totalScore.toFixed(1)} / {sub.maxPossibleScore}
                      {scorePercent !== null && (
                        <span className={styles.scorePercent}> ({scorePercent}%)</span>
                      )}
                    </span>
                  ) : (
                    <span className={styles.scorePending}>Pending</span>
                  )}
                </td>
                <td>
                  <span className={`${styles.status} ${hasEvaluations ? styles.statusEvaluated : styles.statusPending}`}>
                    {hasEvaluations ? `Evaluated (${sub.evaluations.length})` : "Pending"}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.actionBtn}
                    onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                  >
                    {isExpanded ? "Collapse" : "Details"}
                  </button>
                </td>
              </tr>
              {isExpanded && (
                <tr className={styles.detailRow}>
                  <td colSpan={8}>
                    <SubmissionDetails submission={sub} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

function SubmissionDetails({ submission }: { submission: SubmissionWithDetails }) {
  return (
    <div className={styles.details}>
      <div className={styles.detailsGrid}>
        <div className={styles.detailSection}>
          <h4 className={styles.detailTitle}>Links</h4>
          <div className={styles.detailLinks}>
            <a href={submission.github_url} target="_blank" rel="noopener noreferrer" className={styles.detailLink}>
              <span>GitHub Repository</span>
              <span className={styles.detailLinkUrl}>{submission.github_url}</span>
            </a>
            <a href={submission.video_url} target="_blank" rel="noopener noreferrer" className={styles.detailLink}>
              <span>Video Demo</span>
              <span className={styles.detailLinkUrl}>{submission.video_url}</span>
            </a>
            {submission.live_demo_url && (
              <a href={submission.live_demo_url} target="_blank" rel="noopener noreferrer" className={styles.detailLink}>
                <span>Live Demo</span>
                <span className={styles.detailLinkUrl}>{submission.live_demo_url}</span>
              </a>
            )}
          </div>
        </div>

        {submission.description && (
          <div className={styles.detailSection}>
            <h4 className={styles.detailTitle}>Description</h4>
            <p className={styles.detailText}>{submission.description}</p>
          </div>
        )}

        <div className={styles.detailSection}>
          <h4 className={styles.detailTitle}>Requirements ({submission.requirements.length})</h4>
          <ul className={styles.requirementsList}>
            {submission.requirements.map(req => (
              <li key={req.id} className={styles.requirementItem}>
                <span>{req.name}: {req.description}</span>
                <span className={styles.requirementScore}>Max {req.max_score} pts</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.detailSection}>
          <h4 className={styles.detailTitle}>
            Evaluations ({submission.evaluations.length})
          </h4>
          {submission.evaluations.length === 0 ? (
            <p className={styles.detailEmpty}>No evaluations yet</p>
          ) : (
            <div className={styles.evaluationsList}>
              {submission.evaluations.map(eva => (
                <div key={eva.id} className={styles.evaluationItem}>
                  <div className={styles.evaluationHeader}>
                    <span className={styles.evaluationJury}>Jury #{eva.jury_id}</span>
                    <span className={styles.evaluationScore}>{eva.scores} pts</span>
                  </div>
                  {eva.comment && (
                    <p className={styles.evaluationComment}>{eva.comment}</p>
                  )}
                </div>
              ))}
              <div className={styles.evaluationTotal}>
                <span>Average:</span>
                <span className={styles.evaluationTotalScore}>
                  {submission.totalScore?.toFixed(1)} / {submission.maxPossibleScore}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}