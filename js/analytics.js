// ======================== ANALYTICS / EVENT TRACKING ========================
// Fires Google Ads (gtag) events at key acquisition checkpoints.
// Loaded after i18n.js, before config.js. Safe to call even if gtag is missing.
//
// Usage: trackEvent('event_name', { key: 'value' })
// All events are fire-once per session unless noted.

(function() {
  'use strict';

  const _fired = {};

  function trackEvent(eventName, params) {
    // Fire-once guard (per session)
    if (_fired[eventName]) return;
    _fired[eventName] = true;

    const eventParams = Object.assign({
      send_to: 'AW-17975743100',
      event_category: 'game',
      non_interaction: false,
    }, params || {});

    // gtag
    if (typeof gtag === 'function') {
      gtag('event', eventName, eventParams);
    }

    // Also push to dataLayer for GTM compatibility
    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push(Object.assign({ event: eventName }, eventParams));
    }

    console.log('[Analytics]', eventName, eventParams);
  }

  // Allow repeated firing for stage events (different stage numbers)
  function trackStageEvent(eventName, stageNum, params) {
    const key = eventName + '_' + stageNum;
    if (_fired[key]) return;
    _fired[key] = true;

    const eventParams = Object.assign({
      send_to: 'AW-17975743100',
      event_category: 'game',
      stage: stageNum,
    }, params || {});

    if (typeof gtag === 'function') {
      gtag('event', eventName, eventParams);
    }
    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push(Object.assign({ event: eventName }, eventParams));
    }
    console.log('[Analytics]', eventName, eventParams);
  }

  // Expose globally
  window.trackEvent = trackEvent;
  window.trackStageEvent = trackStageEvent;
})();
