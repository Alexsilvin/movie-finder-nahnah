"use client";

import { Search, X } from "lucide-react";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

// Controlled search input. Debouncing is handled by the parent so this stays
// a simple presentational component.
export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className={styles.wrap}>
      <Search className={styles.icon} size={19} aria-hidden="true" />
      <input
        type="search"
        className={styles.input}
        placeholder="Search movies by title…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search movies by title"
      />
      {value && (
        <button
          type="button"
          className={styles.clear}
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
