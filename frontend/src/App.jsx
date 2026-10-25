import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

import Dashboard from "./components/Dashboard";
import AlertSystem from "./components/AlertSystem";
import { analyzeHealth } from "./utils/healthAnalysis";
import { detectArrhythmia } from "./utils/arrhythmiaDetection";

// ─── Config ───────────────────────────────────────────────────────────────────
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const MAX_HISTORY = 120;

// ─── Demo scenario generators ─────────────────────────────────────────────────
function generateScenarioReading(scenario) {
  switch (scenario) {
    case "arrhythmia":
      return {
        bpm: 72 + (Math.random() - 0.5) * 30,   // high variability
        spo2: 96 + (Math.random() - 0.5) * 2,
      };
    case "tachycardia":
      return {
        bpm: 140 + (Math.random() - 0.5) * 20,
        spo2: 94 + (Math.random() - 0.5) * 2,
      };
    case "lowOxygen":
      return {
        bpm: 88 + (Math.random() - 0.5) * 10,
        spo2: 91 + (Math.random() - 0.5) * 3,
      };
    case "normal":
    default:
      return {
        bpm: 72 + (Math.random() - 0.5) * 6,
        spo2: 98 + (Math.random() - 0.5) * 1,
      };
  }
}

// ─── Helper: normalise a raw Firestore/REST doc into a reading ────────────────
function normaliseDoc(doc) {
  return {
    bpm:  Number(doc.bpm)  || 0,
    spo2: Number(doc.spo2) || 0,
    time: doc.timestamp ? new Date(doc.timestamp).toISOString() : new Date().toISOString(),
  };
}

export default function App() {
  const [readings,       setReadings]       = useState([]);
  const [currentReading, setCurrentReading] = useState(null);
  const [alerts,         setAlerts]         = useState([]);
  const [connected,      setConnected]      = useState(false);
  const [scenario,       setScenario]       = useState("normal");

  // Track whether we have live data from backend
  const hasLiveData = useRef(false);
  const alertIdRef  = useRef(0);
  const demoTimerRef = useRef(null);

  // ── Alert helpers ────────────────────────────────────────────────────────
  const pushAlert = useCallback((alert) => {
    const id = ++alertIdRef.current;
    setAlerts((prev) => {
      const exists = prev.some((a) => a.type === alert.type && a.active);
      if (exists) return prev;
      return [{ ...alert, id, timestamp: new Date(), active: true }, ...prev].slice(0, 10);
    });
    if (alert.severity === "info") {
      setTimeout(() => {
        setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, active: false } : a)));
      }, 8000);
    }
  }, []);

  const dismissAlert = useCallback((id) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, active: false } : a)));
  }, []);

  // ── Core reading processor ───────────────────────────────────────────────
  const processReading = useCallback(
    (reading) => {
      setReadings((prev) => {
        const updated = [
          ...prev,
          {
            ...reading,
            bpm:   Math.round(reading.bpm  * 10) / 10,
            spo2:  Math.round(reading.spo2 * 10) / 10,
            label: new Date(reading.time).toLocaleTimeString(),
          },
        ].slice(-MAX_HISTORY);

        const analysis   = analyzeHealth(reading.bpm, reading.spo2);
        const arrhythmia = detectArrhythmia(updated);

        analysis.alerts.forEach((a) => pushAlert(a));
        if (arrhythmia.detected) pushAlert(arrhythmia.alert);

        return updated;
      });
      setCurrentReading(reading);
    },
    [pushAlert]
  );

  // ── 1. Load history from REST on mount ──────────────────────────────────
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/health/history`)
      .then((r) => r.json())
      .then((docs) => {
        if (!Array.isArray(docs) || docs.length === 0) return;
        hasLiveData.current = true;
        const sorted     = [...docs].reverse();
        const normalised = sorted.map(normaliseDoc);
        setReadings(
          normalised.map((r) => ({
            ...r,
            bpm:   Math.round(r.bpm  * 10) / 10,
            spo2:  Math.round(r.spo2 * 10) / 10,
            label: new Date(r.time).toLocaleTimeString(),
          })).slice(-MAX_HISTORY)
        );
        setCurrentReading(normalised[normalised.length - 1]);
      })
      .catch((err) => console.error("History fetch failed:", err));
  }, []);

  // ── 2. Live updates via Socket.io ────────────────────────────────────────
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect",    () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("health-update", (doc) => {
      hasLiveData.current = true;
      // Stop demo mode if live data arrives
      if (demoTimerRef.current) {
        clearInterval(demoTimerRef.current);
        demoTimerRef.current = null;
      }
      processReading(normaliseDoc(doc));
    });

    return () => socket.disconnect();
  }, [processReading]);

  // ── 3. Demo mode — only runs when no live backend data ───────────────────
  useEffect(() => {
    // Clear any existing demo timer
    if (demoTimerRef.current) {
      clearInterval(demoTimerRef.current);
      demoTimerRef.current = null;
    }

    // Don't start demo if we have real data
    if (hasLiveData.current) return;

    // Seed initial demo readings
    const seed = Array.from({ length: 20 }, (_, i) => {
      const raw = generateScenarioReading(scenario);
      const time = new Date(Date.now() - (20 - i) * 2000).toISOString();
      return {
        bpm:   Math.round(raw.bpm  * 10) / 10,
        spo2:  Math.round(raw.spo2 * 10) / 10,
        time,
        label: new Date(time).toLocaleTimeString(),
      };
    });

    setReadings(seed);
    setCurrentReading(seed[seed.length - 1]);
    setAlerts([]);

    // Tick every 2 s to simulate live feed
    demoTimerRef.current = setInterval(() => {
      if (hasLiveData.current) {
        clearInterval(demoTimerRef.current);
        demoTimerRef.current = null;
        return;
      }
      const raw = generateScenarioReading(scenario);
      processReading({
        ...raw,
        time: new Date().toISOString(),
      });
    }, 2000);

    return () => {
      if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    };
  }, [scenario, processReading]);

  // ── Derived state ────────────────────────────────────────────────────────
  const analysis   = currentReading ? analyzeHealth(currentReading.bpm, currentReading.spo2) : null;
  const arrhythmia = readings.length > 10 ? detectArrhythmia(readings) : null;

  return (
    <div className="app-root">
      <AlertSystem alerts={alerts} onDismiss={dismissAlert} />
      <Dashboard
        readings={readings}
        currentReading={currentReading}
        analysis={analysis}
        arrhythmia={arrhythmia}
        connected={connected}
        scenario={scenario}
        setScenario={setScenario}
      />
    </div>
  );
}

