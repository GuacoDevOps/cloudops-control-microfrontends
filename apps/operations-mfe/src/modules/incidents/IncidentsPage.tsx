import { useShallow } from "zustand/react/shallow";
import { LoadingState, ErrorState, DomainIndicator } from "@cloudops/design-system";
import useOperationsStore from "../../store/useOperationsStore";
import { useOperationsCloudOpsSync } from "../../store/cloudOpsSync";
import { selectFilteredIncidents } from "../../store/selectors";
import { IncidentFilters } from "./IncidentFilters";
import { IncidentTable } from "./IncidentTable";
import styles from "./IncidentsPage.module.css";

export function IncidentsPage() {
  useOperationsCloudOpsSync();
  const loading = useOperationsStore((s) => s.loading);
  const error = useOperationsStore((s) => s.error);
  const clearError = useOperationsStore((s) => s.clearError);
  const loadIncidents = useOperationsStore((s) => s.loadIncidents);
  const filteredIncidents = useOperationsStore(useShallow(selectFilteredIncidents));
  const totalIncidents = useOperationsStore((s) => s.incidents.length);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          clearError();
          void loadIncidents();
        }}
      />
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headerCopy}>
          <h2 className={styles.title}>Incidents</h2>
          <DomainIndicator name="Cloud Operations" />
        </div>
        <span className={styles.count}>
          {filteredIncidents.length} / {totalIncidents} incidents
        </span>
      </header>
      <IncidentFilters />
      <IncidentTable incidents={filteredIncidents} />
    </section>
  );
}

export default IncidentsPage;
