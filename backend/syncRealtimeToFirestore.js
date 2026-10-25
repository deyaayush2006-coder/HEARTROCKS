console.log("[Sync] syncRealtimeToFirestore loaded");

const { firestore, realtimeDB } = require("./firebase");
const { getIO } = require("./socket/socket");

// ── Listen to the path your ESP32 writes to ──────────────────────────────────
// Adjust "/healthData" below if your ESP32 writes to a different RTDB path.
// Expected RTDB shape: { bpm: number, spo2: number, deviceId?: string }
const ref = realtimeDB.ref("/healthData");

let lastBpm  = null;
let lastSpo2 = null;

console.log("[Sync] Listening to RTDB /healthData ...");

ref.on("value", async (snapshot) => {

    const data = snapshot.val();

    if (!data) {
        console.log("[Sync] RTDB snapshot empty — skipping");
        return;
    }

    const bpm      = Number(data.bpm);
    const spo2     = Number(data.spo2);
    const deviceId = data.deviceId || "ESP32";

    // Skip if values haven't changed (avoids duplicate Firestore writes)
    if (bpm === lastBpm && spo2 === lastSpo2) return;

    lastBpm  = bpm;
    lastSpo2 = spo2;

    // Basic validation
    if (isNaN(bpm) || isNaN(spo2)) {
        console.warn("[Sync] Invalid data received:", data);
        return;
    }

    // Derive status
    let status = "Normal";
    if      (spo2 < 90)              status = "Critical Oxygen";
    else if (bpm < 50 || bpm > 120)  status = "Abnormal Heart Rate";

    const healthData = {
        deviceId,
        bpm,
        spo2,
        status,
        timestamp: Date.now(),
    };

    try {
        const docRef = await firestore.collection("healthData").add(healthData);
        const savedData = { id: docRef.id, ...healthData };

        console.log("[Sync] Saved to Firestore:", savedData);

        // Push to all connected frontend clients in real-time
        try {
            getIO().emit("health-update", savedData);
        } catch (socketErr) {
            console.warn("[Sync] Socket emit skipped:", socketErr.message);
        }

    } catch (error) {
        console.error("[Sync] Firestore write error:", error.message);
    }
});