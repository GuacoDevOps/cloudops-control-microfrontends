import { create } from "zustand";
import { publishCloudOpsEnvironment, type Environment } from "@cloudops/contracts";

interface ShellState {
  selectedEnvironment: Environment;
  setEnvironment: (environment: Environment) => void;
}

const useShellStore = create<ShellState>((set) => ({
  selectedEnvironment: "PROD",
  setEnvironment: (environment) => {
    set({ selectedEnvironment: environment });
    publishCloudOpsEnvironment(environment);
  },
}));

export default useShellStore;
