import { TOOLING_SUBSYSTEMS } from "../../railway_tooling.jsx";
import {
  createFleetLine,
  getDefaultInvestmentPolicy,
  isFleetMaintenanceModeId,
  isFleetVehicleTypeId,
} from "../fleet/fleetCatalog.js";
import { DEFAULT_FLEET_REGION_ID, FLEET_REGIONS } from "../fleet/fleetRegionalDefaults.js";

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
const VALID_FLEET_REGION_IDS = new Set(FLEET_REGIONS.map((region) => region.id));

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

function normalizeFleetLine(line, fallbackSubsystemId = "POS") {
  if (!line || typeof line !== "object") {
    return createFleetLine({ subsystemId: fallbackSubsystemId });
  }
  const vehicleTypeId = isFleetVehicleTypeId(line.vehicleTypeId) ? line.vehicleTypeId : undefined;
  const defaultInvestmentPolicy = getDefaultInvestmentPolicy(vehicleTypeId);
  return createFleetLine({
    ...line,
    subsystemId: VALID_SUBSYSTEM_IDS.has(line.subsystemId) ? line.subsystemId : fallbackSubsystemId,
    vehicleTypeId,
    strategy: line.strategy === "investment" ? "investment" : "rental",
    quantity: Math.max(1, Number(line.quantity) || 1),
    kmPerMonth: Math.max(0, Number(line.kmPerMonth) || 0),
    overrides: {
      ...(line.overrides || {}),
    },
    investmentPolicy: {
      renewalCycleYears: Math.max(
        1,
        Number(line.investmentPolicy?.renewalCycleYears) || defaultInvestmentPolicy.renewalCycleYears
      ),
      residualValuePct: Math.max(
        0,
        Math.min(90, Number(line.investmentPolicy?.residualValuePct) || defaultInvestmentPolicy.residualValuePct)
      ),
      maintenanceMode: isFleetMaintenanceModeId(line.investmentPolicy?.maintenanceMode)
        ? line.investmentPolicy.maintenanceMode
        : defaultInvestmentPolicy.maintenanceMode,
    },
  });
}

function normalizeFleet(fleet, fallbackSubsystemId = "POS") {
  return {
    regionId: VALID_FLEET_REGION_IDS.has(fleet?.regionId) ? fleet.regionId : DEFAULT_FLEET_REGION_ID,
    lines: Array.isArray(fleet?.lines)
      ? fleet.lines.map((line) => normalizeFleetLine(line, fallbackSubsystemId))
      : [],
  };
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
    fleet: normalizeFleet(overrides.fleet, subsystemIds[0]),
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
    fleet: normalizeFleet(project?.fleet, subsystemId),
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
