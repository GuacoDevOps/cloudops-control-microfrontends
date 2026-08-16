import { Server, AlertTriangle, Activity } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { MetricCard, LoadingState, ErrorState, DomainIndicator } from "@cloudops/design-system";
import useOperationsStore from "../../store/useOperationsStore";
import { useOperationsCloudOpsSync } from "../../store/cloudOpsSync";
import {
  selectHealthyServices,
  selectActiveIncidents,
  selectAvailabilityAverage,
} from "../../store/selectors";
import styles from "./DashboardPage.module.css";

export function OperationsSummary() {
  useOperationsCloudOpsSync();
  const loading = useOperationsStore((s) => s.loading);
  const error = useOperationsStore((s) => s.error);
  const loadServices = useOperationsStore((s) => s.loadServices);
  const loadIncidents = useOperationsStore((s) => s.loadIncidents);
  const clearError = useOperationsStore((s) => s.clearError);

  const healthyServices = useOperationsStore(useShallow(selectHealthyServices));
  const totalServices = useOperationsStore((s) => s.services.length);
  const activeIncidents = useOperationsStore(useShallow(selectActiveIncidents));
  const availability = useOperationsStore(selectAvailabilityAverage);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          clearError();
          void loadServices();
          void loadIncidents();
        }}
      />
    );
  }

  const criticalCount = activeIncidents.filter((i) => i.severity === "critical").length;

  return (
    <div className={styles.summaryContents}>
      <div className={styles.domainRow}>
        <DomainIndicator name="Cloud Operations" />
      </div>
      <MetricCard
        title="Healthy Services"
        value={`${healthyServices.length} / ${totalServices}`}
        icon={<Server size={20} />}
        variant={healthyServices.length === totalServices ? "success" : "warning"}
      />
      <MetricCard
        title="Active Incidents"
        value={activeIncidents.length}
        subtitle={criticalCount > 0 ? `${criticalCount} critical` : "No critical issues"}
        icon={<AlertTriangle size={20} />}
        variant={criticalCount > 0 ? "danger" : activeIncidents.length > 0 ? "warning" : "success"}
      />
      <MetricCard
        title="Availability"
        value={`${availability.toFixed(2)}%`}
        icon={<Activity size={20} />}
        variant={availability >= 99.9 ? "success" : availability >= 99 ? "warning" : "danger"}
      />
    </div>
  );
}

export function OperationsSettings() {
  useOperationsCloudOpsSync();
  const simulateApiError = useOperationsStore((s) => s.simulateApiError);

  return (
    <section aria-labelledby="operations-settings-heading" className={styles.settingsSection}>
      <h3 id="operations-settings-heading" className={styles.sectionTitle}>Settings</h3>
      <button
        className={styles.errorButton}
        onClick={() => simulateApiError()}
        type="button"
        aria-label="Simulate an Operations API error"
      >
        <AlertTriangle size={16} aria-hidden="true" />
        Simulate Operations API Error
      </button>
    </section>
  );
}

export default OperationsSummary;
