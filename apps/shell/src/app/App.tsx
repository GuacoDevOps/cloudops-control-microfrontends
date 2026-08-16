import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { publishCloudOpsEnvironment } from "@cloudops/contracts";
import { router } from "./router";
import useShellStore from "../store/useShellStore";

export function App() {
  useEffect(() => {
    publishCloudOpsEnvironment(useShellStore.getState().selectedEnvironment);
  }, []);

  return <RouterProvider router={router} />;
}
