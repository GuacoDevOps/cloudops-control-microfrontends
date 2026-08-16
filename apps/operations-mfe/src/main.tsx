import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { publishCloudOpsEnvironment } from "@cloudops/contracts";
import "@cloudops/design-system/styles/global.css";
import { ServicesPage } from "./modules/services/ServicesPage";
import { IncidentsPage } from "./modules/incidents/IncidentsPage";
import { StandaloneShell } from "./standalone/StandaloneShell";

publishCloudOpsEnvironment("PROD");

function StandaloneApp() {
  return (
    <BrowserRouter>
      <StandaloneShell title="Operations MFE">
        <Routes>
          <Route path="/" element={<Navigate to="/services" replace />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
        </Routes>
      </StandaloneShell>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StandaloneApp />
  </StrictMode>,
);
