import { DollarSign, AlertTriangle } from "lucide-react";
import { MetricCard, DomainIndicator, LoadingState, ErrorState } from "@cloudops/design-system";
import useFinOpsStore from "../../store/useFinOpsStore";
import { useFinOpsCloudOpsSync } from "../../store/cloudOpsSync";
import { selectMonthlyCost } from "../../store/selectors";
import styles from "./FinOpsSummary.module.css";

export function FinOpsSummary() {
  useFinOpsCloudOpsSync();
  const monthlyCost = useFinOpsStore(selectMonthlyCost);
  const loading = useFinOpsStore((s) => s.loading);
  const error = useFinOpsStore((s) => s.error);
  const retryCosts = useFinOpsStore((s) => s.retryCosts);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          void retryCosts();
        }}
      />
    );
  }

  return (
    <div className={styles.summary}>
      <DomainIndicator name="FinOps" />
      <MetricCard
        title="Monthly Cost"
        value={`$${monthlyCost.toLocaleString()}`}
        icon={<DollarSign size={20} />}
      />
    </div>
  );
}

export function FinOpsSettings() {
  useFinOpsCloudOpsSync();
  const simulateApiError = useFinOpsStore((s) => s.simulateApiError);

  return (
    <section aria-labelledby="finops-settings-heading" className={styles.settingsSection}>
      <h3 id="finops-settings-heading" className={styles.sectionTitle}>Settings</h3>
      <button
        className={styles.errorButton}
        onClick={() => simulateApiError()}
        type="button"
        aria-label="Simulate a FinOps API error"
      >
        <AlertTriangle size={16} aria-hidden="true" />
        Simulate FinOps API Error
      </button>
    </section>
  );
}

export default FinOpsSummary;
