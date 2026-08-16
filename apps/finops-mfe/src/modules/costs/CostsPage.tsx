import { useShallow } from "zustand/react/shallow";
import { LoadingState, ErrorState, DomainIndicator } from "@cloudops/design-system";
import useFinOpsStore from "../../store/useFinOpsStore";
import { useFinOpsCloudOpsSync } from "../../store/cloudOpsSync";
import { selectCostVariation } from "../../store/selectors";
import styles from "./CostsPage.module.css";

export function CostsPage() {
  useFinOpsCloudOpsSync();
  const loading = useFinOpsStore((s) => s.loading);
  const error = useFinOpsStore((s) => s.error);
  const retryCosts = useFinOpsStore((s) => s.retryCosts);
  const costSummary = useFinOpsStore((s) => s.costSummary);
  const costBreakdown = useFinOpsStore((s) => s.costBreakdown);
  const { monthlyCost, previousMonthCost, difference, variationPct, isIncrease } =
    useFinOpsStore(useShallow(selectCostVariation));

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

  const previous = previousMonthCost;
  const diff = difference;
  const isPositive = isIncrease;

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.headerCopy}>
          <h2 className={styles.title}>Costs</h2>
          <DomainIndicator name="FinOps" />
        </div>
        <span className={styles.env}>{costSummary?.environment}</span>
      </header>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.cardLabel}>Current Monthly Cost</span>
          <span className={styles.cardValue}>${monthlyCost.toLocaleString()}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.cardLabel}>Previous Month</span>
          <span className={styles.cardValue}>${previous.toLocaleString()}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={`${styles.cardLabel} ${styles.diffLabel}`}>Difference</span>
          <span className={`${styles.cardValue} ${isPositive ? styles.increase : styles.decrease}`}>
            {isPositive ? "+" : "-"}${Math.abs(diff).toLocaleString()}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={`${styles.cardLabel} ${styles.diffLabel}`}>Variation %</span>
          <span className={`${styles.cardValue} ${isPositive ? styles.increase : styles.decrease}`}>
            {isPositive ? "+" : ""}{variationPct}%
          </span>
        </div>
      </div>

      <section aria-labelledby="breakdown-heading">
        <h3 id="breakdown-heading" className={styles.sectionTitle}>Cost Breakdown</h3>
        <div className={styles.tableWrapper}>
          <table aria-label="Cost breakdown by category">
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Estimated Cost</th>
                <th scope="col">Share</th>
              </tr>
            </thead>
            <tbody>
              {costBreakdown.map(({ category, percentage, estimatedCost }) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td>${estimatedCost.toLocaleString()}</td>
                  <td>{(percentage * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export default CostsPage;
