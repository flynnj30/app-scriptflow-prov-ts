// @ts-nocheck
// ================================================================
// FIREBASE CONFIGURATION - WITH ENHANCED NETWORK RESILIENCE
// ================================================================

const firebaseConfig = {
    apiKey: "AIzaSyD_Ry0pM7EKSDJeTegt0rY5muiw-xCgrhw",
    authDomain: "scriptflow-pro-2cf4c.firebaseapp.com",
    projectId: "scriptflow-pro-2cf4c",
    storageBucket: "scriptflow-pro-2cf4c.firebasestorage.app",
    messagingSenderId: "250157640936",
    appId: "1:250157640936:web:cd6218470c302b305aed5d"
};

// State
let firebaseInitialized = false;
let firebaseInitAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;
let initResolve = null;
let initReject = null;
let initPromise = null;

/**
 * Initialize Firebase with network resilience
 */
function initFirebase() {
    if (initPromise) return initPromise;
    
    initPromise = new Promise((resolve, reject) => {
        initResolve = resolve;
        initReject = reject;
        
        // Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK not loaded, waiting...');
            let checkCount = 0;
            const checkInterval = setInterval(() => {
                checkCount++;
                if (typeof firebase !== 'undefined') {
                    clearInterval(checkInterval);
                    attemptInit();
                } else if (checkCount > 20) {
                    clearInterval(checkInterval);
                    reject(new Error('Firebase SDK failed to load'));
                }
            }, 500);
            return;
        }
        
        attemptInit();
    });
    
    return initPromise;
}

function attemptInit() {
    try {
        if (firebase.apps && firebase.apps.length > 0) {
            console.log('✅ Firebase already initialized');
            applyModernCacheSettings();
            firebaseInitialized = true;
            if (initResolve) initResolve(true);
            return;
        }
        
        firebase.initializeApp(firebaseConfig);
        firebaseInitialized = true;
        console.log('✅ Firebase initialized successfully');
        
        applyModernCacheSettings();
        
        if (initResolve) initResolve(true);
        
    } catch (e) {
        console.warn('⚠️ Firebase initialization failed:', e.message);
        
        if (firebaseInitAttempts < MAX_INIT_ATTEMPTS) {
            firebaseInitAttempts++;
            console.log(`🔄 Retrying Firebase init (attempt ${firebaseInitAttempts}/${MAX_INIT_ATTEMPTS})...`);
            
            const loadingSubtitle = document.querySelector('.loading-subtitle');
            if (loadingSubtitle) {
                loadingSubtitle.textContent = `Retrying connection (${firebaseInitAttempts}/${MAX_INIT_ATTEMPTS})...`;
            }
            
            setTimeout(() => {
                attemptInit();
            }, 2000);
        } else {
            console.error('❌ Firebase initialization failed after max attempts');
            if (initReject) initReject(e);
        }
    }
}

/**
 * Configure Firestore with network resilience settings
 */
function applyModernCacheSettings() {
    try {
        const db = firebase.firestore();
        if (db) {
            // Configure Firestore for better network resilience
            // Use fetch streams for more reliable connections
            db.settings({
                experimentalAutoDetectLongPolling: true,
                useFetchStreams: true,
                // Shorter timeout for faster failure detection
                timeout: 7000
            });
            
            // Enable offline persistence if available
            try {
                db.enablePersistence({
                    synchronizeTabs: false
                }).catch(err => {
                    console.warn('⚠️ Firestore persistence not available:', err.message);
                });
            } catch (e) {
                console.warn('⚠️ Firestore persistence setup skipped:', e.message);
            }
            
            console.log('✅ Firestore configured with network resilience');
        }
    } catch (e) {
        console.warn('⚠️ Firestore configuration skipped:', e.message);
    }
}

// Start initialization immediately
const firebaseInitPromise = initFirebase();

// Expose Firebase status check with network monitoring
window.isFirebaseReady = function() {
    return firebaseInitialized && typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0;
};

window.getFirebase = function() {
    if (window.isFirebaseReady()) {
        return firebase;
    }
    return null;
};

window.getFirestore = function() {
    const fb = window.getFirebase();
    if (fb) {
        try {
            return fb.firestore();
        } catch (e) {
            console.warn('⚠️ Firestore not available:', e.message);
            return null;
        }
    }
    return null;
};

window.getAuth = function() {
    const fb = window.getFirebase();
    if (fb) {
        try {
            return fb.auth();
        } catch (e) {
            console.warn('⚠️ Auth not available:', e.message);
            return null;
        }
    }
    return null;
};

// Wait for Firebase to be ready
window.waitForFirebase = function() {
    return firebaseInitPromise;
};

console.log('🔧 Firebase config loaded with network resilience');