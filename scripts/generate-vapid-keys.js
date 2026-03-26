/**
 * Run ONCE to generate VAPID keys for push notifications:
 *   node scripts/generate-vapid-keys.js
 *
 * Copy the output into your .env.local
 */

const webpush = require("web-push");
const keys = webpush.generateVAPIDKeys();

console.log("\nVAPID Keys generated — copy into .env.local:\n");
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + keys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + keys.privateKey);
console.log("\nKeep the private key secret. Never commit it to git.\n");
