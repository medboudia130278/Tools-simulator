import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createProject, normalizeProject, touchProject } from "./projectDefaults.js";
import { loadProjectState, saveProjectState } from "./projectStorage.js";
import { createRecommendedFleetLine } from "../fleet/fleetSelectors.js";

const ProjectContext = createContext(null);

function getInitialState() {
  const firstProject = createProject();
  return {
    activeProjectId: firstProject.id,
    projects: [firstProject],
  };
}

export function ProjectProvider({ children }) {
  const [state, setState] = useState(() => ({
    ...getInitialState(),
    hydrated: false,
  }));

  useEffect(() => {
    let cancelled = false;
    loadProjectState().then((stored) => {
      if (cancelled) return;
      if (stored?.projects?.length) {
        setState({
          activeProjectId: stored.activeProjectId || stored.projects[0].id,
          projects: stored.projects.map(normalizeProject),
          hydrated: true,
        });
        return;
      }
      setState((current) => ({ ...current, hydrated: true }));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    saveProjectState({
      activeProjectId: state.activeProjectId,
      projects: state.projects,
    });
  }, [state]);

  const activeProject = useMemo(
    () => state.projects.find((project) => project.id === state.activeProjectId) || state.projects[0] || null,
    [state.activeProjectId, state.projects]
  );

  const updateProject = (projectId, updater) => {
    setState((current) => ({
      ...current,
      projects: current.projects.map((project) => {
        if (project.id !== projectId) return project;
        const nextProject = typeof updater === "function" ? updater(project) : updater;
        return touchProject(project, nextProject);
      }),
    }));
  };

  const createNewProject = (overrides = {}) => {
    setState((current) => {
      const nextIndex = current.projects.length + 1;
      const nextProject = createProject({
        name: `Project ${String(nextIndex).padStart(2, "0")}`,
        status: "active",
        ...overrides,
      });
      return {
        ...current,
        activeProjectId: nextProject.id,
        projects: [...current.projects, nextProject],
      };
    });
  };

  const duplicateActiveProject = () => {
    if (!activeProject) return;
    setState((current) => {
      const source = current.projects.find((project) => project.id === current.activeProjectId);
      if (!source) return current;
      const nextIndex = current.projects.length + 1;
      const duplicated = createProject({
        name: `${source.name} Copy`,
        status: "active",
        contextId: source.contextId,
        subsystemId: source.subsystemId,
        subsystemIds: [...(source.subsystemIds || [source.subsystemId])],
        maintenanceContract: {
          ...(source.maintenanceContract || { duration: 5, unit: "years" }),
        },
        selectedToolUids: [...source.selectedToolUids],
        workforce: JSON.parse(JSON.stringify(source.workforce)),
        priceOverrides: JSON.parse(JSON.stringify(source.priceOverrides || {})),
        lifecycleOverrides: JSON.parse(JSON.stringify(source.lifecycleOverrides || {})),
        serviceOverrides: JSON.parse(JSON.stringify(source.serviceOverrides || {})),
        fleet: JSON.parse(JSON.stringify(source.fleet || {})),
        notes: source.notes,
      });
      duplicated.name = `Project ${String(nextIndex).padStart(2, "0")} - Copy`;
      return {
        ...current,
        activeProjectId: duplicated.id,
        projects: [...current.projects, duplicated],
      };
    });
  };

  const archiveProject = (projectId) => {
    setState((current) => {
      const remainingActive = current.projects.filter(
        (project) => project.id !== projectId && project.status !== "archived"
      );
      const nextActiveId =
        current.activeProjectId === projectId
          ? remainingActive[0]?.id || current.projects.find((project) => project.id !== projectId)?.id || projectId
          : current.activeProjectId;
      return {
        ...current,
        activeProjectId: nextActiveId,
        projects: current.projects.map((project) =>
          project.id === projectId ? touchProject(project, { status: "archived" }) : project
        ),
      };
    });
  };

  const restoreProject = (projectId) => {
    updateProject(projectId, { status: "active" });
  };

  const deleteProject = (projectId) => {
    setState((current) => {
      if (current.projects.length <= 1) return current;
      const nextProjects = current.projects.filter((project) => project.id !== projectId);
      const nextActiveId =
        current.activeProjectId === projectId ? nextProjects[0]?.id ?? null : current.activeProjectId;
      return {
        ...current,
        activeProjectId: nextActiveId,
        projects: nextProjects,
      };
    });
  };

  const importProjectPortfolio = (payload) => {
    if (!payload?.projects?.length) return false;
    const normalizedProjects = payload.projects.map(normalizeProject);
    setState({
      activeProjectId: payload.activeProjectId || normalizedProjects[0].id,
      projects: normalizedProjects,
      hydrated: true,
    });
    return true;
  };

  const value = {
    hydrated: state.hydrated,
    projects: state.projects,
    activeProject,
    exportProjectPortfolio: () => ({
      activeProjectId: state.activeProjectId,
      projects: state.projects,
      exportedAt: new Date().toISOString(),
      version: 1,
    }),
    importProjectPortfolio,
    setActiveProjectId: (projectId) =>
      setState((current) => ({ ...current, activeProjectId: projectId })),
    createNewProject,
    duplicateActiveProject,
    archiveProject,
    restoreProject,
    deleteProject,
    renameActiveProject: (name) =>
      activeProject && updateProject(activeProject.id, { name }),
    setProjectContext: (contextId) =>
      activeProject && updateProject(activeProject.id, { contextId }),
    setProjectSubsystem: (subsystemId) =>
      activeProject &&
      updateProject(activeProject.id, {
        subsystemId,
        subsystemIds: activeProject.subsystemIds?.includes(subsystemId)
          ? activeProject.subsystemIds
          : [...(activeProject.subsystemIds || []), subsystemId],
      }),
    setProjectSubsystems: (subsystemIds) =>
      activeProject &&
      updateProject(activeProject.id, {
        subsystemIds,
        subsystemId: subsystemIds.includes(activeProject.subsystemId)
          ? activeProject.subsystemId
          : subsystemIds[0] || "POS",
      }),
    setProjectSelection: (selection) =>
      activeProject &&
      updateProject(activeProject.id, {
        selectedToolUids: Array.from(selection instanceof Set ? selection : new Set(selection || [])),
      }),
    setProjectWorkforce: (workforce) =>
      activeProject && updateProject(activeProject.id, { workforce }),
    setProjectPriceOverrides: (priceOverrides) =>
      activeProject && updateProject(activeProject.id, { priceOverrides }),
    setProjectLifecycleOverrides: (lifecycleOverrides) =>
      activeProject && updateProject(activeProject.id, { lifecycleOverrides }),
    setProjectServiceOverrides: (serviceOverrides) =>
      activeProject && updateProject(activeProject.id, { serviceOverrides }),
    setProjectMaintenanceContract: (maintenanceContract) =>
      activeProject && updateProject(activeProject.id, { maintenanceContract }),
    setProjectFleetRegion: (regionId) =>
      activeProject &&
      updateProject(activeProject.id, {
        fleet: {
          ...(activeProject.fleet || {}),
          regionId,
        },
      }),
    addProjectFleetLine: (line) =>
      activeProject &&
      updateProject(activeProject.id, {
        fleet: {
          ...(activeProject.fleet || {}),
          lines: [...(activeProject.fleet?.lines || []), line || createRecommendedFleetLine(activeProject)],
        },
      }),
    updateProjectFleetLine: (lineId, patch) =>
      activeProject &&
      updateProject(activeProject.id, {
        fleet: {
          ...(activeProject.fleet || {}),
          lines: (activeProject.fleet?.lines || []).map((line) =>
            line.id === lineId
              ? {
                  ...line,
                  ...patch,
                  overrides: patch?.overrides ? { ...(line.overrides || {}), ...patch.overrides } : line.overrides,
                }
              : line
          ),
        },
      }),
    removeProjectFleetLine: (lineId) =>
      activeProject &&
      updateProject(activeProject.id, {
        fleet: {
          ...(activeProject.fleet || {}),
          lines: (activeProject.fleet?.lines || []).filter((line) => line.id !== lineId),
        },
      }),
    resetProjectFleetLineOverrides: (lineId) =>
      activeProject &&
      updateProject(activeProject.id, {
        fleet: {
          ...(activeProject.fleet || {}),
          lines: (activeProject.fleet?.lines || []).map((line) =>
            line.id === lineId
              ? {
                  ...line,
                  overrides: {
                    consumptionLPer100Km: null,
                    monthlyRental: null,
                    purchasePrice: null,
                    annualMaintenance: null,
                    annualL1Maintenance: null,
                    fuelPricePerLitre: null,
                    annualInsurance: null,
                    annualRegistration: null,
                    annualTyresReserve: null,
                  },
                }
              : line
          ),
        },
      }),
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
