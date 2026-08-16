import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { ServiceStatus } from "@cloudops/contracts";
import styles from "./StatusBadge.module.css";

interface StatusBadgeProps {
  status: ServiceStatus;
}

const STATUS_CONFIG: Record<ServiceStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  healthy: { label: "Healthy", icon: CheckCircle, className: "healthy" },
  warning: { label: "Warning", icon: AlertTriangle, className: "warning" },
  critical: { label: "Critical", icon: XCircle, className: "critical" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span className={`${styles.badge} ${styles[config.className]}`}>
      <Icon size={12} aria-hidden="true" />
      {config.label}
    </span>
  );
}
