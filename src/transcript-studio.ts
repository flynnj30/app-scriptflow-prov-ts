// @ts-nocheck
/* ================================================================
 * TRANSCRIPT STUDIO LAUNCHER
 * Additive integration: does not modify ScriptFlow's existing app logic.
 * ================================================================ */
(function () {
    'use strict';

    const TRANSCRIPT_STUDIO_URL = 'https://transcript-studio-n0nv.onrender.com';
    const WINDOW_NAME = 'scriptflow-transcript-studio';

    function openTranscriptStudio() {
        // Always use the exact deployed Transcript Studio URL.
        // Opening in a named tab prevents repeated clicks from creating
        // unnecessary duplicate windows while keeping ScriptFlow open.
        const popup = window.open(TRANSCRIPT_STUDIO_URL, WINDOW_NAME, 'noopener,noreferrer');

        if (!popup) {
            // Browsers can block window.open when it is not triggered by a
            // direct user gesture. This fallback navigates the current tab.
            window.location.assign(TRANSCRIPT_STUDIO_URL);
            return;
        }

        try {
            popup.focus();
        } catch (_) {
            // Some browsers restrict focus across origins; opening still works.
        }
    }

    function bindLauncher(id) {
        const element = document.getElementById(id);
        if (!element || element.dataset.transcriptStudioBound === 'true') return;

        element.dataset.transcriptStudioBound = 'true';
        element.addEventListener('click', openTranscriptStudio);

        // The sidebar entry is a button but retains menuitem semantics.
        element.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openTranscriptStudio();
            }
        });
    }

    function init() {
        bindLauncher('openTranscriptStudioBtn');
        bindLauncher('openTranscriptStudioToolBtn');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    // Small public API for any future ScriptFlow module that wants to launch
    // the tool without duplicating the URL or window logic.
    window.ScriptFlowTranscriptStudio = Object.freeze({
        url: TRANSCRIPT_STUDIO_URL,
        open: openTranscriptStudio
    });
})();
