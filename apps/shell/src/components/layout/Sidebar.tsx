import { NavLink } from "react-router";
import { LayoutDashboard, Server, AlertTriangle, DollarSign } from "lucide-react";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/services", label: "Services", icon: Server, end: false },
  { to: "/incidents", label: "Incidents", icon: AlertTriangle, end: false },
  { to: "/costs", label: "Costs", icon: DollarSign, end: false },
];

export function Sidebar() {
  return (
    <nav className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.logo}>
        <span className={styles.logoIcon} aria-hidden="true">☁</span>
        <span className={styles.logoText}>Cloud<span>Ops</span></span>
      </div>
      <ul className={styles.navList} role="list">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
