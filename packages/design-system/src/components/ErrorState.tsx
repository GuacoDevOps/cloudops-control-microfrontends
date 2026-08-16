import { AlertTriangle, RefreshCw } from "lucide-react";
import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className={styles.container} role="alert">
      <AlertTriangle size={40} className={styles.icon} aria-hidden="true" />
      <h2 className={styles.title}>Unable to load CloudOps information</h2>
      <p className={styles.message}>{message}</p>
      <button className={styles.retryButton} onClick={onRetry} type="button">
        <RefreshCw size={16} aria-hidden="true" />
        Retry
      </button>
    </div>
  );
}
