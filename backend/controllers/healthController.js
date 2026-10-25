
const { firestore, realtimeDB } = require("../firebase");
const { getIO } = require("../socket/socket");

// =====================================
// Add Health Data
// =====================================
exports.addHealthData = async (req, res) => {

    try {

        const { deviceId, bpm, spo2 } = req.body;

        if (bpm === undefined || spo2 === undefined) {
            return res.status(400).json({
                success: false,
                message: "Missing BPM or SpO2"
            });
        }

        let status = "Normal";

        if (spo2 < 90) {
            status = "Critical Oxygen";
        }

        const healthData = {
            deviceId: deviceId || "ESP32",
            bpm,
            spo2,
            status,
            timestamp: Date.now()
        };

        // Save to Firestore
        await firestore
            .collection("healthData")
            .add(healthData);

        // Save to Realtime Database
        await realtimeDB
            .ref("healthData")
            .set(healthData);

        // Socket.IO realtime update
        getIO().emit("health-update", healthData);

        res.status(201).json({
            success: true,
            data: healthData
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// =====================================
// Get Latest Data
// =====================================
exports.getLatestData = async (req, res) => {

    try {

        const snapshot = await firestore
            .collection("healthData")
            .orderBy("timestamp", "desc")
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({
                success: false,
                message: "No data found"
            });
        }

        const doc = snapshot.docs[0];

        res.json({
            id: doc.id,
            ...doc.data()
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// =====================================
// Get History
// =====================================
exports.getHistory = async (req, res) => {

    try {

        const snapshot = await firestore
            .collection("healthData")
            .orderBy("timestamp", "desc")
            .limit(100)
            .get();

        const history = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(history);

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
