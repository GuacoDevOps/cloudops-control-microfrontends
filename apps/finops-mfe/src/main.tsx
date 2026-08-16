import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { publishCloudOpsEnvironment } from "@cloudops/contracts";
import "@cloudops/design-system/styles/global.css";
import { CostsPage } from "./modules/costs/CostsPage";
import { StandaloneShell } from "./standalone/StandaloneShell";

publishCloudOpsEnvironment("PROD");

function StandaloneApp() {
  return (
    <BrowserRouter>
      <StandaloneShell title="FinOps MFE">
        <Routes>
          <Route path="/" element={<Navigate to="/costs" replace />} />
          <Route path="/costs" element={<CostsPage />} />
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
