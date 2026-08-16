import { FederatedCostsPage } from "../mfe/federatedModules";
import { RemoteSlot } from "../mfe/RemoteSlot";

export function CostsRoute() {
  return (
    <RemoteSlot
      loadingMessage="Loading FinOps..."
      unavailableMessage="FinOps module is temporarily unavailable."
    >
      <FederatedCostsPage />
    </RemoteSlot>
  );
}
