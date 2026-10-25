import { useEffect, useState } from "react";

const SEVERITY_CONFIG = {
  emergency: {
    bg: "bg-red-950",
    border: "border-red-500",
    icon: "⚠",
    iconBg: "bg-red-500",
    titleColor: "text-red-300",
    textColor: "text-red-200",
    pulse: true,
    sound: true,
  },
  critical: {
    bg: "bg-orange-950",
    border: "border-orange-500",
    icon: "!",
    iconBg: "bg-orange-500",
    titleColor: "text-orange-300",
    textColor: "text-orange-200",
    pulse: true,
    sound: false,
  },
  warning: {
    bg: "bg-yellow-950",
    border: "border-yellow-600",
    icon: "~",
    iconBg: "bg-yellow-600",
    titleColor: "text-yellow-300",
    textColor: "text-yellow-200",
    pulse: false,
    sound: false,
  },
  info: {
    bg: "bg-blue-950",
    border: "border-blue-600",
    icon: "i",
    iconBg: "bg-blue-600",
    titleColor: "text-blue-300",
    textColor: "text-blue-200",
    pulse: false,
    sound: false,
  },
};

function AlertToast({ alert, onDismiss }) {
  const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(alert.id), 300);
  };

  return (
    <div
      className={`
        alert-toast ${cfg.bg} border ${cfg.border} rounded-xl p-4 mb-3
        flex items-start gap-3 shadow-2xl cursor-pointer
        transition-all duration-300
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}
        ${cfg.pulse ? "animate-pulse-border" : ""}
      `}
      style={{ maxWidth: "380px", minWidth: "300px" }}
      onClick={handleDismiss}
    >
      <div
        className={`${cfg.iconBg} rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-black text-white text-sm`}
      >
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-sm mb-0.5 ${cfg.titleColor}`}>{alert.title}</div>
        <div className={`text-xs leading-relaxed ${cfg.textColor} opacity-90`}>{alert.message}</div>
        <div className="text-xs opacity-40 text-gray-400 mt-1">
          {alert.timestamp?.toLocaleTimeString()} · tap to dismiss
        </div>
      </div>
    </div>
  );
}

export default function AlertSystem({ alerts, onDismiss }) {
  const activeAlerts = alerts.filter((a) => a.active);
  const emergencyAlerts = activeAlerts.filter((a) => a.severity === "emergency");

  return (
    <>
      {/* Emergency full-screen overlay */}
      {emergencyAlerts.length > 0 && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div
            className="absolute inset-0 border-4 border-red-500"
            style={{
              animation: "emergencyBorder 0.5s ease-in-out infinite alternate",
            }}
          />
        </div>
      )}

      {/* Alert stack */}
      <div className="fixed top-4 right-4 z-40 flex flex-col items-end" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        {activeAlerts.map((alert) => (
          <AlertToast key={alert.id} alert={alert} onDismiss={onDismiss} />
        ))}
      </div>

      <style>{`
        @keyframes emergencyBorder {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }
        .animate-pulse-border {
          animation: pulseBorder 1.2s ease-in-out infinite;
        }
        @keyframes pulseBorder {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
      `}</style>
    </>
  );
}