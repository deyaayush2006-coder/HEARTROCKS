const express = require("express");

const router = express.Router();

const {
    addHealthData,
    getLatestData,
    getHistory
} = require("../controllers/healthController");


router.post("/", addHealthData);

router.get("/latest", getLatestData);

router.get("/history", getHistory);

module.exports = router;