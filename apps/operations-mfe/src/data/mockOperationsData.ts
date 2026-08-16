import type { CloudService, Incident } from "../store/types";

export const mockServices: CloudService[] = [
  { id: "s1", name: "api-orders", environment: "PROD", status: "healthy", availability: 99.98, responseTime: 120 },
  { id: "s2", name: "api-payments", environment: "PROD", status: "critical", availability: 97.5, responseTime: 890 },
  { id: "s3", name: "frontend-web", environment: "PROD", status: "healthy", availability: 99.95, responseTime: 95 },
  { id: "s4", name: "authentication", environment: "PROD", status: "warning", availability: 99.1, responseTime: 340 },
  { id: "s5", name: "notification-service", environment: "PROD", status: "healthy", availability: 99.99, responseTime: 75 },
  { id: "s6", name: "database", environment: "PROD", status: "healthy", availability: 99.99, responseTime: 18 },
  { id: "s7", name: "api-orders", environment: "QA", status: "warning", availability: 98.7, responseTime: 210 },
  { id: "s8", name: "api-payments", environment: "QA", status: "healthy", availability: 99.5, responseTime: 180 },
  { id: "s9", name: "frontend-web", environment: "QA", status: "healthy", availability: 99.8, responseTime: 110 },
  { id: "s10", name: "authentication", environment: "QA", status: "warning", availability: 98.2, responseTime: 420 },
  { id: "s11", name: "notification-service", environment: "QA", status: "critical", availability: 95.0, responseTime: 1200 },
  { id: "s12", name: "database", environment: "QA", status: "healthy", availability: 99.9, responseTime: 22 },
  { id: "s13", name: "api-orders", environment: "DEV", status: "healthy", availability: 99.0, responseTime: 250 },
  { id: "s14", name: "api-payments", environment: "DEV", status: "healthy", availability: 98.5, responseTime: 300 },
  { id: "s15", name: "frontend-web", environment: "DEV", status: "warning", availability: 97.0, responseTime: 500 },
  { id: "s16", name: "authentication", environment: "DEV", status: "healthy", availability: 99.3, responseTime: 200 },
  { id: "s17", name: "notification-service", environment: "DEV", status: "healthy", availability: 99.6, responseTime: 150 },
  { id: "s18", name: "database", environment: "DEV", status: "healthy", availability: 99.8, responseTime: 20 },
];

export const mockIncidents: Incident[] = [
  { id: "i1", service: "api-payments", title: "High latency in payment processing", severity: "critical", status: "open", environment: "PROD", createdAt: "2026-08-07T10:22:00Z" },
  { id: "i2", service: "authentication", title: "Authentication service degraded", severity: "warning", status: "open", environment: "PROD", createdAt: "2026-08-07T11:05:00Z" },
  { id: "i3", service: "api-orders", title: "Order service returning 5xx errors", severity: "critical", status: "acknowledged", environment: "PROD", createdAt: "2026-08-07T09:00:00Z" },
  { id: "i4", service: "database", title: "Database connection pool exhausted", severity: "critical", status: "open", environment: "PROD", createdAt: "2026-08-07T12:15:00Z" },
  { id: "i5", service: "notification-service", title: "Notification service unresponsive", severity: "critical", status: "open", environment: "QA", createdAt: "2026-08-06T14:30:00Z" },
  { id: "i6", service: "api-orders", title: "Slow order queries in QA", severity: "warning", status: "acknowledged", environment: "QA", createdAt: "2026-08-06T15:00:00Z" },
  { id: "i7", service: "authentication", title: "Auth token expiry mismatch", severity: "warning", status: "open", environment: "QA", createdAt: "2026-08-06T16:00:00Z" },
  { id: "i8", service: "frontend-web", title: "CSS build artifacts missing", severity: "info", status: "resolved", environment: "QA", createdAt: "2026-08-05T09:00:00Z" },
  { id: "i9", service: "api-payments", title: "Payment sandbox test failures", severity: "warning", status: "open", environment: "DEV", createdAt: "2026-08-06T17:00:00Z" },
  { id: "i10", service: "frontend-web", title: "Hot reload not working", severity: "info", status: "open", environment: "DEV", createdAt: "2026-08-07T08:00:00Z" },
  { id: "i11", service: "api-orders", title: "Missing env variable in dev config", severity: "warning", status: "resolved", environment: "DEV", createdAt: "2026-08-04T10:00:00Z" },
  { id: "i12", service: "database", title: "Dev DB migration script failing", severity: "info", status: "acknowledged", environment: "DEV", createdAt: "2026-08-07T13:00:00Z" },
];
