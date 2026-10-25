export function analyzeHealth(bpm, spo2) {
  const alerts = [];
  let heartAttackRisk = 0;
  let overallStatus = "normal";

  // ── SpO2 Analysis ──────────────────────────────────────────────
  let spo2Zone, spo2Color, spo2Description;
  if (spo2 >= 97) {
    spo2Zone = "Optimal";
    spo2Color = "emerald";
    spo2Description = "Excellent oxygen saturation. Lungs and circulatory system functioning optimally.";
  } else if (spo2 >= 95) {
    spo2Zone = "Normal";
    spo2Color = "green";
    spo2Description = "Normal oxygen saturation. No intervention needed.";
  } else if (spo2 >= 92) {
    spo2Zone = "Below Normal";
    spo2Color = "yellow";
    spo2Description = "Slightly low. Monitor closely. May indicate mild respiratory compromise.";
    overallStatus = "warning";
    heartAttackRisk += 10;
    alerts.push({
      type: "spo2_low",
      severity: "warning",
      title: "Low SpO₂ Detected",
      message: `SpO₂ at ${spo2.toFixed(1)}% — below normal range. Consider deep breathing exercises.`,
    });
  } else if (spo2 >= 88) {
    spo2Zone = "Low";
    spo2Color = "orange";
    spo2Description = "Significantly low. Risk of hypoxemia. Immediate medical attention advised.";
    overallStatus = "danger";
    heartAttackRisk += 25;
    alerts.push({
      type: "spo2_critical",
      severity: "critical",
      title: "Critical SpO₂ Level",
      message: `SpO₂ at ${spo2.toFixed(1)}% — dangerously low. Seek immediate medical attention!`,
    });
  } else {
    spo2Zone = "Critical";
    spo2Color = "red";
    spo2Description = "Severe hypoxemia. Emergency medical intervention required immediately.";
    overallStatus = "emergency";
    heartAttackRisk += 40;
    alerts.push({
      type: "spo2_emergency",
      severity: "emergency",
      title: "⚠ EMERGENCY: Oxygen Crisis",
      message: `SpO₂ at ${spo2.toFixed(1)}% — CALL EMERGENCY SERVICES IMMEDIATELY.`,
    });
  }

  // ── BPM Analysis ───────────────────────────────────────────────
  let bpmZone, bpmColor, bpmDescription, bpmCategory;
  if (bpm < 40) {
    bpmZone = "Severe Bradycardia";
    bpmColor = "red";
    bpmCategory = "bradycardia";
    bpmDescription = "Dangerously low heart rate. Risk of cardiac arrest. Emergency care needed.";
    overallStatus = "emergency";
    heartAttackRisk += 35;
    alerts.push({
      type: "bpm_severe_brady",
      severity: "emergency",
      title: "⚠ EMERGENCY: Severe Bradycardia",
      message: `Heart rate at ${bpm.toFixed(0)} BPM — critically low. CALL EMERGENCY SERVICES.`,
    });
  } else if (bpm < 60) {
    bpmZone = "Bradycardia";
    bpmColor = "blue";
    bpmCategory = "bradycardia";
    bpmDescription = "Below normal heart rate. May be normal for athletes. Monitor for symptoms.";
    if (overallStatus === "normal") overallStatus = "info";
    heartAttackRisk += 5;
    alerts.push({
      type: "bpm_brady",
      severity: "info",
      title: "Bradycardia",
      message: `Heart rate at ${bpm.toFixed(0)} BPM — below normal. Normal for athletes; otherwise consult a doctor.`,
    });
  } else if (bpm <= 100) {
    bpmZone = "Normal";
    bpmColor = "emerald";
    bpmCategory = "normal";
    bpmDescription = "Heart rate within healthy range. Good cardiovascular function.";
  } else if (bpm <= 120) {
    bpmZone = "Elevated";
    bpmColor = "yellow";
    bpmCategory = "tachycardia";
    bpmDescription = "Mildly elevated. Could be due to exercise, stress, or caffeine.";
    if (overallStatus === "normal") overallStatus = "warning";
    heartAttackRisk += 8;
    alerts.push({
      type: "bpm_elevated",
      severity: "warning",
      title: "Elevated Heart Rate",
      message: `Heart rate at ${bpm.toFixed(0)} BPM — mildly elevated. Rest and monitor.`,
    });
  } else if (bpm <= 150) {
    bpmZone = "Tachycardia";
    bpmColor = "orange";
    bpmCategory = "tachycardia";
    bpmDescription = "Significantly elevated. Tachycardia detected. Medical evaluation recommended.";
    overallStatus = "danger";
    heartAttackRisk += 20;
    alerts.push({
      type: "bpm_tachy",
      severity: "critical",
      title: "Tachycardia Detected",
      message: `Heart rate at ${bpm.toFixed(0)} BPM — tachycardia. Avoid stimulants, rest immediately.`,
    });
  } else {
    bpmZone = "Severe Tachycardia";
    bpmColor = "red";
    bpmCategory = "tachycardia";
    bpmDescription = "Dangerously high heart rate. Risk of cardiac event. Immediate care needed.";
    overallStatus = "emergency";
    heartAttackRisk += 35;
    alerts.push({
      type: "bpm_severe_tachy",
      severity: "emergency",
      title: "⚠ EMERGENCY: Severe Tachycardia",
      message: `Heart rate at ${bpm.toFixed(0)} BPM — dangerously elevated. SEEK EMERGENCY CARE.`,
    });
  }

  // Combined risk boost
  if (bpmCategory === "tachycardia" && spo2 < 95) {
    heartAttackRisk += 15;
  }

  heartAttackRisk = Math.min(100, Math.round(heartAttackRisk));

  let heartAttackLevel, heartAttackColor;
  if (heartAttackRisk < 15) {
    heartAttackLevel = "Very Low";
    heartAttackColor = "emerald";
  } else if (heartAttackRisk < 30) {
    heartAttackLevel = "Low";
    heartAttackColor = "green";
  } else if (heartAttackRisk < 50) {
    heartAttackLevel = "Moderate";
    heartAttackColor = "yellow";
  } else if (heartAttackRisk < 70) {
    heartAttackLevel = "High";
    heartAttackColor = "orange";
    alerts.push({
      type: "heart_attack_risk",
      severity: "critical",
      title: "Elevated Heart Attack Risk",
      message: "Combined vitals indicate elevated cardiac risk. Medical evaluation strongly advised.",
    });
  } else {
    heartAttackLevel = "Critical";
    heartAttackColor = "red";
    alerts.push({
      type: "heart_attack_critical",
      severity: "emergency",
      title: "⚠ CRITICAL Cardiac Risk",
      message: "High probability of cardiac event. CALL EMERGENCY SERVICES IMMEDIATELY.",
    });
  }

  // HRV estimate (simple approximation)
  const estimatedHRV = bpm >= 60 && bpm <= 100 ? Math.round(50 - (bpm - 60) * 0.4) : bpm < 60 ? 65 : 20;

  // Stress level estimate
  let stressLevel, stressColor;
  if (bpm < 70 && spo2 >= 97) { stressLevel = "Low"; stressColor = "emerald"; }
  else if (bpm < 90 && spo2 >= 95) { stressLevel = "Moderate"; stressColor = "yellow"; }
  else if (bpm < 110 && spo2 >= 92) { stressLevel = "High"; stressColor = "orange"; }
  else { stressLevel = "Very High"; stressColor = "red"; }

  // Respiratory estimate
  const respiratoryRate = Math.round(bpm * 0.22 + (100 - spo2) * 0.5);
  let respiratoryStatus, respiratoryColor;
  if (respiratoryRate < 12) { respiratoryStatus = "Bradypnea"; respiratoryColor = "blue"; }
  else if (respiratoryRate <= 20) { respiratoryStatus = "Normal"; respiratoryColor = "emerald"; }
  else if (respiratoryRate <= 24) { respiratoryStatus = "Tachypnea"; respiratoryColor = "yellow"; }
  else { respiratoryStatus = "Severe Tachypnea"; respiratoryColor = "red"; }

  return {
    overallStatus,
    spo2: { zone: spo2Zone, color: spo2Color, description: spo2Description },
    bpm: { zone: bpmZone, color: bpmColor, description: bpmDescription, category: bpmCategory },
    heartAttack: { risk: heartAttackRisk, level: heartAttackLevel, color: heartAttackColor },
    hrv: { value: estimatedHRV, unit: "ms" },
    stress: { level: stressLevel, color: stressColor },
    respiratory: { rate: respiratoryRate, status: respiratoryStatus, color: respiratoryColor },
    alerts,
  };
}

export function getStatusConfig(status) {
  const configs = {
    normal: { label: "All Normal", color: "emerald", bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
    info: { label: "Attention", color: "blue", bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
    warning: { label: "Warning", color: "yellow", bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400" },
    danger: { label: "Danger", color: "orange", bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
    emergency: { label: "EMERGENCY", color: "red", bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
  };
  return configs[status] || configs.normal;
}
