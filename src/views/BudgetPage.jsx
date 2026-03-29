import React, { useMemo } from "react";
import { Activity, Layers3, ShieldCheck, Wallet } from "lucide-react";
import { TOOLING_CATALOG } from "../../railway_tooling.jsx";
import { palette } from "../app/theme.js";

const fmt = (value) =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const cardStyle = {
  background: palette.surfaceLowest,
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 16px 34px rgba(17, 24, 39, 0.06)",
};

export default function BudgetPage() {
  const metrics = useMemo(() => {
    const catalogTotal = TOOLING_CATALOG.reduce((sum, tool) => sum + tool.qty * tool.price, 0);
    const technicianTotal = TOOLING_CATALOG
      .filter((tool) => tool.level === "T")
      .reduce((sum, tool) => sum + tool.qty * tool.price, 0);
    const teamTotal = TOOLING_CATALOG
      .filter((tool) => tool.level === "E")
      .reduce((sum, tool) => sum + tool.qty * tool.price, 0);
    const mandatoryCount = TOOLING_CATALOG.filter((tool) => tool.statut === "OB").length;
    return { catalogTotal, technicianTotal, teamTotal, mandatoryCount };
  }, []);

  const cards = [
    {
      label: "Catalog baseline",
      value: `${fmt(metrics.catalogTotal)} €`,
      icon: Wallet,
      accent: palette.primary,
      tone: palette.primarySoft,
      note: "Base budget if every listed block is procured once.",
    },
    {
      label: "Technician kit",
      value: `${fmt(metrics.technicianTotal)} €`,
      icon: Layers3,
      accent: palette.teal,
      tone: palette.tealSoft,
      note: "Individual equipment baseline before workforce scaling.",
    },
    {
      label: "Team equipment",
      value: `${fmt(metrics.teamTotal)} €`,
      icon: Activity,
      accent: palette.ink,
      tone: palette.surfaceHigh,
      note: "Shared assets for testing, diagnostics and collective safety.",
    },
    {
      label: "Mandatory tools",
      value: metrics.mandatoryCount,
      icon: ShieldCheck,
      accent: palette.safety,
      tone: palette.safetySoft,
      note: "Coverage target to carry into the future budget screen.",
    },
  ];

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div
        style={{
          ...cardStyle,
          padding: "28px",
          background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryStrong} 100%)`,
          color: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            opacity: 0.82,
            marginBottom: "12px",
          }}
        >
          Budget workspace
        </div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "38px",
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: "12px",
          }}
        >
          {fmt(metrics.catalogTotal)} €
        </div>
        <div style={{ maxWidth: "720px", lineHeight: 1.6, opacity: 0.92 }}>
          Cette vue est maintenant prête à accueillir la vraie projection `workforce × selection`.
          La logique catalogue est disponible; l’étape suivante sera de brancher ici les calculs
          actuellement encore enfermés dans l’écran legacy Inventory.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
        {cards.map(({ label, value, icon: Icon, accent, tone, note }) => (
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
                fontSize: "26px",
                fontWeight: 600,
                color: accent,
                marginBottom: "10px",
              }}
            >
              {value}
            </div>
            <div style={{ color: palette.inkSoft, lineHeight: 1.55, fontSize: "14px" }}>{note}</div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, display: "grid", gap: "18px" }}>
        <div>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "22px",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            Next migration for Budget
          </div>
          <div style={{ color: palette.inkSoft, lineHeight: 1.65, maxWidth: "760px" }}>
            1. Extraire la sélection et la configuration workforce dans un état partagé.
            2. Déporter ici le budget monolith, la coverage mandatory et le breakdown `Technician / Team / OPEX`.
            3. Conserver sur `Inventory` une simple action bar flottante au lieu du panneau de synthèse actuel.
          </div>
        </div>
      </div>
    </div>
  );
}
