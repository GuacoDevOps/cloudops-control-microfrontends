import { createBrowserRouter } from "react-router";
import { MainLayout } from "../components/layout/MainLayout";
import { DashboardPage } from "./DashboardPage";
import { ServicesRoute } from "./ServicesRoute";
import { IncidentsRoute } from "./IncidentsRoute";
import { CostsRoute } from "./CostsRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "services", element: <ServicesRoute /> },
      { path: "incidents", element: <IncidentsRoute /> },
      { path: "costs", element: <CostsRoute /> },
    ],
  },
]);
