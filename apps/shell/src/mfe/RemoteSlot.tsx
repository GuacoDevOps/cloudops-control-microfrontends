import { Suspense, type ReactNode } from "react";
import { RemoteErrorBoundary } from "./RemoteErrorBoundary";
import { RemoteFallback } from "./RemoteFallback";

interface RemoteSlotProps {
  children: ReactNode;
  loadingMessage: string;
  unavailableMessage: string;
}

export function RemoteSlot({ children, loadingMessage, unavailableMessage }: RemoteSlotProps) {
  return (
    <RemoteErrorBoundary fallbackMessage={unavailableMessage}>
      <Suspense fallback={<RemoteFallback message={loadingMessage} />}>
        {children}
      </Suspense>
    </RemoteErrorBoundary>
  );
}
