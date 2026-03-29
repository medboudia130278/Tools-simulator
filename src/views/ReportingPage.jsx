import React, { useMemo } from "react";
import { AlertTriangle, Image, ShieldAlert, Wrench } from "lucide-react";
import { TOOLING_CATALOG } from "../../railway_tooling.jsx";
import { palette } from "../app/theme.js";

const cardStyle = {
  background: palette.surfaceLowest,
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 16px 34px rgba(17, 24, 39, 0.06)",
};

export default function ReportingPage() {
  const metrics = useMemo(() => {
    const mandatory = TOOLING_CATALOG.filter((tool) => tool.statut === "OB").length;
    const calibrations = TOOLING_CATALOG.filter((tool) =>
      tool.period.toLowerCase().includes("calibration")
    ).length;
    const imageCoverage = TOOLING_CATALOG.filter((tool) => Boolean(tool.imgSrc)).length;
    const fragileLinks = TOOLING_CATALOG.filter((tool) =>
      tool.productUrl.toLowerCase().endsWith(".pdf")
    ).length;
    return { mandatory, calibrations, imageCoverage, fragileLinks };
  }, []);

  const cards = [
    {
      label: "Mandatory population",
      value: `${metrics.mandatory} tools`,
      icon: ShieldAlert,
      accent: palette.safety,
      tone: palette.safetySoft,
    },
    {
      label: "Calibration-driven assets",
      value: `${metrics.calibrations} tools`,
      icon: Wrench,
      accent: palette.primary,
      tone: palette.primarySoft,
    },
    {
      label: "Image coverage",
      value: `${metrics.imageCoverage}/${TOOLING_CATALOG.length}`,
      icon: Image,
      accent: palette.teal,
      tone: palette.tealSoft,
    },
    {
      label: "PDF product links",
      value: `${metrics.fragileLinks} refs`,
      icon: AlertTriangle,
      accent: palette.ink,
      tone: palette.surfaceHigh,
    },
  ];

  const priorities = [
    "Brancher ici les vrais indicateurs de conformité issus de la sélection active.",
    "Créer un flux d’alertes maintenance/calibration par outil et par équipe.",
    "Ajouter export PDF / CSV une fois l’état partagé mis en place.",
  ];

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
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
            <div style={{ color: palette.inkMuted, fontSize: "13px", marginBottom: "10px" }}>{label}</div>
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

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "18px" }}>
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
            Cette page prend déjà la place du futur cockpit Stitch. Les premières métriques de santé
            catalogue sont en place; la prochaine étape sera de les basculer vers des KPIs
            réellement pilotés par la sélection, la workforce et la couverture obligatoire.
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
            Migration priorities
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            {priorities.map((item, index) => (
              <div
                key={item}
                style={{
                  background: palette.surfaceLow,
                  borderRadius: "12px",
                  padding: "14px",
                  color: palette.inkSoft,
                  lineHeight: 1.55,
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: palette.primary,
                    marginRight: "10px",
                  }}
                >
                  0{index + 1}
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
