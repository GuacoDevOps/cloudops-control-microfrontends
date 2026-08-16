import styles from "./RemoteFallback.module.css";

interface RemoteFallbackProps {
  message: string;
}

export function RemoteFallback({ message }: RemoteFallbackProps) {
  return (
    <div className={styles.container} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.message}>{message}</p>
    </div>
  );
}
