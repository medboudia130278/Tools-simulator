const DEFAULT_WORKFORCE = {
  POS: { tech: 4, equipe: 1, project: 1 },
  PSD: { tech: 3, equipe: 1, project: 1 },
  CAT: { tech: 4, equipe: 1, project: 1 },
  TRACK: { tech: 5, equipe: 2, project: 1 },
  "3RD": { tech: 3, equipe: 1, project: 1 },
  AFC: { tech: 2, equipe: 1, project: 1 },
  DEQ: { tech: 2, equipe: 1, project: 1 },
  MEP: { tech: 3, equipe: 1, project: 1 },
};

export function createDefaultWorkforce() {
  return Object.fromEntries(
    Object.entries(DEFAULT_WORKFORCE).map(([subsystem, counts]) => [
      subsystem,
      { ...counts },
    ])
  );
}

function createProjectId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createProject(overrides = {}) {
  const now = new Date().toISOString();
  const subsystemIds = overrides.subsystemIds?.length
    ? [...new Set(overrides.subsystemIds)]
    : [overrides.subsystemId || "POS"];
  const maintenanceContract = {
    duration: 5,
    unit: "years",
    ...(overrides.maintenanceContract || {}),
  };
  return {
    id: createProjectId(),
    name: "Project 01",
    contextId: "metro",
    subsystemId: subsystemIds[0],
    subsystemIds,
    maintenanceContract,
    status: "active",
    selectedToolUids: [],
    workforce: createDefaultWorkforce(),
    priceOverrides: {},
    lifecycleOverrides: {},
    serviceOverrides: {},
    notes: "",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function normalizeProject(project) {
  const subsystemIds = project?.subsystemIds?.length
    ? [...new Set(project.subsystemIds)]
    : [project?.subsystemId || "POS"];
  const subsystemId = subsystemIds.includes(project?.subsystemId) ? project.subsystemId : subsystemIds[0];
  const maintenanceContract = {
    duration: Math.max(1, Number(project?.maintenanceContract?.duration) || 5),
    unit: project?.maintenanceContract?.unit === "months" ? "months" : "years",
  };
  return {
    ...createProject(),
    ...project,
    subsystemIds,
    subsystemId,
    maintenanceContract,
    lifecycleOverrides:
      project?.lifecycleOverrides && typeof project.lifecycleOverrides === "object"
        ? project.lifecycleOverrides
        : {},
    serviceOverrides:
      project?.serviceOverrides && typeof project.serviceOverrides === "object"
        ? project.serviceOverrides
        : {},
    status: project?.status === "archived" ? "archived" : "active",
  };
}

export function touchProject(project, patch = {}) {
  return {
    ...project,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
}
