import { useShallow } from "zustand/react/shallow";
import useOperationsStore from "../../store/useOperationsStore";
import styles from "./IncidentFilters.module.css";

export function IncidentFilters() {
  const { search, severity, status } = useOperationsStore(
    useShallow((s) => ({
      search: s.incidentFilters.search,
      severity: s.incidentFilters.severity,
      status: s.incidentFilters.status,
    })),
  );
  const setSearchFilter = useOperationsStore((s) => s.setSearchFilter);
  const setSeverityFilter = useOperationsStore((s) => s.setSeverityFilter);
  const setStatusFilter = useOperationsStore((s) => s.setStatusFilter);
  const resetFilters = useOperationsStore((s) => s.resetFilters);

  return (
    <div className={styles.filters} role="search" aria-label="Filter incidents">
      <div className={styles.field}>
        <label htmlFor="incident-search" className={styles.label}>Search</label>
        <input
          id="incident-search"
          type="search"
          placeholder="Search by title or service..."
          value={search}
          onChange={(e) => setSearchFilter(e.target.value)}
          className={styles.input}
          aria-label="Search incidents"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="severity-filter" className={styles.label}>Severity</label>
        <select
          id="severity-filter"
          value={severity}
          onChange={(e) => setSeverityFilter(e.target.value as Parameters<typeof setSeverityFilter>[0])}
          className={styles.select}
        >
          <option value="all">All</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor="status-filter" className={styles.label}>Status</label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => setStatusFilter(e.target.value as Parameters<typeof setStatusFilter>[0])}
          className={styles.select}
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>&nbsp;</span>
        <button
          type="button"
          onClick={resetFilters}
          className={styles.resetButton}
          aria-label="Reset all filters"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
