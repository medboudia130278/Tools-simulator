import React, { useMemo } from "react";
import { AlertTriangle, FolderKanban, Image, ShieldAlert, Wrench } from "lucide-react";
import { palette } from "../app/theme.js";
import { useProjects } from "../projects/ProjectStore.jsx";
import { getProjectReportingMetrics } from "../projects/projectSelectors.js";

const cardStyle = {
  background: palette.surfaceLowest,
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 16px 34px rgba(17, 24, 39, 0.06)",
};

export default function ReportingPage() {
  const { activeProject, projects } = useProjects();
  const metrics = useMemo(() => getProjectReportingMetrics(activeProject), [activeProject]);

  const cards = [
    {
      label: "Active project",
      value: activeProject?.name || "—",
      icon: FolderKanban,
      accent: palette.primary,
      tone: palette.primarySoft,
    },
    {
      label: "Mandatory selected",
      value: `${metrics.selectedMandatoryCount}/${metrics.mandatoryCount}`,
      icon: ShieldAlert,
      accent: palette.safety,
      tone: palette.safetySoft,
    },
    {
      label: "Calibration assets",
      value: `${metrics.calibrationCount} tools`,
      icon: Wrench,
      accent: palette.teal,
      tone: palette.tealSoft,
    },
    {
      label: "Image coverage",
      value: `${metrics.imageCoverage}/${metrics.visibleCatalogCount}`,
      icon: Image,
      accent: palette.ink,
      tone: palette.surfaceHigh,
    },
    {
      label: "Fragile product links",
      value: `${metrics.fragileLinks} refs`,
      icon: AlertTriangle,
      accent: palette.ink,
      tone: palette.surfaceHigh,
    },
  ];

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
        }}
      >
        {cards.map(({ label, value, icon: Icon, accent, tone }) => (
          <div key={label} style={cardStyle}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: tone,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: accent,
                marginBottom: "16px",
              }}
            >
              <Icon size={20} />
            </div>
            <div style={{ color: palette.inkMuted, fontSize: "13px", marginBottom: "10px" }}>
              {label}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "24px",
                fontWeight: 600,
                color: accent,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "18px" }}>
        <div style={cardStyle}>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "22px",
              fontWeight: 700,
              marginBottom: "14px",
            }}
          >
            Reporting target state
          </div>
          <div style={{ color: palette.inkSoft, lineHeight: 1.68 }}>
            Le reporting est maintenant piloté par le projet actif, pas par le catalogue global.
            Quand tu changes de projet ou de contexte, les compteurs de couverture, de calibration
            et de visibilité se recalculent sur le périmètre concerné.
          </div>
          <div style={{ marginTop: "18px", color: palette.inkMuted, lineHeight: 1.6 }}>
            Portfolio currently stored in browser: <strong style={{ color: palette.ink }}>{projects.length}</strong> project(s)
            <br />
            Visible tools in project context: <strong style={{ color: palette.ink }}>{metrics.visibleCatalogCount}</strong>
            <br />
            Selected tools in project: <strong style={{ color: palette.ink }}>{metrics.selectedCount}</strong>
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "14px",
            }}
          >
            Active subsystems in selection
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            {metrics.subsystemCoverage.map(({ subsystem, count }) => (
              <div
                key={subsystem}
                style={{
                  background: palette.surfaceLow,
                  borderRadius: "12px",
                  padding: "14px",
                  color: palette.inkSoft,
                  lineHeight: 1.55,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{subsystem}</span>
                <strong style={{ color: palette.primary }}>{count}</strong>
              </div>
            ))}
            {metrics.subsystemCoverage.length === 0 && (
              <div style={{ color: palette.inkMuted, lineHeight: 1.6 }}>
                No reporting footprint yet. Select tools in Inventory to build the project record.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
