/**
 * FAILSAFE ROOT SCRIPT
 * This script ensures Render runs the backend correctly 
 * even if the Root Directory is not set correctly.
 */
console.log("⚠️ Starting Root Redirector to /backend...");
const path = require('path');
const fs = require('fs');

// Path to the real server
const realServerPath = path.join(__dirname, 'backend', 'server.js');

if (fs.existsSync(realServerPath)) {
    console.log("✅ Real server found at /backend/server.js. Redirecting...");
    require('./backend/server.js');
} else {
    console.error("❌ ERROR: Could not find /backend/server.js!");
    process.exit(1);
}
