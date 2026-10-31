/**
 * PromptShift Server Telemetry Store — Sovereign Ephemeral Ring Buffer
 * Unifies server-side events from Web Analytics, MCP JSON-RPC, CLI HTTP-402,
 * LLMO Crawlers, Polar Express Checkouts, and Polar Webhooks with ZERO PII.
 */

import { AnalyticsEvent } from './analyticsTypes';

const MAX_SERVER_BUFFER = 2000;

declare global {
  // eslint-disable-next-line no-var
  var __promptshiftTelemetryBuffer: AnalyticsEvent[] | undefined;
}

function getBuffer(): AnalyticsEvent[] {
  if (!globalThis.__promptshiftTelemetryBuffer) {
    globalThis.__promptshiftTelemetryBuffer = [];
  }
  return globalThis.__promptshiftTelemetryBuffer;
}

export class ServerTelemetryStore {
  public static record(
    event: Omit<AnalyticsEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
  ): AnalyticsEvent {
    const buffer = getBuffer();
    const enriched: AnalyticsEvent = {
      ...event,
      id: event.id || `ev_srv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    buffer.unshift(enriched);
    if (buffer.length > MAX_SERVER_BUFFER) {
      buffer.splice(MAX_SERVER_BUFFER);
    }

    return enriched;
  }

  public static getAll(): AnalyticsEvent[] {
    return getBuffer();
  }

  public static clear(): void {
    const buffer = getBuffer();
    buffer.length = 0;
  }
}
