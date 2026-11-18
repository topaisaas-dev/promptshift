/**
 * PromptShift Server Telemetry Store — Sovereign Ephemeral Ring Buffer
 * Unifies server-side events from Web Analytics, MCP JSON-RPC, CLI HTTP-402,
 * LLMO Crawlers, Polar Express Checkouts, and Polar Webhooks with ZERO PII.
 * Safely merges /tmp snapshots across warm reads without blocking request failure.
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

function loadPersistedBuffer(): { events: AnalyticsEvent[]; mtimeMs: number } {
  try {
    const filePath = getPersistencePath();
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return { events: parsed, mtimeMs: stat.mtimeMs };
      }
    }
  } catch {
    // Ignore read errors
  }
  return { events: [], mtimeMs: 0 };
}

function savePersistedBuffer(buffer: AnalyticsEvent[]): number {
  try {
    const filePath = getPersistencePath();
    fs.writeFileSync(filePath, JSON.stringify(buffer.slice(0, 500)), 'utf-8');
    return fs.statSync(filePath).mtimeMs;
  } catch {
    // Ignore write errors on read-only environments
    return 0;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __promptshiftTelemetryBuffer: AnalyticsEvent[] | undefined;
  // eslint-disable-next-line no-var
  var __promptshiftTelemetryMtime: number | undefined;
}

function getBuffer(): AnalyticsEvent[] {
  if (!globalThis.__promptshiftTelemetryBuffer) {
    const loaded = loadPersistedBuffer();
    globalThis.__promptshiftTelemetryBuffer = loaded.events;
    globalThis.__promptshiftTelemetryMtime = loaded.mtimeMs;
    return globalThis.__promptshiftTelemetryBuffer;
  }

  // Re-sync if another worker in the same warm container updated /tmp
  try {
    const filePath = getPersistencePath();
    if (fs.existsSync(filePath)) {
      const mtimeMs = fs.statSync(filePath).mtimeMs;
      if (mtimeMs > (globalThis.__promptshiftTelemetryMtime || 0)) {
        const loaded = loadPersistedBuffer();
        const byId = new Map<string, AnalyticsEvent>();
        for (const ev of globalThis.__promptshiftTelemetryBuffer) {
          if (ev?.id) byId.set(ev.id, ev);
        }
        for (const ev of loaded.events) {
          if (ev?.id && !byId.has(ev.id)) byId.set(ev.id, ev);
        }
        globalThis.__promptshiftTelemetryBuffer = Array.from(byId.values())
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, MAX_SERVER_BUFFER);
        globalThis.__promptshiftTelemetryMtime = loaded.mtimeMs;
      }
    }
  } catch {
    // Ignore stat/read errors
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

    const mtime = savePersistedBuffer(buffer);
    if (mtime > 0) {
      globalThis.__promptshiftTelemetryMtime = mtime;
    }

    return enriched;
  }

  public static getAll(): AnalyticsEvent[] {
    return getBuffer();
  }

  public static clear(): void {
    const buffer = getBuffer();
    buffer.length = 0;
    const mtime = savePersistedBuffer(buffer);
    globalThis.__promptshiftTelemetryMtime = mtime;
  }
}
