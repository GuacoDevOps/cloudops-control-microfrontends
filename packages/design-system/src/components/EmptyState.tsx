import { Inbox } from "lucide-react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = "No data available" }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <Inbox size={40} className={styles.icon} aria-hidden="true" />
      <p className={styles.message}>{message}</p>
    </div>
  );
}
