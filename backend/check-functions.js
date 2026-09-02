import { createRequire } from "module";
const require = createRequire(import.meta.url);

console.log("--- INSPECTING CASHFREE LIBRARY ---");

try {
    const sdk = require("cashfree-pg");
    console.log("SDK Type:", typeof sdk);
    console.log("SDK Keys:", Object.keys(sdk));

    // Try to find the Cashfree object
    const Cashfree = sdk.Cashfree || sdk.default?.Cashfree || sdk;
    
    if (Cashfree) {
        console.log("\n✅ Cashfree Object Found!");
        console.log("Available Functions/Properties:");
        
        // Print all keys inside Cashfree
        console.log(Object.keys(Cashfree));

        // Check specifically for order creation
        if (Cashfree.PGCreateOrder) console.log("\n-> Found: PGCreateOrder");
        else if (Cashfree.createOrder) console.log("\n-> Found: createOrder");
        else console.log("\n❌ Could not find an obvious 'createOrder' function.");
    } else {
        console.log("❌ Cashfree object is empty or missing.");
    }

} catch (e) {
    console.error("Critical Error:", e.message);
}