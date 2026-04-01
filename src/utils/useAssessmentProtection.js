import { useEffect, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';

/**
 * Request fullscreen on the document element.
 */
export function enterFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) {
    return el.requestFullscreen();
  } else if (el.webkitRequestFullscreen) {
    return el.webkitRequestFullscreen();
  } else if (el.msRequestFullscreen) {
    return el.msRequestFullscreen();
  }
  return Promise.resolve();
}

/**
 * Check if currently in fullscreen mode.
 */
export function isFullscreen() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
}

/**
 * Hook that detects tab switches during assessment and enforces fullscreen.
 *
 * - 1st tab switch: SweetAlert warning
 * - 2nd tab switch: auto-submit (code editor) or logout
 *
 * @param {Object} options
 * @param {Function} options.onAutoSubmit - Called on 2nd violation if on code editor page
 * @param {boolean} options.isCodeEditorPage - Whether current page is the code editor
 * @param {boolean} options.enabled - Whether protection is active (default: true)
 */
export function useAssessmentProtection({
  onAutoSubmit,
  isCodeEditorPage = false,
  enabled = true,
} = {}) {
  const isProcessingRef = useRef(false);
  const onAutoSubmitRef = useRef(onAutoSubmit);

  // Keep the callback ref up to date without re-registering the listener
  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit;
  }, [onAutoSubmit]);

  const handleVisibilityChange = useCallback(() => {
    if (!enabled || isProcessingRef.current) return;

    if (document.visibilityState === 'hidden') {
      const count =
        parseInt(sessionStorage.getItem('tabSwitchCount') || '0', 10) + 1;
      sessionStorage.setItem('tabSwitchCount', count.toString());

      if (count >= 2) {
        isProcessingRef.current = true;

        if (isCodeEditorPage && onAutoSubmitRef.current) {
          // Show a brief alert then auto-submit
          Swal.fire({
            icon: 'error',
            title: 'Assessment Auto-Submitted',
            text: 'You switched tabs again. Your assessment has been automatically submitted.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33',
            allowOutsideClick: false,
            allowEscapeKey: false,
            timer: 3000,
            timerProgressBar: true,
          });
          onAutoSubmitRef.current();
        } else {
          // Not on code editor – just logout
          Swal.fire({
            icon: 'error',
            title: 'Session Terminated',
            text: 'You switched tabs again. You have been logged out.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33',
            allowOutsideClick: false,
            allowEscapeKey: false,
            timer: 3000,
            timerProgressBar: true,
          });
          sessionStorage.removeItem('userRole');
          sessionStorage.removeItem('examEndTime');
          sessionStorage.removeItem('launchToken');
          sessionStorage.removeItem('tabSwitchCount');
          sessionStorage.removeItem('assessmentFullscreen');
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        }
      }
    } else if (
      document.visibilityState === 'visible' &&
      !isProcessingRef.current
    ) {
      const count = parseInt(
        sessionStorage.getItem('tabSwitchCount') || '0',
        10
      );

      if (count === 1) {
        Swal.fire({
          icon: 'warning',
          title: 'Tab Switch Detected',
          html: `
            <p style="font-size: 15px; color: #555; margin-bottom: 8px;">
              Switching tabs or windows during the assessment is <strong>strictly prohibited</strong>.
            </p>
            <p style="font-size: 15px; color: #d33;">
              <strong>Warning:</strong> On the next tab switch, your assessment will be automatically submitted and you will be logged out.
            </p>
          `,
          confirmButtonText: 'I Understand',
          confirmButtonColor: '#7c3aed',
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          // Re-enter fullscreen after user acknowledges
          if (!isFullscreen()) {
            enterFullscreen().catch(() => {});
          }
        });
      }
    }
  }, [enabled, isCodeEditorPage]);

  useEffect(() => {
    if (!enabled) return;

    // Try to maintain fullscreen on mount (works if triggered by prior user gesture)
    if (
      !isFullscreen() &&
      sessionStorage.getItem('assessmentFullscreen') === 'true'
    ) {
      enterFullscreen().catch(() => {});
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, handleVisibilityChange]);
}
