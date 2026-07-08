/**
 * Custom app entry point — runs before expo-router/entry and before any
 * other module is evaluated.
 *
 * WHY THIS EXISTS:
 * The global error handler was previously set inside app/_layout.tsx. But if
 * any module crashes during its own evaluation (before React mounts _layout),
 * the handler is not yet active and the real JS exception is swallowed, leaving
 * only the opaque "com.facebook.react.common.JavascriptException" in Logcat.
 *
 * By installing the handler here — the very first code the JS runtime touches —
 * every JavascriptException is captured with its real message and stack trace.
 *
 * LOGCAT FILTER:
 *   adb logcat | grep -E "BEADS|ReactNativeJS|AndroidRuntime|FATAL"
 */

/* eslint-disable no-undef */
if (typeof ErrorUtils !== 'undefined') {
  ErrorUtils.setGlobalHandler(function (error, isFatal) {
    var msg   = (error && error.message) ? String(error.message) : '(no message)';
    var stack = (error && error.stack)   ? String(error.stack)   : '(no stack)';
    console.log('=== BEADS FATAL JS ERROR ===');
    console.log('BEADS isFatal : ' + String(isFatal));
    console.log('BEADS message : ' + msg);
    console.log('BEADS stack   : ' + stack);
    console.log('=== END BEADS ERROR ===');
  });
}

console.log('BEADS [0] entry.js — error handler installed before any module loads');

// Hand off to expo-router's standard entry (registers the root component).
require('expo-router/entry');
