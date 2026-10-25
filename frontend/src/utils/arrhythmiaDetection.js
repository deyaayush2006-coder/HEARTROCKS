/**
 * Arrhythmia detection using RR-interval variability simulation.
 * In a real device, you'd get actual RR intervals from the sensor.
 * Here we derive them from consecutive BPM readings.
 */

export function detectArrhythmia(readings) {
  if (readings.length < 15) {
    return { detected: false, type: null, confidence: 0, details: null };
  }

  const recent = readings.slice(-30);
  const bpms = recent.map((r) => r.bpm);

  // Convert BPM to RR intervals (ms)
  const rrIntervals = bpms.map((bpm) => (60 / bpm) * 1000);

  // ── Statistical metrics ───────────────────────────────────────
  const mean = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length;
  const variance = rrIntervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rrIntervals.length;
  const sdnn = Math.sqrt(variance); // Standard deviation of NN intervals

  // RMSSD: Root mean square of successive differences
  const successiveDiffs = [];
  for (let i = 1; i < rrIntervals.length; i++) {
    successiveDiffs.push(Math.pow(rrIntervals[i] - rrIntervals[i - 1], 2));
  }
  const rmssd = Math.sqrt(successiveDiffs.reduce((a, b) => a + b, 0) / successiveDiffs.length);

  // pNN50: percentage of successive differences > 50ms
  const nn50 = successiveDiffs.filter((d) => Math.sqrt(d) > 50).length;
  const pnn50 = (nn50 / successiveDiffs.length) * 100;

  // Max BPM deviation from mean
  const meanBPM = bpms.reduce((a, b) => a + b, 0) / bpms.length;
  const bpmDeviations = bpms.map((b) => Math.abs(b - meanBPM));
  const maxDeviation = Math.max(...bpmDeviations);

  // Detect irregular beats (outliers > 2 sigma)
  const bpmSd = Math.sqrt(bpms.reduce((a, b) => a + Math.pow(b - meanBPM, 2), 0) / bpms.length);
  const irregularBeats = bpms.filter((b) => Math.abs(b - meanBPM) > 2 * bpmSd).length;
  const irregularPercent = (irregularBeats / bpms.length) * 100;

  // ── Arrhythmia classification ─────────────────────────────────
  let detected = false;
  let type = null;
  let confidence = 0;
  let severity = "info";
  let description = "";

  // Atrial Fibrillation: high RR variability, irregular rhythm
  if (sdnn > 80 && rmssd > 60 && irregularPercent > 20) {
    detected = true;
    type = "Atrial Fibrillation (AFib)";
    confidence = Math.min(95, Math.round(40 + sdnn * 0.3 + irregularPercent * 0.8));
    severity = "critical";
    description =
      "Irregular, rapid heart rhythm detected. AFib can cause blood clots, stroke, and heart failure. Immediate medical evaluation required.";
  }
  // Premature Ventricular Contractions: occasional outlier beats
  else if (irregularPercent > 10 && irregularPercent <= 20 && sdnn > 50) {
    detected = true;
    type = "Premature Ventricular Contractions (PVCs)";
    confidence = Math.min(85, Math.round(30 + irregularPercent * 2 + sdnn * 0.3));
    severity = "warning";
    description =
      "Extra heartbeats originating from the ventricles. Often benign but may indicate underlying heart disease. Consult a cardiologist.";
  }
  // Sinus Tachycardia with irregularity
  else if (meanBPM > 100 && sdnn > 40 && irregularPercent > 5) {
    detected = true;
    type = "Irregular Tachycardia";
    confidence = Math.min(80, Math.round(25 + sdnn * 0.4 + irregularPercent));
    severity = "warning";
    description =
      "Fast and irregular heart rhythm. Could indicate supraventricular tachycardia or other arrhythmias.";
  }
  // Sinus Bradycardia with irregularity
  else if (meanBPM < 60 && sdnn > 35 && irregularPercent > 8) {
    detected = true;
    type = "Irregular Bradycardia";
    confidence = Math.min(75, Math.round(20 + sdnn * 0.3 + irregularPercent * 1.2));
    severity = "warning";
    description =
      "Slow and irregular heart rhythm. May indicate sick sinus syndrome or AV block.";
  }

  const alert = detected
    ? {
        type: `arrhythmia_${type?.replace(/\s/g, "_").toLowerCase()}`,
        severity,
        title: `Arrhythmia Detected: ${type}`,
        message: `${confidence}% confidence. ${description.split(".")[0]}.`,
      }
    : null;

  return {
    detected,
    type,
    confidence,
    severity,
    description,
    alert,
    metrics: {
      sdnn: Math.round(sdnn),
      rmssd: Math.round(rmssd),
      pnn50: Math.round(pnn50),
      meanBPM: Math.round(meanBPM * 10) / 10,
      bpmSd: Math.round(bpmSd * 10) / 10,
      irregularPercent: Math.round(irregularPercent),
      maxDeviation: Math.round(maxDeviation * 10) / 10,
    },
  };
}

export function getHRVInterpretation(sdnn) {
  if (sdnn < 20) return { level: "Very Poor", color: "red", advice: "High cardiac risk. Significant autonomic dysfunction." };
  if (sdnn < 40) return { level: "Poor", color: "orange", advice: "Below average HRV. Increased stress or fatigue." };
  if (sdnn < 60) return { level: "Average", color: "yellow", advice: "Moderate HRV. Room for improvement." };
  if (sdnn < 80) return { level: "Good", color: "green", advice: "Good autonomic nervous system balance." };
  return { level: "Excellent", color: "emerald", advice: "Excellent cardiovascular health and resilience." };
}
