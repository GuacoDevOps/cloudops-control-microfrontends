import { CheckCircle, XCircle, Clock, AlertTriangle, Info } from "lucide-react";
import { EmptyState } from "@cloudops/design-system";
import type { Incident, IncidentSeverity, IncidentStatus } from "../../store/types";
import useOperationsStore from "../../store/useOperationsStore";
import styles from "./IncidentTable.module.css";

interface IncidentTableProps {
  incidents: Incident[];
}

const SEVERITY_CONFIG: Record<IncidentSeverity, { icon: typeof AlertTriangle; className: string; label: string }> = {
  critical: { icon: XCircle, className: "critical", label: "Critical" },
  warning: { icon: AlertTriangle, className: "warning", label: "Warning" },
  info: { icon: Info, className: "info", label: "Info" },
};

const STATUS_CONFIG: Record<IncidentStatus, { icon: typeof Clock; className: string; label: string }> = {
  open: { icon: Clock, className: "open", label: "Open" },
  acknowledged: { icon: AlertTriangle, className: "acknowledged", label: "Acknowledged" },
  resolved: { icon: CheckCircle, className: "resolved", label: "Resolved" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export function IncidentTable({ incidents }: IncidentTableProps) {
  const acknowledgeIncident = useOperationsStore((s) => s.acknowledgeIncident);
  const resolveIncident = useOperationsStore((s) => s.resolveIncident);

  if (incidents.length === 0) {
    return <EmptyState message="No incidents match the current filters" />;
  }

  return (
    <div className={styles.tableWrapper}>
      <table aria-label="Incidents table">
        <thead>
          <tr>
            <th scope="col">Severity</th>
            <th scope="col">Service</th>
            <th scope="col">Incident</th>
            <th scope="col">Created</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => {
            const sev = SEVERITY_CONFIG[incident.severity];
            const SevIcon = sev.icon;
            const stat = STATUS_CONFIG[incident.status];
            const StatIcon = stat.icon;

            return (
              <tr key={incident.id}>
                <td>
                  <span className={`${styles.badge} ${styles[sev.className]}`}>
                    <SevIcon size={12} aria-hidden="true" />
                    {sev.label}
                  </span>
                </td>
                <td className={styles.serviceName}>{incident.service}</td>
                <td className={styles.incidentTitle}>{incident.title}</td>
                <td className={styles.date}>{formatDate(incident.createdAt)}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[stat.className]}`}>
                    <StatIcon size={12} aria-hidden="true" />
                    {stat.label}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    {incident.status === "open" && (
                      <button
                        type="button"
                        className={styles.ackButton}
                        onClick={() => acknowledgeIncident(incident.id)}
                        aria-label={`Acknowledge incident: ${incident.title}`}
                      >
                        Acknowledge
                      </button>
                    )}
                    {incident.status === "acknowledged" && (
                      <button
                        type="button"
                        className={styles.resolveButton}
                        onClick={() => resolveIncident(incident.id)}
                        aria-label={`Resolve incident: ${incident.title}`}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
