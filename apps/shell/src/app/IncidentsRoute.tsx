import { FederatedIncidentsPage } from "../mfe/federatedModules";
import { RemoteSlot } from "../mfe/RemoteSlot";

export function IncidentsRoute() {
  return (
    <RemoteSlot
      loadingMessage="Loading Cloud Operations..."
      unavailableMessage="Cloud Operations module is temporarily unavailable."
    >
      <FederatedIncidentsPage />
    </RemoteSlot>
  );
}
