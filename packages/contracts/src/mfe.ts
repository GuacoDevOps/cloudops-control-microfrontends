import type { Environment } from "./environment";

/** Props shared when the shell mounts a microfrontend. */
export interface MicrofrontendMountProps {
  environment: Environment;
}

/**
 * Placeholder for future inter-MFE contracts (event bus, shared commands).
 * Phase 1 only documents the expected shape.
 */
export interface InterMicrofrontendContract {
  environment: Environment;
}
