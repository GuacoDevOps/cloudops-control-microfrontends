import styles from "./LoadingState.module.css";

export function LoadingState() {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.message}>Loading CloudOps data...</p>
    </div>
  );
}
