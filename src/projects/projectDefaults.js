import { TOOLING_SUBSYSTEMS } from "../../railway_tooling.jsx";

const DEFAULT_WORKFORCE = {
  POS: { tech: 4, equipe: 1, project: 1 },
  PSD: { tech: 3, equipe: 1, project: 1 },
  CAT: { tech: 4, equipe: 1, project: 1 },
  TRACK: { tech: 5, equipe: 2, project: 1 },
  AFC: { tech: 2, equipe: 1, project: 1 },
  DEQ: { tech: 2, equipe: 1, project: 1 },
  MEP: { tech: 3, equipe: 1, project: 1 },
};

const TOOL_UID_MIGRATIONS = {
  "PSD:e06": "SHARED:p01",
  "DEQ:e03": "SHARED:p01",
  "MEP:p01": "SHARED:p01",
};

const VALID_SUBSYSTEM_IDS = new Set(TOOLING_SUBSYSTEMS.map((subsystem) => subsystem.id));

function normalizeSubsystemIds(subsystemIds, fallback = "POS") {
  const filtered = [...new Set((subsystemIds || []).filter((subsystemId) => VALID_SUBSYSTEM_IDS.has(subsystemId)))];
  return filtered.length ? filtered : [fallback];
}

function normalizeWorkforce(workforce) {
  const defaults = createDefaultWorkforce();
  if (!workforce || typeof workforce !== "object") return defaults;
  return Object.fromEntries(
    Object.entries(defaults).map(([subsystemId, counts]) => {
      const incoming = workforce[subsystemId] || {};
      return [
        subsystemId,
        {
          tech: Math.max(0, Number(incoming.tech) || counts.tech),
          equipe: Math.max(0, Number(incoming.equipe) || counts.equipe),
          project: Math.max(0, Number(incoming.project) || counts.project),
        },
      ];
    })
  );
}

function remapToolUid(uid) {
  return TOOL_UID_MIGRATIONS[uid] || uid;
}

function remapToolUidArray(values) {
  return Array.from(new Set((values || []).map(remapToolUid)));
}

function remapToolUidRecord(record) {
  if (!record || typeof record !== "object") return {};
  return Object.entries(record).reduce((acc, [uid, value]) => {
    acc[remapToolUid(uid)] = value;
    return acc;
  }, {});
}

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
  const subsystemIds = normalizeSubsystemIds(
    overrides.subsystemIds?.length ? overrides.subsystemIds : [overrides.subsystemId || "POS"]
  );
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
    workforce: normalizeWorkforce(overrides.workforce),
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
  const subsystemIds = normalizeSubsystemIds(
    project?.subsystemIds?.length ? project.subsystemIds : [project?.subsystemId || "POS"]
  );
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
    workforce: normalizeWorkforce(project?.workforce),
    selectedToolUids: remapToolUidArray(project?.selectedToolUids),
    priceOverrides: remapToolUidRecord(project?.priceOverrides),
    lifecycleOverrides:
      remapToolUidRecord(project?.lifecycleOverrides),
    serviceOverrides:
      remapToolUidRecord(project?.serviceOverrides),
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
