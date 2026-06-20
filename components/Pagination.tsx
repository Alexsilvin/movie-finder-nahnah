"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Pagination.module.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Manual Next / Previous pagination. No infinite scroll.
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.btn}
        onClick={() => onPageChange(page - 1)}
        disabled={isFirst}
      >
        <ChevronLeft size={18} aria-hidden="true" />
        <span>Previous</span>
      </button>

      <span className={styles.status} aria-live="polite">
        Page <strong>{page}</strong>
        <span className={styles.sep}>/</span>
        {totalPages}
      </span>

      <button
        type="button"
        className={styles.btn}
        onClick={() => onPageChange(page + 1)}
        disabled={isLast}
      >
        <span>Next</span>
        <ChevronRight size={18} aria-hidden="true" />
      </button>
    </nav>
  );
}
