require("dotenv").config();
require("./syncRealtimeToFirestore");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const http = require("http");

const { initSocket, getIO } = require("./socket/socket");
const {firestore} = require("./firebase");

const app = express();
const server = http.createServer(app);

initSocket(server);

// =============================
// Middlewares
// =============================
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// =============================
// Home Route
// =============================
app.get("/", (req, res) => {
    res.send("Pulse Oximeter Backend Running");
});

// =============================
// POST Health Data
// =============================
app.post("/api/health", async (req, res) => {

    try {

        const { deviceId, bpm, spo2 } = req.body;

        if (bpm == undefined || spo2 == undefined) {
            return res.status(400).json({
                success: false,
                message: "Missing fields"
            });
        }

        let status = "Normal";

        if (spo2 < 90) {
            status = "Critical Oxygen";
        }
        else if (bpm < 50 || bpm > 120) {
            status = "Abnormal Heart Rate";
        }

        const healthData = {
            deviceId: deviceId || "ESP32",
            bpm,
            spo2,
            status,
            timestamp: Date.now()
        };

        // Save to Firestore
        const docRef = await firestore
            .collection("healthData")
            .add(healthData);

        const savedData = {
            id: docRef.id,
            ...healthData
        };

        // Realtime socket
        getIO().emit("health-update", savedData);

        res.status(201).json({
            success: true,
            message: "Health Data Received",
            data: savedData
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});

// =============================
// GET Latest Data
// =============================
app.get("/api/health/latest", async (req, res) => {

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
// console.log("Latest data sent:", {
//     id: doc.id,
//     ...doc.data()
// });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error Fetching Latest Data"
        });
    }
});

// =============================
// GET History
// =============================
app.get("/api/health/history", async (req, res) => {

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

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Error Fetching History"
        });
    }
});

// =============================
// Start Server
// =============================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});