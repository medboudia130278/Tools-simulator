import { TOOLING_CATALOG } from "../../railway_tooling.jsx";
import { createDefaultWorkforce } from "./projectDefaults.js";

export function getProjectSubsystemIds(project) {
  if (!project) return [];
  if (project.subsystemIds?.length) return project.subsystemIds;
  return project.subsystemId ? [project.subsystemId] : [];
}

function getProjectCatalog(project) {
  if (!project) return [];
  const subsystemIds = getProjectSubsystemIds(project);
  return TOOLING_CATALOG.filter(
    (tool) =>
      (tool.contexts || []).includes(project.contextId) &&
      (subsystemIds.length === 0 || subsystemIds.includes(tool.subsystem))
  );
}

function getToolPriceOverride(project, uid) {
  return project?.priceOverrides?.[uid];
}

function getToolLifecycleOverride(project, uid) {
  return project?.lifecycleOverrides?.[uid];
}

function getCurrentPrice(tool, project) {
  const override = getToolPriceOverride(project, tool.uid);
  return typeof override?.price === "number" ? override.price : tool.price;
}

function getMultiplierForTool(project, tool) {
  const workforce = project?.workforce || createDefaultWorkforce();
  const counts = workforce[tool.subsystem] || { tech: 1, equipe: 1, project: 1 };
  if (tool.level === "T") return counts.tech;
  if (tool.level === "E") return counts.equipe;
  if (tool.level === "P") return counts.project;
  return 1;
}

function inferLifecycleBaseline(tool) {
  const period = String(tool.period || "").toLowerCase();
  let type = "durable";
  let intervalValue = "";
  let intervalUnit = "years";
  let replacementRatio = 100;

  if (period.includes("consumable")) {
    type = "consumable";
    intervalValue = 12;
    intervalUnit = "months";
  } else if (
    period.includes("replace when worn") ||
    period.includes("replace if defective") ||
    period.includes("after arc event")
  ) {
    type = "condition_based";
  } else {
    const yearMatch = period.match(/(\d+)\s*year/);
    const monthMatch = period.match(/(\d+)\s*month/);
    if (yearMatch) {
      type = "periodic_replacement";
      intervalValue = Number(yearMatch[1]);
      intervalUnit = "years";
    } else if (monthMatch) {
      type = "periodic_replacement";
      intervalValue = Number(monthMatch[1]);
      intervalUnit = "months";
    } else if (period.includes("annual")) {
      type = "periodic_replacement";
      intervalValue = 1;
      intervalUnit = "years";
    }
  }

  return {
    type,
    intervalValue,
    intervalUnit,
    replacementRatio,
    source: "",
    year: "",
  };
}

function normalizeLifecycle(tool, project) {
  const baseline = inferLifecycleBaseline(tool);
  const override = getToolLifecycleOverride(project, tool.uid);
  const replacementRatio = Number(override?.replacementRatio ?? baseline.replacementRatio);

  return {
    type: override?.type || baseline.type,
    intervalValue: Number(override?.intervalValue ?? baseline.intervalValue) || 0,
    intervalUnit: override?.intervalUnit || baseline.intervalUnit,
    replacementRatio:
      Number.isFinite(replacementRatio) && replacementRatio >= 0
        ? Math.min(100, replacementRatio)
        : 100,
    source: typeof override?.source === "string" ? override.source.trim() : "",
    year: typeof override?.year === "string" ? override.year.trim() : "",
    hasOverride: Boolean(override),
  };
}

function toMonths(value, unit) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  if (unit === "years") return numeric * 12;
  return numeric;
}

export function getContractDurationMonths(project) {
  const duration = Math.max(1, Number(project?.maintenanceContract?.duration) || 1);
  const unit = project?.maintenanceContract?.unit === "months" ? "months" : "years";
  return toMonths(duration, unit);
}

export function getContractDurationLabel(project) {
  const duration = Math.max(1, Number(project?.maintenanceContract?.duration) || 1);
  const unit = project?.maintenanceContract?.unit === "months" ? "month" : "year";
  return `${duration} ${unit}${duration > 1 ? "s" : ""}`;
}

function getRenewalCount(contractDurationMonths, lifecycle) {
  if (!["periodic_replacement", "consumable"].includes(lifecycle.type)) return 0;
  const intervalMonths = toMonths(lifecycle.intervalValue, lifecycle.intervalUnit);
  if (!intervalMonths) return 0;
  return Math.max(0, Math.ceil(contractDurationMonths / intervalMonths) - 1);
}

function annualizeCost(value, contractDurationMonths) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (!Number.isFinite(contractDurationMonths) || contractDurationMonths <= 0) return 0;
  return value / (contractDurationMonths / 12);
}

function getResolvedProjectTool(tool, project, contractDurationMonths) {
  const currentPrice = getCurrentPrice(tool, project);
  const lifecycle = normalizeLifecycle(tool, project);
  const multiplier = getMultiplierForTool(project, tool);
  const mobilizationCost = tool.qty * currentPrice * multiplier;
  const renewalCount = getRenewalCount(contractDurationMonths, lifecycle);
  const renewalCost = mobilizationCost * renewalCount * (lifecycle.replacementRatio / 100);

  return {
    ...tool,
    currentPrice,
    lifecycle,
    multiplier,
    mobilizationCost,
    renewalCount,
    renewalCost,
    contractCost: mobilizationCost + renewalCost,
  };
}

export function getSelectedProjectTools(project) {
  const selected = new Set(project?.selectedToolUids || []);
  const contractDurationMonths = getContractDurationMonths(project);
  return getProjectCatalog(project)
    .filter((tool) => selected.has(tool.uid))
    .map((tool) => getResolvedProjectTool(tool, project, contractDurationMonths));
}

export function getProjectBudgetMetrics(project) {
  const catalog = getProjectCatalog(project);
  const contractDurationMonths = getContractDurationMonths(project);
  const contractDurationLabel = getContractDurationLabel(project);
  const selectedTools = getSelectedProjectTools(project);
  const mandatoryTotal = catalog.filter((tool) => tool.statut === "OB").length;
  const mandatorySelected = selectedTools.filter((tool) => tool.statut === "OB").length;

  const initialMobilization = selectedTools.reduce((sum, tool) => sum + tool.mobilizationCost, 0);
  const renewalBudget = selectedTools.reduce((sum, tool) => sum + tool.renewalCost, 0);
  const contractTotal = initialMobilization + renewalBudget;

  const levelTotals = {
    T: selectedTools
      .filter((tool) => tool.level === "T")
      .reduce((sum, tool) => sum + tool.mobilizationCost, 0),
    E: selectedTools
      .filter((tool) => tool.level === "E")
      .reduce((sum, tool) => sum + tool.mobilizationCost, 0),
    P: selectedTools
      .filter((tool) => tool.level === "P")
      .reduce((sum, tool) => sum + tool.mobilizationCost, 0),
  };

  const renewalLevelTotals = {
    T: selectedTools
      .filter((tool) => tool.level === "T")
      .reduce((sum, tool) => sum + tool.renewalCost, 0),
    E: selectedTools
      .filter((tool) => tool.level === "E")
      .reduce((sum, tool) => sum + tool.renewalCost, 0),
    P: selectedTools
      .filter((tool) => tool.level === "P")
      .reduce((sum, tool) => sum + tool.renewalCost, 0),
  };

  const annualRenewalBudget = annualizeCost(renewalBudget, contractDurationMonths);
  const renewalLevelAnnualTotals = {
    T: annualizeCost(renewalLevelTotals.T, contractDurationMonths),
    E: annualizeCost(renewalLevelTotals.E, contractDurationMonths),
    P: annualizeCost(renewalLevelTotals.P, contractDurationMonths),
  };

  const subsystemTotals = Array.from(
    selectedTools.reduce((map, tool) => {
      const current = map.get(tool.subsystem) || {
        subsystem: tool.subsystem,
        mobilization: 0,
        renewals: 0,
        total: 0,
        annualRenewals: 0,
      };
      current.mobilization += tool.mobilizationCost;
      current.renewals += tool.renewalCost;
      current.total += tool.contractCost;
      map.set(tool.subsystem, current);
      return map;
    }, new Map())
  )
    .map(([, value]) => ({
      ...value,
      annualRenewals: annualizeCost(value.renewals, contractDurationMonths),
    }));

  const renewalDrivers = [...selectedTools]
    .filter((tool) => tool.renewalCost > 0)
    .sort((left, right) => right.renewalCost - left.renewalCost)
    .slice(0, 8);

  return {
    catalog,
    selectedTools,
    mandatoryTotal,
    mandatorySelected,
    totalAllocated: initialMobilization,
    initialMobilization,
    renewalBudget,
    contractTotal,
    contractDurationMonths,
    contractDurationLabel,
    levelTotals,
    renewalLevelTotals,
    annualRenewalBudget,
    renewalLevelAnnualTotals,
    subsystemTotals,
    renewalDrivers,
  };
}

export function getProjectReportingMetrics(project) {
  const catalog = getProjectCatalog(project);
  const selectedTools = getSelectedProjectTools(project);
  return {
    visibleCatalogCount: catalog.length,
    selectedCount: selectedTools.length,
    mandatoryCount: catalog.filter((tool) => tool.statut === "OB").length,
    selectedMandatoryCount: selectedTools.filter((tool) => tool.statut === "OB").length,
    calibrationCount: selectedTools.filter((tool) =>
      tool.period.toLowerCase().includes("calibration")
    ).length,
    imageCoverage: catalog.filter((tool) => Boolean(tool.imgSrc)).length,
    fragileLinks: selectedTools.filter((tool) =>
      tool.productUrl.toLowerCase().endsWith(".pdf")
    ).length,
    subsystemCoverage: Array.from(
      selectedTools.reduce((map, tool) => {
        map.set(tool.subsystem, (map.get(tool.subsystem) || 0) + 1);
        return map;
      }, new Map())
    ).map(([subsystem, count]) => ({ subsystem, count })),
    renewalExposure: selectedTools.filter((tool) => tool.renewalCount > 0).length,
  };
}
