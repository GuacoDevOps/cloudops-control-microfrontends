import styles from "./DomainIndicator.module.css";

interface DomainIndicatorProps {
  name: string;
}

export function DomainIndicator({ name }: DomainIndicatorProps) {
  return (
    <p className={styles.indicator}>
      <span className={styles.label}>Domain</span>
      <span className={styles.name}>{name}</span>
    </p>
  );
}
