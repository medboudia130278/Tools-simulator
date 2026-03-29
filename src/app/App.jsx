import React, { useMemo } from "react";
import {
  ActivitySquare,
  CopyPlus,
  ChevronRight,
  ClipboardList,
  Database,
  FolderKanban,
  LayoutGrid,
  Plus,
  WalletCards,
} from "lucide-react";
import { shellFontStyle, shellStyles, palette } from "./theme.js";
import { TOOLING_CATALOG, TOOLING_CONTEXTS, TOOLING_SUBSYSTEMS } from "../../railway_tooling.jsx";
import InventoryPage from "../views/InventoryPage.jsx";
import BudgetPage from "../views/BudgetPage.jsx";
import ReportingPage from "../views/ReportingPage.jsx";
import ProjectsPage from "../views/ProjectsPage.jsx";
import { useProjects } from "../projects/ProjectStore.jsx";
import { getProjectSubsystemIds } from "../projects/projectSelectors.js";

const pages = [
  {
    id: "projects",
    label: "Projects",
    eyebrow: "Portfolio workspace",
    title: "Project portfolio and persistence workspace",
    description:
      "Gère plusieurs projets, leur contexte, leur sous-système de départ et les opérations d’archivage ou d’export JSON.",
    icon: FolderKanban,
    component: ProjectsPage,
    status: "Live",
  },
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
  const [activePage, setActivePage] = React.useState("inventory");
  const {
    hydrated,
    projects,
    activeProject,
    setActiveProjectId,
    createNewProject,
    duplicateActiveProject,
    renameActiveProject,
    setProjectContext,
    setProjectSubsystem,
  } = useProjects();

  const activeContext = activeProject?.contextId ?? "metro";
  const activeSubsystem = activeProject?.subsystemId ?? "POS";
  const activeSubsystemIds = getProjectSubsystemIds(activeProject);

  const current = useMemo(
    () => pages.find((page) => page.id === activePage) ?? pages[0],
    [activePage]
  );
  const subsystemTabs = useMemo(
    () =>
      TOOLING_SUBSYSTEMS.map((subsystem) => {
        const count = TOOLING_CATALOG.filter(
          (tool) =>
            tool.subsystem === subsystem.id &&
            activeSubsystemIds.includes(subsystem.id) &&
            (tool.contexts || []).includes(activeContext)
        ).length;
        return {
          ...subsystem,
          count,
          ready: count > 0,
          enabled: activeSubsystemIds.includes(subsystem.id),
        };
      }),
    [activeContext, activeSubsystemIds]
  );
  const activeContextMeta = useMemo(
    () => TOOLING_CONTEXTS.find((context) => context.id === activeContext) ?? TOOLING_CONTEXTS[0],
    [activeContext]
  );

  const CurrentPage = current.component;

  if (!hydrated || !activeProject) {
    return (
      <div style={shellStyles.app}>
        <style>{shellFontStyle}</style>
        <div style={{ padding: "48px", color: palette.ink }}>Loading project workspace…</div>
      </div>
    );
  }

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

              <div style={{ marginTop: "22px", marginBottom: "14px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: palette.primary,
                    fontWeight: 700,
                    marginBottom: "10px",
                  }}
                >
                  Active project
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <select
                    value={activeProject.id}
                    onChange={(event) => setActiveProjectId(event.target.value)}
                    style={{
                      minWidth: "240px",
                      border: "1px solid rgba(71, 84, 103, 0.14)",
                      borderRadius: "14px",
                      background: palette.surfaceLowest,
                      color: palette.ink,
                      padding: "12px 14px",
                      fontSize: "14px",
                      fontWeight: 600,
                      outline: "none",
                    }}
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <input
                    value={activeProject.name}
                    onChange={(event) => renameActiveProject(event.target.value)}
                    placeholder="Project name"
                    style={{
                      minWidth: "260px",
                      flex: "1 1 260px",
                      border: "1px solid rgba(71, 84, 103, 0.14)",
                      borderRadius: "14px",
                      background: palette.surfaceLowest,
                      color: palette.ink,
                      padding: "12px 14px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={createNewProject}
                    style={{
                      border: "1px solid rgba(28, 96, 144, 0.18)",
                      borderRadius: "14px",
                      background: palette.primarySoft,
                      color: palette.primary,
                      padding: "11px 14px",
                      fontSize: "13px",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={14} />
                    New project
                  </button>
                  <button
                    onClick={duplicateActiveProject}
                    style={{
                      border: "1px solid rgba(71, 84, 103, 0.14)",
                      borderRadius: "14px",
                      background: palette.surfaceLow,
                      color: palette.inkSoft,
                      padding: "11px 14px",
                      fontSize: "13px",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <CopyPlus size={14} />
                    Duplicate
                  </button>
                </div>
                <div style={{ marginTop: "10px", color: palette.inkMuted, fontSize: "13px", lineHeight: 1.55 }}>
                  Chaque projet garde son contexte, son sous-système actif, sa sélection d’outils,
                  sa workforce et ses ajustements de prix dans le navigateur.
                </div>
              </div>

              <div style={{ marginTop: "20px", marginBottom: "12px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: activeContextMeta.accent,
                    fontWeight: 700,
                    marginBottom: "10px",
                  }}
                >
                  Operating context
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {TOOLING_CONTEXTS.map((context) => {
                    const active = context.id === activeContext;
                    return (
                      <button
                        key={context.id}
                        onClick={() => setProjectContext(context.id)}
                        style={{
                          border: `1px solid ${active ? context.accent : "rgba(71, 84, 103, 0.14)"}`,
                          cursor: "pointer",
                          padding: "10px 14px",
                          borderRadius: "999px",
                          background: active ? `${context.accent}16` : palette.surfaceLow,
                          color: active ? context.accent : palette.inkSoft,
                          fontSize: "13px",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span>{context.icon}</span>
                        <span>{context.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: "10px", color: palette.inkMuted, fontSize: "13px", lineHeight: 1.55 }}>
                  For now, the `POS` catalog stays identical across `Metro`, `Tram`, `Heavy Rail` and `APM`. Context-specific additions and removals will come later.
                </div>
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
                {subsystemTabs.filter((subsystem) => subsystem.enabled).map((subsystem) => {
                  const active = subsystem.id === activeSubsystem;
                  return (
                    <button
                      key={subsystem.id}
                      onClick={() => setProjectSubsystem(subsystem.id)}
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
            <CurrentPage
              subsystem={activeSubsystem}
              onSubsystemChange={setProjectSubsystem}
              context={activeContext}
              onContextChange={setProjectContext}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
