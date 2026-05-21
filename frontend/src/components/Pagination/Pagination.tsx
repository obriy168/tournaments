import styles from "./Pagination.module.css";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
  totalItems: number;
}

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
}: Props) {
  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className={styles.pagination}>
      <div className={styles.paginationInfo}>
        <span>
          {startItem}–{endItem} of {totalItems}
        </span>
        {onPageSizeChange && (
          <select
            className={styles.perPageSelect}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
        )}
      </div>

      <div className={styles.paginationControls}>
        <button
          className={styles.pageBtn}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          ←
        </button>

        <button
          className={`${styles.pageBtn} ${styles.pageBtnActive}`}
        >
          {page}
        </button>

        <span style={{ fontSize: 13, color: "#666", padding: "0 4px" }}>
          / {totalPages}
        </span>

        <button
          className={styles.pageBtn}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || totalPages === 0}
        >
          →
        </button>
      </div>
    </div>
  );
}