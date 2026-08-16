import { Outlet, useLocation } from "react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import styles from "./MainLayout.module.css";

const PAGE_TITLES: Record<string, string> = {
  "/": "CloudOps Control",
  "/services": "Services",
  "/incidents": "Incidents",
  "/costs": "Costs",
};

export function MainLayout() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? "CloudOps Control";

  return (
    <div className={styles.layout}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <Sidebar />
      <div className={styles.content}>
        <Header title={title} />
        <main id="main-content" className={styles.main} tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
