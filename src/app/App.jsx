import React, { useMemo, useState } from "react";
import {
  ActivitySquare,
  ChevronRight,
  ClipboardList,
  Database,
  LayoutGrid,
  WalletCards,
} from "lucide-react";
import { shellFontStyle, shellStyles, palette } from "./theme.js";
import { TOOLING_CATALOG, TOOLING_SUBSYSTEMS } from "../../railway_tooling.jsx";
import InventoryPage from "../views/InventoryPage.jsx";
import BudgetPage from "../views/BudgetPage.jsx";
import ReportingPage from "../views/ReportingPage.jsx";

const pages = [
  {
    id: "inventory",
    label: "Inventory",
    eyebrow: "Operational selection",
    title: "Tool catalog and technician allocation",
    description:
      "Vue active de migration. Elle conserve la logique actuelle de sélection et sert de base au découpage futur.",
    icon: LayoutGrid,
    component: InventoryPage,
    status: "Live",
  },
  {
    id: "budget",
    label: "Budget",
    eyebrow: "Cost planning",
    title: "Budget monolith and workforce projection",
    description:
      "Première page Stitch dédiée au coût. Les indicateurs catalogue sont posés, la vraie projection partagée arrive à l’étape suivante.",
    icon: WalletCards,
    component: BudgetPage,
    status: "Preview",
  },
  {
    id: "reporting",
    label: "Reporting",
    eyebrow: "Compliance cockpit",
    title: "Operational reporting and maintenance signals",
    description:
      "Prépare la future vue de conformité, d’alertes et de suivi maintenance avec une hiérarchie proche de Stitch.",
    icon: ClipboardList,
    component: ReportingPage,
    status: "Preview",
  },
];

const badgeStyle = (tone, color) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 12px",
  borderRadius: "999px",
  background: tone,
  color,
  fontSize: "12px",
  fontWeight: 700,
});

export default function App() {
  const [activePage, setActivePage] = useState("inventory");
  const [activeSubsystem, setActiveSubsystem] = useState("POS");

  const current = useMemo(
    () => pages.find((page) => page.id === activePage) ?? pages[0],
    [activePage]
  );
  const subsystemTabs = useMemo(
    () =>
      TOOLING_SUBSYSTEMS.map((subsystem) => {
        const count = TOOLING_CATALOG.filter((tool) => tool.subsystem === subsystem.id).length;
        return { ...subsystem, count, ready: count > 0 };
      }),
    []
  );

  const CurrentPage = current.component;

  return (
    <div style={shellStyles.app}>
      <style>{shellFontStyle}</style>
      <div style={shellStyles.shell} className="app-shell">
        <aside style={shellStyles.sidebar} className="app-sidebar">
          <div>
            <div style={{ ...badgeStyle(palette.primarySoft, palette.primary), marginBottom: "18px" }}>
              <Database size={14} />
              Stitch migration
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "30px",
                fontWeight: 700,
                lineHeight: 1.05,
                marginBottom: "12px",
              }}
            >
              Railway tooling simulator
            </div>
            <div style={{ color: palette.inkSoft, lineHeight: 1.65 }}>
              Nouveau shell industriel inspiré des propositions Stitch. `Inventory` reste la
              première vue fonctionnelle; `Budget` et `Reporting` deviennent les prochaines zones de migration.
            </div>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            {pages.map((page) => {
              const Icon = page.icon;
              const active = page.id === activePage;
              return (
                <button
                  key={page.id}
                  onClick={() => setActivePage(page.id)}
                  style={{
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    padding: "16px",
                    borderRadius: "16px",
                    background: active ? palette.surfaceLowest : "transparent",
                    color: palette.ink,
                    boxShadow: active ? "0 16px 34px rgba(17, 24, 39, 0.06)" : "none",
                    transition: "transform 250ms cubic-bezier(0.4,0,0.2,1), background 250ms cubic-bezier(0.4,0,0.2,1)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "12px",
                          background: active ? palette.primarySoft : palette.surfaceHigh,
                          color: active ? palette.primary : palette.inkSoft,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: "4px" }}>{page.label}</div>
                        <div style={{ fontSize: "12px", color: palette.inkMuted }}>{page.status}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color={active ? palette.primary : palette.inkMuted} />
                  </div>
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: "auto",
              padding: "18px",
              borderRadius: "18px",
              background: "rgba(28, 96, 144, 0.08)",
              color: palette.inkSoft,
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontWeight: 700, color: palette.ink, marginBottom: "8px" }}>Current step</div>
            <div>
              Shell multi-pages en place. L’étape suivante est l’extraction de l’état partagé pour
              alimenter réellement `Budget` et `Reporting`.
            </div>
          </div>
        </aside>

        <div style={shellStyles.contentWrap}>
          <header style={shellStyles.topbar} className="app-topbar">
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: palette.primary,
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                {current.eyebrow}
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "34px",
                  fontWeight: 700,
                  lineHeight: 1.08,
                  marginBottom: "12px",
                }}
              >
                {current.title}
              </div>
              <div style={{ color: palette.inkSoft, lineHeight: 1.65, maxWidth: "820px" }}>
                {current.description}
              </div>

              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  paddingBottom: "4px",
                }}
              >
                {subsystemTabs.map((subsystem) => {
                  const active = subsystem.id === activeSubsystem;
                  return (
                    <button
                      key={subsystem.id}
                      onClick={() => setActiveSubsystem(subsystem.id)}
                      style={{
                        border: `1px solid ${active ? palette.primary : "rgba(71, 84, 103, 0.14)"}`,
                        cursor: "pointer",
                        textAlign: "left",
                        minWidth: "150px",
                        padding: "14px 16px",
                        borderRadius: "18px",
                        background: active ? palette.surfaceLowest : palette.surfaceLow,
                        boxShadow: active ? "0 18px 38px rgba(28, 96, 144, 0.12)" : "none",
                        color: palette.ink,
                        flex: "0 0 auto",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "10px",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontSize: "15px",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            color: active ? palette.primary : palette.inkSoft,
                          }}
                        >
                          {subsystem.label}
                        </div>
                        <div
                          style={{
                            padding: "4px 8px",
                            borderRadius: "999px",
                            background: active ? palette.primarySoft : palette.surfaceHighest,
                            color: active ? palette.primary : palette.inkMuted,
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          {subsystem.count}
                        </div>
                      </div>
                      <div style={{ fontSize: "12px", color: palette.inkMuted, lineHeight: 1.45 }}>
                        {subsystem.full}
                        {!subsystem.ready ? " · soon" : ""}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "grid", gap: "10px", flexShrink: 0 }}>
              <div style={badgeStyle(palette.primarySoft, palette.primary)}>
                <ActivitySquare size={14} />
                {current.status}
              </div>
              <div style={badgeStyle(palette.surfaceHigh, palette.inkSoft)}>Industrial Precision</div>
            </div>
          </header>

          <main style={shellStyles.panel}>
            <CurrentPage subsystem={activeSubsystem} onSubsystemChange={setActiveSubsystem} />
          </main>
        </div>
      </div>
    </div>
  );
}
