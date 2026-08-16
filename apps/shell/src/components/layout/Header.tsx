import { ENVIRONMENTS, type Environment } from "@cloudops/contracts";
import useShellStore from "../../store/useShellStore";
import styles from "./Header.module.css";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const selectedEnvironment = useShellStore((s) => s.selectedEnvironment);
  const setEnvironment = useShellStore((s) => s.setEnvironment);

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.envSelector}>
        <label htmlFor="env-select" className={styles.envLabel}>
          Environment
        </label>
        <select
          id="env-select"
          className={styles.envSelect}
          value={selectedEnvironment}
          onChange={(e) => {
            const next = e.target.value;
            if (ENVIRONMENTS.includes(next as Environment)) {
              setEnvironment(next as Environment);
            }
          }}
        >
          {ENVIRONMENTS.map((env) => (
            <option key={env} value={env}>
              {env}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
