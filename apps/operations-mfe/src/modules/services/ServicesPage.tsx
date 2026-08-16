import { StatusBadge, LoadingState, ErrorState, EmptyState, DomainIndicator } from "@cloudops/design-system";
import useOperationsStore from "../../store/useOperationsStore";
import { useOperationsCloudOpsSync } from "../../store/cloudOpsSync";
import styles from "./ServicesPage.module.css";

export function ServicesPage() {
  useOperationsCloudOpsSync();
  const loading = useOperationsStore((s) => s.loading);
  const error = useOperationsStore((s) => s.error);
  const clearError = useOperationsStore((s) => s.clearError);
  const loadServices = useOperationsStore((s) => s.loadServices);
  const services = useOperationsStore((s) => s.services);

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
        }}
      />
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headerCopy}>
          <h2 className={styles.title}>Services</h2>
          <DomainIndicator name="Cloud Operations" />
        </div>
        <span className={styles.count}>{services.length} services</span>
      </header>

      {services.length === 0 ? (
        <EmptyState message="No services found for this environment" />
      ) : (
        <div className={styles.tableWrapper}>
          <table aria-label="Services table">
            <thead>
              <tr>
                <th scope="col">Service</th>
                <th scope="col">Environment</th>
                <th scope="col">Status</th>
                <th scope="col">Availability</th>
                <th scope="col">Response Time</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td className={styles.serviceName}>{service.name}</td>
                  <td>
                    <span className={styles.envTag}>{service.environment}</span>
                  </td>
                  <td>
                    <StatusBadge status={service.status} />
                  </td>
                  <td>{service.availability.toFixed(2)}%</td>
                  <td>{service.responseTime} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default ServicesPage;
