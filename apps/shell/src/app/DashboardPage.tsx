import {
  FederatedOperationsSummary,
  FederatedOperationsSettings,
  FederatedFinOpsSummary,
  FederatedFinOpsSettings,
} from "../mfe/federatedModules";
import { RemoteSlot } from "../mfe/RemoteSlot";
import styles from "./DashboardPage.module.css";

const OPERATIONS_UNAVAILABLE = "Cloud Operations module is temporarily unavailable.";
const FINOPS_UNAVAILABLE = "FinOps module is temporarily unavailable.";

export function DashboardPage() {
  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>CloudOps Control</h2>
        <p className={styles.pageSubtitle}>Operational Overview</p>
      </header>

      <section aria-labelledby="metrics-heading">
        <h3 id="metrics-heading" className={styles.sectionTitle}>Operational Health</h3>
        <div className={styles.metricsGrid}>
          <RemoteSlot
            loadingMessage="Loading Cloud Operations..."
            unavailableMessage={OPERATIONS_UNAVAILABLE}
          >
            <FederatedOperationsSummary />
          </RemoteSlot>
          <RemoteSlot
            loadingMessage="Loading FinOps..."
            unavailableMessage={FINOPS_UNAVAILABLE}
          >
            <FederatedFinOpsSummary />
          </RemoteSlot>
        </div>
      </section>

      <div className={styles.settingsRow}>
        <RemoteSlot
          loadingMessage="Loading Cloud Operations..."
          unavailableMessage={OPERATIONS_UNAVAILABLE}
        >
          <FederatedOperationsSettings />
        </RemoteSlot>
        <RemoteSlot
          loadingMessage="Loading FinOps..."
          unavailableMessage={FINOPS_UNAVAILABLE}
        >
          <FederatedFinOpsSettings />
        </RemoteSlot>
      </div>
    </section>
  );
}
