import { useEffect, useRef } from 'react';
import axios from 'axios';

const HEARTBEAT_INTERVAL_MS = 10000; // send heartbeat every 10 seconds
const BACKEND = import.meta.env.VITE_BACKEND_API_URL;

/**
 * Maintains a single-tab lock for an assessment session.
 *
 * - Sends a heartbeat immediately on mount and every 10 s thereafter.
 * - Also sends a heartbeat on visibilitychange so the timestamp is
 *   refreshed the moment the tab goes to the background — preventing
 *   a newly-opened tab from seeing a stale slot.
 * - On eviction, tries to re-claim once before actually navigating away
 *   (guards against false-positive stale detection).
 * - Sends a best-effort release beacon when the tab/window is truly closed
 *   (does NOT fire on in-app React Router navigation).
 */
export function useTabClaim({ launchTokenId, tabId, enabled = true, onEvicted }) {
  const heartbeatRef = useRef(null);
  const onEvictedRef = useRef(onEvicted);
  onEvictedRef.current = onEvicted;

  useEffect(() => {
    if (!enabled || !launchTokenId || !tabId) return;

    let aborted = false;

    const sendHeartbeat = async () => {
      if (aborted) return;
      try {
        const res = await axios.post(`${BACKEND}/aon/tab-heartbeat`, {
          launchTokenId,
          tabId,
        });
        if (res.data?.status === 'evicted') {
          // Before logging out, try to re-claim the slot.
          // This handles false-positive stale detection caused by
          // browser background-tab throttling.
          try {
            const reclaimRes = await axios.post(`${BACKEND}/aon/claim-tab`, {
              launchTokenId,
              tabId,
            });
            if (reclaimRes.data?.status === 'allowed') {
              return; // Successfully re-claimed — stay in assessment
            }
          } catch (_) {
            // Ignore re-claim network errors
          }
          // Another tab genuinely holds the slot
          if (!aborted) {
            clearInterval(heartbeatRef.current);
            heartbeatRef.current = null;
            onEvictedRef.current?.();
          }
        }
      } catch (e) {
        // Network hiccup — keep trying on next interval
        console.warn('Tab heartbeat failed:', e.message);
      }
    };

    // Fire immediately on mount so the timestamp is fresh
    sendHeartbeat();

    // Periodic heartbeat
    heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    // Fire whenever the tab's visibility changes.
    // Most importantly: when this tab goes to the background (hidden),
    // we refresh the timestamp BEFORE another tab can open and see a
    // stale slot, preventing false eviction of the real active tab.
    const handleVisibilityChange = () => sendHeartbeat();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Release the slot when the tab/window is actually closed.
    // NOTE: beforeunload does NOT fire for in-app React Router navigation.
    const handleUnload = () => {
      const params = new URLSearchParams({
        launchTokenId: String(launchTokenId),
        tabId,
      });
      try {
        navigator.sendBeacon(`${BACKEND}/aon/release-tab`, params);
      } catch (_) {
        // Ignore — best-effort only
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      aborted = true;
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [enabled, launchTokenId, tabId]);
}
