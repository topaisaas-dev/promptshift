/**
 * PromptShift Server Telemetry Store — Sovereign Ephemeral Ring Buffer
 * Unifies server-side events from Web Analytics, MCP JSON-RPC, CLI HTTP-402,
 * LLMO Crawlers, Polar Express Checkouts, and Polar Webhooks with ZERO PII.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { AnalyticsEvent } from './analyticsTypes';

const MAX_SERVER_BUFFER = 2000;

function getPersistencePath(): string {
  try {
    if (fs.existsSync('/tmp')) {
      return '/tmp/promptshift_telemetry.json';
    }
  } catch {
    // fallback
  }
  return path.join(os.tmpdir(), 'promptshift_telemetry.json');
}

function loadPersistedBuffer(): AnalyticsEvent[] {
  try {
    const filePath = getPersistencePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore read errors
  }
  return [];
}

function savePersistedBuffer(buffer: AnalyticsEvent[]): void {
  try {
    const filePath = getPersistencePath();
    fs.writeFileSync(filePath, JSON.stringify(buffer.slice(0, 500)), 'utf-8');
  } catch {
    // Ignore write errors on read-only environments
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __promptshiftTelemetryBuffer: AnalyticsEvent[] | undefined;
}

function getBuffer(): AnalyticsEvent[] {
  if (!globalThis.__promptshiftTelemetryBuffer) {
    globalThis.__promptshiftTelemetryBuffer = loadPersistedBuffer();
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

    savePersistedBuffer(buffer);

    return enriched;
  }

  public static getAll(): AnalyticsEvent[] {
    return getBuffer();
  }

  public static clear(): void {
    const buffer = getBuffer();
    buffer.length = 0;
    savePersistedBuffer(buffer);
  }
}
