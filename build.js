// ================================================================
// SCRIPTFLOW PRO - BUILD SCRIPT (UPDATED WITH ENHANCED ERROR HANDLING)
// ================================================================

const fs = require('fs');
const path = require('path');
const root = __dirname;
const dist = path.join(root, 'dist');
const assets = path.join(dist, 'assets');
const src = path.join(root, 'src');

// Clean and create directories
console.log('🧹 Cleaning dist directory...');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(assets, { recursive: true });

// ================================================================
// BUILD INDEX.HTML
// ================================================================

console.log('📄 Building index.html...');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
  .replace(/\s+/g, ' ') // Minify whitespace
  // Remove individual script tags
  .replace(/\s*<script src="js\/(firebase-config|loading|objection-handler|notifications|ics-calendar-sync|app)\.js"><\/script>/g, '')
  // Inject combined runtime
  .replace(/<\/body>/, '<script src="assets/runtime.js" defer></script></body>');
fs.writeFileSync(path.join(dist, 'index.html'), index);

// Copy styles
console.log('🎨 Copying styles...');
fs.copyFileSync(path.join(root, 'style.css'), path.join(assets, 'ui.css'));

// ================================================================
// BUILD RUNTIME - Combine all JavaScript modules in the correct order
// ================================================================

// Order matters for dependencies:
// 1. Firebase config (must load first)
// 2. Loading manager
// 3. Objection handler
// 4. Notification system
// 5. ICS calendar sync
// 6. Main application (depends on all above)
const order = [
  'firebase-config.js',
  'loading.js',
  'objection-handler.js',
  'notifications.js',
  'ics-calendar-sync.js',
  'app.js'
];

// Read and combine all files
let runtimeContent = '';
const errors = [];
const warnings = [];

console.log('📦 Building runtime...');
for (const file of order) {
  const filePath = path.join(src, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Add file marker for debugging
    runtimeContent += `\n// ================================================================\n`;
    runtimeContent += `// FILE: ${file}\n`;
    runtimeContent += `// ================================================================\n`;
    runtimeContent += content;
    runtimeContent += '\n;\n';
    console.log(`  ✅ Loaded: ${file}`);
  } catch (err) {
    errors.push(`Failed to read ${file}: ${err.message}`);
    console.error(`  ❌ ${errors[errors.length - 1]}`);
  }
}

// If any files failed, throw an error
if (errors.length > 0) {
  throw new Error(`Build failed: ${errors.join('; ')}`);
}

// Write the combined runtime
fs.writeFileSync(path.join(assets, 'runtime.js'), runtimeContent);

console.log(`\n✅ Built ${order.length} modules into dist/assets/runtime.js`);
console.log(`📦 Runtime size: ${(runtimeContent.length / 1024).toFixed(1)} KB`);

// ================================================================
// VERIFICATION - Ensure critical features are included
// ================================================================

function verifyRuntime() {
  const runtime = fs.readFileSync(path.join(assets, 'runtime.js'), 'utf8');
  
  const checks = [
    { name: 'Firebase Config', pattern: /firebaseConfig/ },
    { name: 'Connection Manager', pattern: /ConnectionManager/ },
    { name: 'Error Handling', pattern: /handleError/ },
    { name: 'Loading Manager', pattern: /LoadingManager/ },
    { name: 'Notification System', pattern: /NotificationSystem/ },
    { name: 'ICS Calendar Sync', pattern: /ICSCalendarSync/ },
    { name: 'App Initialization', pattern: /initApp/ },
    { name: 'Retry Logic', pattern: /_withRetry/ },
    { name: 'Smart Import', pattern: /SmartImport/ },
    { name: 'Calendar View', pattern: /CalendarView/ },
    { name: 'Feature Panel', pattern: /FeaturePanel/ }
  ];
  
  console.log('\n🔍 Verification:');
  let allPassed = true;
  for (const check of checks) {
    const passed = check.pattern.test(runtime);
    console.log(`  ${passed ? '✅' : '❌'} ${check.name}`);
    if (!passed) allPassed = false;
  }
  
  if (!allPassed) {
    console.warn('⚠️ Some features may be missing. Check the build process.');
  }
  
  return allPassed;
}

const verified = verifyRuntime();

// ================================================================
// CREATE SOURCE MAP FOR DEBUGGING
// ================================================================

console.log('\n📝 Creating source map reference...');
const sourceMap = {
  version: '1.0.0',
  buildTime: new Date().toISOString(),
  modules: order,
  totalSize: `${(runtimeContent.length / 1024).toFixed(1)} KB`,
  verified: verified
};
fs.writeFileSync(
  path.join(assets, 'runtime.json'),
  JSON.stringify(sourceMap, null, 2)
);

console.log('\n🎯 Build complete! Run "npm start" to launch the application.');
console.log('📋 For production, deploy the "dist" folder to your hosting service.');