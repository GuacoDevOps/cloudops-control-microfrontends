import { FederatedServicesPage } from "../mfe/federatedModules";
import { RemoteSlot } from "../mfe/RemoteSlot";

export function ServicesRoute() {
  return (
    <RemoteSlot
      loadingMessage="Loading Cloud Operations..."
      unavailableMessage="Cloud Operations module is temporarily unavailable."
    >
      <FederatedServicesPage />
    </RemoteSlot>
  );
}
