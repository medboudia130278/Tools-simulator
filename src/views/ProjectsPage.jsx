import React, { useRef, useState } from "react";
import {
  Archive,
  CopyPlus,
  Download,
  FolderKanban,
  FolderOpen,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { TOOLING_CONTEXTS, TOOLING_SUBSYSTEMS } from "../../railway_tooling.jsx";
import { palette } from "../app/theme.js";
import { useProjects } from "../projects/ProjectStore.jsx";
import { getProjectBudgetMetrics, getProjectSubsystemIds } from "../projects/projectSelectors.js";

const cardStyle = {
  background: palette.surfaceLowest,
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 16px 34px rgba(17, 24, 39, 0.06)",
};

const fmt = (value) =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatContract = (contract) => {
  const duration = Number(contract?.duration) || 0;
  const unit = contract?.unit === "months" ? "month" : "year";
  return `${duration} ${unit}${duration > 1 ? "s" : ""}`;
};

function projectStatus(project) {
  return project.status === "archived" ? "archived" : "active";
}

export default function ProjectsPage() {
  const fileInputRef = useRef(null);
  const {
    projects,
    activeProject,
    setActiveProjectId,
    createNewProject,
    duplicateActiveProject,
    archiveProject,
    restoreProject,
    deleteProject,
    setProjectSubsystems,
    setProjectMaintenanceContract,
    exportProjectPortfolio,
    importProjectPortfolio,
  } = useProjects();

  const [draftName, setDraftName] = useState("");
  const [draftContext, setDraftContext] = useState("metro");
  const [draftSubsystemIds, setDraftSubsystemIds] = useState(["POS"]);
  const [draftContractDuration, setDraftContractDuration] = useState(5);
  const [draftContractUnit, setDraftContractUnit] = useState("years");
  const [importMessage, setImportMessage] = useState("");

  const projectCards = projects.map((project) => {
    const metrics = getProjectBudgetMetrics(project);
    const coverage = metrics.mandatoryTotal
      ? Math.round((metrics.mandatorySelected / metrics.mandatoryTotal) * 100)
      : 0;
    return { project, metrics, coverage };
  });

  const activeProjects = projectCards.filter(({ project }) => projectStatus(project) === "active");
  const archivedProjects = projectCards.filter(({ project }) => projectStatus(project) === "archived");

  const handleCreateProject = () => {
    const nextName =
      draftName.trim() || `Project ${String(activeProjects.length + archivedProjects.length + 1).padStart(2, "0")}`;
    createNewProject({
      name: nextName,
      contextId: draftContext,
      subsystemId: draftSubsystemIds[0] || "POS",
      subsystemIds: draftSubsystemIds,
      maintenanceContract: {
        duration: Math.max(1, Number(draftContractDuration) || 1),
        unit: draftContractUnit,
      },
    });
    setDraftName("");
    setDraftContractDuration(5);
    setDraftContractUnit("years");
  };

  const toggleDraftSubsystem = (subsystemId) => {
    setDraftSubsystemIds((current) => {
      if (current.includes(subsystemId)) {
        return current.length === 1 ? current : current.filter((id) => id !== subsystemId);
      }
      return [...current, subsystemId];
    });
  };

  const toggleProjectSubsystem = (project, subsystemId) => {
    const currentSubsystemIds = getProjectSubsystemIds(project);
    const nextSubsystemIds = currentSubsystemIds.includes(subsystemId)
      ? currentSubsystemIds.length === 1
        ? currentSubsystemIds
        : currentSubsystemIds.filter((id) => id !== subsystemId)
      : [...currentSubsystemIds, subsystemId];
    if (activeProject?.id === project.id) {
      setProjectSubsystems(nextSubsystemIds);
    }
  };

  const handleExport = () => {
    const payload = exportProjectPortfolio();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `railway-tooling-projects-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const ok = importProjectPortfolio(payload);
      setImportMessage(ok ? "Project portfolio imported." : "Import failed: invalid payload.");
    } catch {
      setImportMessage("Import failed: invalid JSON file.");
    } finally {
      event.target.value = "";
    }
  };

  const renderProjectCard = ({ project, metrics, coverage }) => {
    const isActive = activeProject?.id === project.id;
    const status = projectStatus(project);
    const context = TOOLING_CONTEXTS.find((item) => item.id === project.contextId);
    const subsystemIds = getProjectSubsystemIds(project);
    const contract = project.maintenanceContract || { duration: 5, unit: "years" };

    return (
      <div
        key={`${project.id}:${project.updatedAt}`}
        style={{
          ...cardStyle,
          border: `1px solid ${
            isActive ? palette.primary : status === "archived" ? "rgba(71, 84, 103, 0.14)" : "transparent"
          }`,
          opacity: status === "archived" ? 0.82 : 1,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: isActive ? palette.primarySoft : palette.surfaceLow,
                color: isActive ? palette.primary : palette.inkSoft,
                borderRadius: "999px",
                padding: "7px 11px",
                fontSize: "11px",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              <FolderKanban size={13} />
              {status === "archived" ? "Archived project" : "Active project"}
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "22px",
                fontWeight: 700,
                lineHeight: 1.15,
                marginBottom: "8px",
              }}
            >
              {project.name}
            </div>
            <div style={{ color: palette.inkSoft, lineHeight: 1.55 }}>
              {context?.label} · {subsystemIds.join(", ")} · {formatContract(contract)} maintenance contract · updated{" "}
              {new Date(project.updatedAt).toLocaleDateString("fr-FR")}
            </div>
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "12px",
              color: palette.inkMuted,
              whiteSpace: "nowrap",
            }}
          >
            {metrics.selectedTools.length} tools
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {TOOLING_SUBSYSTEMS.map((subsystem) => {
            const active = subsystemIds.includes(subsystem.id);
            return (
              <button
                key={subsystem.id}
                onClick={() => toggleProjectSubsystem(project, subsystem.id)}
                disabled={activeProject?.id !== project.id}
                style={{
                  border: `1px solid ${active ? palette.primary : "rgba(71, 84, 103, 0.14)"}`,
                  borderRadius: "999px",
                  background: active ? palette.primarySoft : palette.surfaceLow,
                  color: active ? palette.primary : palette.inkSoft,
                  padding: "8px 10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: activeProject?.id === project.id ? "pointer" : "default",
                  opacity: activeProject?.id === project.id ? 1 : 0.72,
                }}
              >
                {subsystem.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div style={{ background: palette.surfaceLow, borderRadius: "12px", padding: "12px 14px" }}>
            <div style={{ fontSize: "12px", color: palette.inkMuted, marginBottom: "6px" }}>
              Initial budget (Mobilization)
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: palette.primary }}>
              {fmt(metrics.totalAllocated)} EUR
            </div>
          </div>
          <div style={{ background: palette.surfaceLow, borderRadius: "12px", padding: "12px 14px" }}>
            <div style={{ fontSize: "12px", color: palette.inkMuted, marginBottom: "6px" }}>Mandatory coverage</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: palette.safety }}>
              {coverage}%
            </div>
          </div>
          <div style={{ background: palette.surfaceLow, borderRadius: "12px", padding: "12px 14px" }}>
            <div style={{ fontSize: "12px", color: palette.inkMuted, marginBottom: "6px" }}>Subsystem footprint</div>
            <div style={{ fontWeight: 700, color: palette.ink }}>
              {subsystemIds.length || 0} subsystem(s)
            </div>
          </div>
          <div style={{ background: palette.surfaceLow, borderRadius: "12px", padding: "12px 14px" }}>
            <div style={{ fontSize: "12px", color: palette.inkMuted, marginBottom: "6px" }}>Maintenance contract</div>
            <div style={{ fontWeight: 700, color: palette.ink }}>{formatContract(contract)}</div>
          </div>
        </div>

        {isActive && (
          <div style={{ marginBottom: "16px", display: "grid", gap: "10px" }}>
            <div style={{ fontSize: "12px", color: palette.inkMuted }}>Maintenance contract duration</div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="number"
                min="1"
                step="1"
                value={contract.duration}
                onChange={(event) =>
                  setProjectMaintenanceContract({
                    ...contract,
                    duration: Math.max(1, Number(event.target.value) || 1),
                  })
                }
                style={{
                  width: "120px",
                  border: "1px solid rgba(71, 84, 103, 0.14)",
                  borderRadius: "12px",
                  background: palette.surfaceLow,
                  color: palette.ink,
                  padding: "10px 12px",
                  outline: "none",
                }}
              />
              <select
                value={contract.unit}
                onChange={(event) =>
                  setProjectMaintenanceContract({
                    ...contract,
                    unit: event.target.value,
                  })
                }
                style={{
                  border: "1px solid rgba(71, 84, 103, 0.14)",
                  borderRadius: "12px",
                  background: palette.surfaceLow,
                  color: palette.ink,
                  padding: "10px 12px",
                  outline: "none",
                }}
              >
                <option value="years">Years</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveProjectId(project.id)}
            style={{
              border: "1px solid rgba(28, 96, 144, 0.18)",
              borderRadius: "12px",
              background: isActive ? palette.primarySoft : palette.surfaceLow,
              color: isActive ? palette.primary : palette.inkSoft,
              padding: "10px 12px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FolderOpen size={14} />
            Open project
          </button>
          {status === "active" ? (
            <button
              onClick={() => archiveProject(project.id)}
              style={{
                border: "1px solid rgba(71, 84, 103, 0.14)",
                borderRadius: "12px",
                background: palette.surfaceLow,
                color: palette.inkSoft,
                padding: "10px 12px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Archive size={14} />
              Archive
            </button>
          ) : (
            <button
              onClick={() => restoreProject(project.id)}
              style={{
                border: "1px solid rgba(31, 138, 132, 0.18)",
                borderRadius: "12px",
                background: palette.tealSoft,
                color: palette.teal,
                padding: "10px 12px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <RotateCcw size={14} />
              Restore
            </button>
          )}
          <button
            onClick={() => deleteProject(project.id)}
            disabled={projects.length <= 1}
            style={{
              border: "1px solid rgba(159, 66, 0, 0.18)",
              borderRadius: "12px",
              background: "rgba(159, 66, 0, 0.06)",
              color: projects.length <= 1 ? palette.inkMuted : palette.safety,
              padding: "10px 12px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: projects.length <= 1 ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "18px" }}>
        <div style={cardStyle}>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "22px",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            Create a new project
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Project name"
              style={{
                border: "1px solid rgba(71, 84, 103, 0.14)",
                borderRadius: "12px",
                background: palette.surfaceLow,
                color: palette.ink,
                padding: "12px 14px",
                outline: "none",
              }}
            />
            <select
              value={draftContext}
              onChange={(event) => setDraftContext(event.target.value)}
              style={{
                border: "1px solid rgba(71, 84, 103, 0.14)",
                borderRadius: "12px",
                background: palette.surfaceLow,
                color: palette.ink,
                padding: "12px 14px",
                outline: "none",
              }}
            >
              {TOOLING_CONTEXTS.map((context) => (
                <option key={context.id} value={context.id}>
                  {context.label}
                </option>
              ))}
            </select>
            <div style={{ display: "grid", gridTemplateColumns: "140px minmax(0, 1fr)", gap: "10px" }}>
              <input
                type="number"
                min="1"
                step="1"
                value={draftContractDuration}
                onChange={(event) => setDraftContractDuration(Math.max(1, Number(event.target.value) || 1))}
                placeholder="Duration"
                style={{
                  border: "1px solid rgba(71, 84, 103, 0.14)",
                  borderRadius: "12px",
                  background: palette.surfaceLow,
                  color: palette.ink,
                  padding: "12px 14px",
                  outline: "none",
                }}
              />
              <select
                value={draftContractUnit}
                onChange={(event) => setDraftContractUnit(event.target.value)}
                style={{
                  border: "1px solid rgba(71, 84, 103, 0.14)",
                  borderRadius: "12px",
                  background: palette.surfaceLow,
                  color: palette.ink,
                  padding: "12px 14px",
                  outline: "none",
                }}
              >
                <option value="years">Years of maintenance contract</option>
                <option value="months">Months of maintenance contract</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: palette.inkMuted, marginBottom: "10px" }}>
                Project subsystems
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {TOOLING_SUBSYSTEMS.map((subsystem) => {
                  const active = draftSubsystemIds.includes(subsystem.id);
                  return (
                    <button
                      key={subsystem.id}
                      onClick={() => toggleDraftSubsystem(subsystem.id)}
                      style={{
                        border: `1px solid ${active ? palette.primary : "rgba(71, 84, 103, 0.14)"}`,
                        borderRadius: "999px",
                        background: active ? palette.primarySoft : palette.surfaceLow,
                        color: active ? palette.primary : palette.inkSoft,
                        padding: "9px 11px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {subsystem.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={handleCreateProject}
                style={{
                  border: "1px solid rgba(28, 96, 144, 0.18)",
                  borderRadius: "12px",
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
                <FolderKanban size={14} />
                Create project
              </button>
              <button
                onClick={duplicateActiveProject}
                style={{
                  border: "1px solid rgba(71, 84, 103, 0.14)",
                  borderRadius: "12px",
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
                Duplicate active project
              </button>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "22px",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            Portfolio actions
          </div>
          <div style={{ display: "grid", gap: "12px" }}>
            <button
              onClick={handleExport}
              style={{
                border: "1px solid rgba(28, 96, 144, 0.18)",
                borderRadius: "12px",
                background: palette.primarySoft,
                color: palette.primary,
                padding: "11px 14px",
                fontSize: "13px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                justifyContent: "center",
              }}
            >
              <Download size={14} />
              Export portfolio JSON
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "1px solid rgba(71, 84, 103, 0.14)",
                borderRadius: "12px",
                background: palette.surfaceLow,
                color: palette.inkSoft,
                padding: "11px 14px",
                fontSize: "13px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                justifyContent: "center",
              }}
            >
              <Upload size={14} />
              Import portfolio JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImport}
              style={{ display: "none" }}
            />
            <div style={{ color: palette.inkMuted, lineHeight: 1.6 }}>
              Projects are persisted in the browser through IndexedDB with local fallback.
              Export/import gives you a portable backup for Vercel deployments.
            </div>
            {importMessage && (
              <div
                style={{
                  background: palette.surfaceLow,
                  borderRadius: "12px",
                  padding: "12px 14px",
                  color: palette.inkSoft,
                }}
              >
                {importMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: "18px" }}>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "24px",
            fontWeight: 700,
          }}
        >
          Active projects
        </div>
        {activeProjects.map(renderProjectCard)}
        {activeProjects.length === 0 && (
          <div style={{ ...cardStyle, color: palette.inkMuted }}>
            No active project. Restore one from the archive or create a new project.
          </div>
        )}
      </div>

      {archivedProjects.length > 0 && (
        <div style={{ display: "grid", gap: "18px" }}>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            Archived projects
          </div>
          {archivedProjects.map(renderProjectCard)}
        </div>
      )}
    </div>
  );
}
