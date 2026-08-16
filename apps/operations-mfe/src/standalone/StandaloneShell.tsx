import { useState, type ReactNode } from "react";
import {
  ENVIRONMENTS,
  getSharedEnvironment,
  publishCloudOpsEnvironment,
  type Environment,
} from "@cloudops/contracts";
import styles from "./StandaloneShell.module.css";

interface StandaloneShellProps {
  title: string;
  children: ReactNode;
}

export function StandaloneShell({ title, children }: StandaloneShellProps) {
  const [environment, setEnvironment] = useState<Environment>(getSharedEnvironment());

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.envSelector}>
          <label htmlFor="standalone-env-select" className={styles.envLabel}>
            Environment
          </label>
          <select
            id="standalone-env-select"
            className={styles.envSelect}
            value={environment}
            onChange={(event) => {
              const next = event.target.value;
              if (ENVIRONMENTS.includes(next as Environment)) {
                const selected = next as Environment;
                setEnvironment(selected);
                publishCloudOpsEnvironment(selected);
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
      <main className={styles.main}>{children}</main>
    </div>
  );
}
