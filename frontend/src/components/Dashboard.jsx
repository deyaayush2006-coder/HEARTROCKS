import VitalCard from "./VitalCard";
import BPMChart from "./BPMChart";
import SpO2Chart from "./SpO2Chart";
import ArrhythmiaPanel from "./ArrhythmiaPanel";
import RiskPanel from "./RiskPanel";
import MetricsGrid from "./MetricsGrid";
import StatusHeader from "./StatusHeader";
import ScenarioSwitcher from "./ScenarioSwitcher";

export default function Dashboard({
  readings,
  currentReading,
  analysis,
  arrhythmia,
  connected,
  scenario,
  setScenario,
}) {
  return (
    <div className="dashboard">
      {/* Header */}
      <StatusHeader
        connected={connected}
        analysis={analysis}
        currentReading={currentReading}
      />

      {/* Scenario Switcher (demo mode) */}
      <div className="px-6 pb-4">
        <ScenarioSwitcher scenario={scenario} setScenario={setScenario} />
      </div>

      {/* Main Vitals */}
      <div className="px-6 grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
        <VitalCard
          label="Heart Rate"
          value={currentReading ? Math.round(currentReading.bpm) : "--"}
          unit="BPM"
          zone={analysis?.bpm.zone}
          color={analysis?.bpm.color}
          icon="♥"
          pulse={true}
          bpm={currentReading?.bpm}
        />
        <VitalCard
          label="SpO₂"
          value={currentReading ? currentReading.spo2.toFixed(1) : "--"}
          unit="%"
          zone={analysis?.spo2.zone}
          color={analysis?.spo2.color}
          icon="◎"
        />
        <VitalCard
          label="Heart Attack Risk"
          value={analysis ? analysis.heartAttack.risk : "--"}
          unit="%"
          zone={analysis?.heartAttack.level}
          color={analysis?.heartAttack.color}
          icon="⚡"
        />
        <VitalCard
          label="Arrhythmia"
          value={arrhythmia?.detected ? arrhythmia.confidence + "%" : "Clear"}
          unit={arrhythmia?.detected ? "conf." : ""}
          zone={arrhythmia?.detected ? arrhythmia.type?.split("(")[0].trim() : "Normal Rhythm"}
          color={arrhythmia?.detected ? (arrhythmia.severity === "critical" ? "red" : "yellow") : "emerald"}
          icon="〜"
        />
      </div>

      {/* Charts */}
      <div className="px-6 grid grid-cols-1 gap-4 mb-6 lg:grid-cols-2">
        <BPMChart readings={readings} analysis={analysis} />
        <SpO2Chart readings={readings} analysis={analysis} />
      </div>

      {/* Bottom panels */}
      <div className="px-6 grid grid-cols-1 gap-4 mb-6 lg:grid-cols-3">
        <ArrhythmiaPanel arrhythmia={arrhythmia} readings={readings} />
        <RiskPanel analysis={analysis} arrhythmia={arrhythmia} />
        <MetricsGrid analysis={analysis} arrhythmia={arrhythmia} />
      </div>

      <div className="px-6 pb-8 text-center text-xs text-gray-600">
        ⚕ This device is for monitoring purposes only. Always consult a qualified medical professional for diagnosis and treatment.
      </div>
    </div>
  );
}