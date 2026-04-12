import {
  TOOLING_CATALOG,
  TOOLING_CATEGORIES,
  TOOLING_SUBSYSTEMS,
  inferToolLifecycleBaseline,
  inferToolServiceBaseline,
  inferServiceIntervalMonthsFromPeriod,
} from "../../railway_tooling.jsx";
import { createDefaultWorkforce } from "./projectDefaults.js";

const SHARED_SUBSYSTEM_ID = "SHARED";
const VALID_SUBSYSTEM_IDS = new Set(TOOLING_SUBSYSTEMS.map((subsystem) => subsystem.id));
const EXPORT_SHARED_SUBSYSTEM_LABEL = "Shared / depot pool";

const EXPORT_BUCKET_LABELS = {
  PPE: "PPE",
  CONSUM: "Consumables",
};

const EXPORT_LEVEL_LABELS = {
  T: "Technician",
  E: "Team",
  P: "Depot",
};

export function getProjectSubsystemIds(project) {
  if (!project) return [];
  const rawSubsystemIds = project.subsystemIds?.length ? project.subsystemIds : [project.subsystemId].filter(Boolean);
  return [...new Set(rawSubsystemIds.filter((subsystemId) => VALID_SUBSYSTEM_IDS.has(subsystemId)))];
}

function getVisibleSubsystemIdsForTool(project, tool) {
  const subsystemIds = getProjectSubsystemIds(project);
  if (tool.ownership === "shared_project") {
    return subsystemIds.filter((subsystemId) => (tool.applicableSubsystems || []).includes(subsystemId));
  }
  return subsystemIds.includes(tool.subsystem) ? [tool.subsystem] : [];
}

function getProjectCatalog(project) {
  if (!project) return [];
  return TOOLING_CATALOG.filter(
    (tool) =>
      (tool.contexts || []).includes(project.contextId) &&
      getVisibleSubsystemIdsForTool(project, tool).length > 0
  );
}

function getToolPriceOverride(project, uid) {
  return project?.priceOverrides?.[uid];
}

function getToolLifecycleOverride(project, uid) {
  return project?.lifecycleOverrides?.[uid];
}

function getToolServiceOverride(project, uid) {
  return project?.serviceOverrides?.[uid];
}

function getCurrentPrice(tool, project) {
  const override = getToolPriceOverride(project, tool.uid);
  return typeof override?.price === "number" ? override.price : tool.price;
}

function getPriceReference(tool, project) {
  const override = getToolPriceOverride(project, tool.uid);
  return {
    source: typeof override?.source === "string" ? override.source.trim() : "",
    year: typeof override?.year === "string" ? override.year.trim() : "",
    hasOverride: Boolean(override),
  };
}

function getMultiplierForTool(project, tool) {
  const workforce = project?.workforce || createDefaultWorkforce();
  if (tool.ownership === "shared_project") {
    const visibleSubsystemIds = getVisibleSubsystemIdsForTool(project, tool);
    if (tool.qtyRule === "sum") {
      return visibleSubsystemIds.reduce((sum, subsystemId) => {
        const counts = workforce[subsystemId] || { tech: 1, equipe: 1, project: 1 };
        if (tool.level === "T") return sum + counts.tech;
        if (tool.level === "E") return sum + counts.equipe;
        if (tool.level === "P") return sum + counts.project;
        return sum + 1;
      }, 0);
    }
    return 1;
  }
  const counts = workforce[tool.subsystem] || { tech: 1, equipe: 1, project: 1 };
  if (tool.level === "T") return counts.tech;
  if (tool.level === "E") return counts.equipe;
  if (tool.level === "P") return counts.project;
  return 1;
}

function normalizeLifecycle(tool, project) {
  const baseline = inferToolLifecycleBaseline(tool);
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
    source:
      typeof override?.source === "string" && override.source.trim()
        ? override.source.trim()
        : baseline.source,
    year:
      typeof override?.year === "string" && override.year.trim()
        ? override.year.trim()
        : baseline.year,
    basis: override ? "manual" : baseline.basis,
    hasOverride: Boolean(override),
  };
}

function normalizeService(tool, project) {
  const baseline = inferToolServiceBaseline(tool);
  const override = getToolServiceOverride(project, tool.uid);
  const resolvedType = override?.type || baseline.type;
  const resolvedCost = Number.parseFloat(String(override?.cost ?? baseline.cost ?? "").replace(",", "."));

  return {
    type: resolvedType,
    costPerEvent: Number.isFinite(resolvedCost) && resolvedCost >= 0 ? resolvedCost : 0,
    source:
      typeof override?.source === "string" && override.source.trim()
        ? override.source.trim()
        : baseline.source,
    year:
      typeof override?.year === "string" && override.year.trim()
        ? override.year.trim()
        : baseline.year,
    basis: override ? "manual" : baseline.basis,
    hasOverride: Boolean(override),
    intervalMonths: baseline.intervalMonths || inferServiceIntervalMonthsFromPeriod(tool.period) || 0,
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

function getServiceEventCount(contractDurationMonths, service) {
  if (service.type === "none" || service.costPerEvent <= 0) return 0;
  if (!Number.isFinite(service.intervalMonths) || service.intervalMonths <= 0) return 0;
  return Math.max(0, Math.floor(contractDurationMonths / service.intervalMonths));
}

function annualizeCost(value, contractDurationMonths) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (!Number.isFinite(contractDurationMonths) || contractDurationMonths <= 0) return 0;
  return value / (contractDurationMonths / 12);
}

function createCostBucket(id, label) {
  return {
    id,
    label,
    mobilization: 0,
    renewals: 0,
    service: 0,
    annualRenewals: 0,
    annualService: 0,
    total: 0,
  };
}

function applyToolCost(bucket, tool) {
  bucket.mobilization += tool.mobilizationCost;
  bucket.renewals += tool.renewalCost;
  bucket.service += tool.serviceCost;
  bucket.total += tool.contractCost;
  return bucket;
}

function getBudgetBucketId(tool) {
  return tool.ownership === "shared_project" ? SHARED_SUBSYSTEM_ID : tool.subsystem;
}

function getResolvedProjectTool(tool, project, contractDurationMonths) {
  const currentPrice = getCurrentPrice(tool, project);
  const priceReference = getPriceReference(tool, project);
  const lifecycle = normalizeLifecycle(tool, project);
  const service = normalizeService(tool, project);
  const multiplier = getMultiplierForTool(project, tool);
  const visibleSubsystemIds = getVisibleSubsystemIdsForTool(project, tool);
  const mobilizationCost = tool.qty * currentPrice * multiplier;
  const renewalCount = getRenewalCount(contractDurationMonths, lifecycle);
  const renewalCost = mobilizationCost * renewalCount * (lifecycle.replacementRatio / 100);
  const serviceEventCount = getServiceEventCount(contractDurationMonths, service);
  const serviceCost = tool.qty * multiplier * service.costPerEvent * serviceEventCount;

  return {
    ...tool,
    currentPrice,
    priceSource: priceReference.source,
    priceYear: priceReference.year,
    hasPriceOverride: priceReference.hasOverride,
    lifecycle,
    service,
    multiplier,
    visibleSubsystemIds,
    budgetBucketId: getBudgetBucketId(tool),
    mobilizationCost,
    renewalCount,
    renewalCost,
    serviceEventCount,
    serviceCost,
    contractCost: mobilizationCost + renewalCost + serviceCost,
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
  const subsystemIds = getProjectSubsystemIds(project);
  const contractDurationMonths = getContractDurationMonths(project);
  const contractDurationLabel = getContractDurationLabel(project);
  const selectedTools = getSelectedProjectTools(project);
  const mandatoryTotal = catalog.filter((tool) => tool.statut === "OB").length;
  const mandatorySelected = selectedTools.filter((tool) => tool.statut === "OB").length;

  const initialMobilization = selectedTools.reduce((sum, tool) => sum + tool.mobilizationCost, 0);
  const renewalBudget = selectedTools.reduce((sum, tool) => sum + tool.renewalCost, 0);
  const serviceBudget = selectedTools.reduce((sum, tool) => sum + tool.serviceCost, 0);
  const contractTotal = initialMobilization + renewalBudget + serviceBudget;

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

  const serviceLevelTotals = {
    T: selectedTools
      .filter((tool) => tool.level === "T")
      .reduce((sum, tool) => sum + tool.serviceCost, 0),
    E: selectedTools
      .filter((tool) => tool.level === "E")
      .reduce((sum, tool) => sum + tool.serviceCost, 0),
    P: selectedTools
      .filter((tool) => tool.level === "P")
      .reduce((sum, tool) => sum + tool.serviceCost, 0),
  };

  const annualRenewalBudget = annualizeCost(renewalBudget, contractDurationMonths);
  const annualServiceBudget = annualizeCost(serviceBudget, contractDurationMonths);
  const renewalLevelAnnualTotals = {
    T: annualizeCost(renewalLevelTotals.T, contractDurationMonths),
    E: annualizeCost(renewalLevelTotals.E, contractDurationMonths),
    P: annualizeCost(renewalLevelTotals.P, contractDurationMonths),
  };
  const serviceLevelAnnualTotals = {
    T: annualizeCost(serviceLevelTotals.T, contractDurationMonths),
    E: annualizeCost(serviceLevelTotals.E, contractDurationMonths),
    P: annualizeCost(serviceLevelTotals.P, contractDurationMonths),
  };

  const subsystemTotals = Array.from(
    selectedTools.reduce((map, tool) => {
      const bucketId = tool.budgetBucketId || tool.subsystem;
      const current = map.get(bucketId) || {
        subsystem: bucketId,
        mobilization: 0,
        renewals: 0,
        service: 0,
        total: 0,
        annualRenewals: 0,
        annualService: 0,
      };
      current.mobilization += tool.mobilizationCost;
      current.renewals += tool.renewalCost;
      current.service += tool.serviceCost;
      current.total += tool.contractCost;
      map.set(bucketId, current);
      return map;
    }, new Map())
  )
    .map(([, value]) => ({
      ...value,
      annualRenewals: annualizeCost(value.renewals, contractDurationMonths),
      annualService: annualizeCost(value.service, contractDurationMonths),
    }));

  const renewalDrivers = [...selectedTools]
    .filter((tool) => tool.renewalCost > 0)
    .sort((left, right) => right.renewalCost - left.renewalCost)
    .slice(0, 8);
  const serviceDrivers = [...selectedTools]
    .filter((tool) => tool.serviceCost > 0)
    .sort((left, right) => right.serviceCost - left.serviceCost)
    .slice(0, 8);

  return {
    catalog,
    subsystemIds,
    selectedTools,
    hasSharedProjectPool: selectedTools.some((tool) => tool.ownership === "shared_project"),
    mandatoryTotal,
    mandatorySelected,
    totalAllocated: initialMobilization,
    initialMobilization,
    renewalBudget,
    serviceBudget,
    contractTotal,
    contractDurationMonths,
    contractDurationLabel,
    levelTotals,
    renewalLevelTotals,
    serviceLevelTotals,
    annualRenewalBudget,
    annualServiceBudget,
    renewalLevelAnnualTotals,
    serviceLevelAnnualTotals,
    subsystemTotals,
    renewalDrivers,
    serviceDrivers,
  };
}

function getContractDurationYears(project) {
  return getContractDurationMonths(project) / 12;
}

function mapExportBucket(categoryId) {
  return EXPORT_BUCKET_LABELS[categoryId] || "Tooling";
}

function mapExportLevel(tool) {
  if (tool.budgetBucketId === SHARED_SUBSYSTEM_ID) return "Depot";
  return EXPORT_LEVEL_LABELS[tool.level] || "Depot";
}

function getProjectWorkforceTotals(project) {
  const workforce = project?.workforce || createDefaultWorkforce();
  return getProjectSubsystemIds(project).reduce(
    (totals, subsystemId) => {
      const counts = workforce[subsystemId] || { tech: 0, equipe: 0, project: 0 };
      totals.tech += Number(counts.tech) || 0;
      totals.equipe += Number(counts.equipe) || 0;
      totals.project += Number(counts.project) || 0;
      return totals;
    },
    { tech: 0, equipe: 0, project: 0 }
  );
}

function getExportCounts(project, subsystemId) {
  const workforce = project?.workforce || createDefaultWorkforce();
  if (subsystemId === SHARED_SUBSYSTEM_ID) {
    const totals = getProjectWorkforceTotals(project);
    return {
      tech: totals.tech,
      equipe: totals.equipe,
      project: 1,
    };
  }

  const counts = workforce[subsystemId] || { tech: 0, equipe: 0, project: 0 };
  return {
    tech: Number(counts.tech) || 0,
    equipe: Number(counts.equipe) || 0,
    project: Number(counts.project) || 0,
  };
}

function getExportSubsystemLabel(subsystemId) {
  if (subsystemId === SHARED_SUBSYSTEM_ID) return EXPORT_SHARED_SUBSYSTEM_LABEL;
  return TOOLING_SUBSYSTEMS.find((subsystem) => subsystem.id === subsystemId)?.label || subsystemId;
}

const EXPORT_BUCKET_ORDER = {
  PPE: 0,
  Consumables: 1,
  Tooling: 2,
};

const EXPORT_LEVEL_ORDER = {
  Technician: 0,
  Team: 1,
  Depot: 2,
};

const RFQ_LEVEL_ORDER = {
  Technician: 0,
  Team: 1,
  Depot: 2,
};

function getHigherExportLevel(left, right) {
  return (RFQ_LEVEL_ORDER[right] ?? -1) > (RFQ_LEVEL_ORDER[left] ?? -1) ? right : left;
}

export function getProjectCostMatrixRows(project) {
  if (!project) return [];

  const selectedTools = getSelectedProjectTools(project);
  const contractDurationYears = getContractDurationYears(project);
  const contextLabel = project.contextId;
  const rowsByKey = selectedTools.reduce((map, tool) => {
    const subsystemId = tool.budgetBucketId || tool.subsystem;
    const subsystemLabel = getExportSubsystemLabel(subsystemId);
    const costBucket = mapExportBucket(tool.cat);
    const allocationLevel = mapExportLevel(tool);
    const counts = getExportCounts(project, subsystemId);
    const groupKey = [
      project.name,
      contextLabel,
      subsystemLabel,
      costBucket,
      tool.cat,
      allocationLevel,
    ].join("|");

    const current =
      map.get(groupKey) || {
        "Project Name": project.name,
        Context: contextLabel,
        Subsystem: subsystemLabel,
        "Cost Bucket": costBucket,
        "Source Category": TOOLING_CATEGORIES[tool.cat]?.label || tool.cat,
        "Allocation Level": allocationLevel,
        "Technician Count": counts.tech,
        "Team Count": counts.equipe,
        "Depot Count": counts.project,
        "Contract Duration (Years)": Number(contractDurationYears.toFixed(2)),
        "Mobilization Unit Cost (€)": 0,
        "Mobilization Total Cost (€)": 0,
        "Renewal Contract Total (€)": 0,
        "Calibration Contract Total (€)": 0,
        "Recurring Contract Total (€)": 0,
        "Renewal Avg / Year (€)": 0,
        "Calibration Avg / Year (€)": 0,
        "Recurring Avg / Year (€)": 0,
        "Contract Total Excl. Mobilization (€)": 0,
        "Contract Grand Total (€)": 0,
      };

    current["Mobilization Unit Cost (€)"] += tool.qty * tool.currentPrice;
    current["Mobilization Total Cost (€)"] += tool.mobilizationCost;
    current["Renewal Contract Total (€)"] += tool.renewalCost;
    current["Calibration Contract Total (€)"] += tool.serviceCost;

    map.set(groupKey, current);
    return map;
  }, new Map());

  return Array.from(rowsByKey.values())
    .map((row) => {
      row["Recurring Contract Total (€)"] =
        row["Renewal Contract Total (€)"] + row["Calibration Contract Total (€)"];
      row["Renewal Avg / Year (€)"] = contractDurationYears > 0 ? row["Renewal Contract Total (€)"] / contractDurationYears : 0;
      row["Calibration Avg / Year (€)"] =
        contractDurationYears > 0 ? row["Calibration Contract Total (€)"] / contractDurationYears : 0;
      row["Recurring Avg / Year (€)"] =
        contractDurationYears > 0 ? row["Recurring Contract Total (€)"] / contractDurationYears : 0;
      row["Contract Total Excl. Mobilization (€)"] = row["Recurring Contract Total (€)"];
      row["Contract Grand Total (€)"] =
        row["Mobilization Total Cost (€)"] + row["Recurring Contract Total (€)"];
      return row;
    })
    .sort((left, right) => {
      const subsystemCompare = String(left.Subsystem).localeCompare(String(right.Subsystem));
      if (subsystemCompare !== 0) return subsystemCompare;

      const bucketCompare =
        (EXPORT_BUCKET_ORDER[left["Cost Bucket"]] ?? 99) - (EXPORT_BUCKET_ORDER[right["Cost Bucket"]] ?? 99);
      if (bucketCompare !== 0) return bucketCompare;

      const levelCompare =
        (EXPORT_LEVEL_ORDER[left["Allocation Level"]] ?? 99) -
        (EXPORT_LEVEL_ORDER[right["Allocation Level"]] ?? 99);
      if (levelCompare !== 0) return levelCompare;

      return String(left["Source Category"]).localeCompare(String(right["Source Category"]));
    });
}

function buildSupplierRfqKey(tool) {
  const brand = String(tool.brand || "").trim().toLowerCase();
  const model = String(tool.model || "").trim().toLowerCase();
  const name = String(tool.name || "").trim().toLowerCase();
  return model ? `${brand}|${model}` : `${brand}|${name}`;
}

export function getProjectSupplierRfqRows(project) {
  if (!project) return [];

  const rowsByKey = getSelectedProjectTools(project).reduce((map, tool) => {
    const key = buildSupplierRfqKey(tool);
    const level = mapExportLevel(tool);
    const estimatedQty = tool.qty * tool.multiplier;
    const calibrationCost =
      tool.service.type !== "none" && tool.service.costPerEvent > 0 ? tool.service.costPerEvent : 0;

    const current = map.get(key) || {
      "Tool Description": tool.name,
      Reference: tool.model,
      "Supplier / Manufacturer": tool.brand,
      Category: TOOLING_CATEGORIES[tool.cat]?.label || tool.cat,
      "Allocation Level": level,
      "Calibration Required": calibrationCost > 0 ? "Yes" : "No",
      "Product URL": tool.productUrl || "",
      "Current Unit Price (EUR)": tool.currentPrice,
      "Current Calibration Cost (EUR)": calibrationCost,
      "Estimated Total Qty": 0,
      "Requested Unit Price (EUR)": "",
      "Requested Calibration Cost (EUR)": "",
      "Comments / Supplier Feedback": "",
    };

    current["Estimated Total Qty"] += estimatedQty;
    current["Allocation Level"] = getHigherExportLevel(current["Allocation Level"], level);
    current["Calibration Required"] =
      current["Calibration Required"] === "Yes" || calibrationCost > 0 ? "Yes" : "No";
    current["Current Calibration Cost (EUR)"] = Math.max(current["Current Calibration Cost (EUR)"], calibrationCost);

    map.set(key, current);
    return map;
  }, new Map());

  return Array.from(rowsByKey.values())
    .map((row) => ({
      ...row,
      "Current Unit Price (EUR)": Number(row["Current Unit Price (EUR)"].toFixed(2)),
      "Current Calibration Cost (EUR)": Number(row["Current Calibration Cost (EUR)"].toFixed(2)),
      "Estimated Total Qty": Number(row["Estimated Total Qty"].toFixed(2)),
    }))
    .sort((left, right) => {
      const supplierCompare = String(left["Supplier / Manufacturer"]).localeCompare(
        String(right["Supplier / Manufacturer"])
      );
      if (supplierCompare !== 0) return supplierCompare;
      return String(left.Reference).localeCompare(String(right.Reference));
    });
}

export function getProjectReportingMetrics(project) {
  const catalog = getProjectCatalog(project);
  const selectedTools = getSelectedProjectTools(project);
  const subsystemIds = getProjectSubsystemIds(project);
  const contractDurationMonths = getContractDurationMonths(project);
  const mandatoryTools = catalog.filter((tool) => tool.statut === "OB");
  const selectedMandatoryTools = selectedTools.filter((tool) => tool.statut === "OB");
  const missingMandatoryTools = mandatoryTools.filter(
    (tool) => !selectedTools.some((selectedTool) => selectedTool.uid === tool.uid)
  );
  const calibrationTools = selectedTools.filter((tool) =>
    tool.period.toLowerCase().includes("calibration")
  );
  const serviceTrackedTools = selectedTools
    .filter((tool) => tool.service.type !== "none" && tool.service.costPerEvent > 0)
    .sort((left, right) => right.serviceCost - left.serviceCost);
  const catalogWithImages = catalog.filter((tool) => Boolean(tool.imgSrc));
  const selectedWithoutImages = selectedTools.filter((tool) => !tool.imgSrc);
  const fragileLinkTools = selectedTools.filter((tool) =>
    String(tool.productUrl || "").toLowerCase().endsWith(".pdf")
  );
  const renewalSensitiveTools = selectedTools
    .filter((tool) => tool.renewalCount > 0)
    .sort((left, right) => right.renewalCost - left.renewalCost);
  const selectedWithoutPriceReference = selectedTools.filter(
    (tool) => !tool.priceSource && !tool.priceYear
  );
  const selectedWithoutLifecycleReference = selectedTools.filter(
    (tool) => !tool.lifecycle.source && !tool.lifecycle.year
  );
  const selectedWithoutServiceReference = selectedTools.filter(
    (tool) =>
      tool.service.type !== "none" &&
      tool.service.costPerEvent > 0 &&
      !tool.service.source &&
      !tool.service.year
  );
  const selectedWithManualPrice = selectedTools.filter((tool) => tool.hasPriceOverride);
  const selectedWithManualLifecycle = selectedTools.filter((tool) => tool.lifecycle.hasOverride);
  const selectedWithManualService = selectedTools.filter((tool) => tool.service.hasOverride);
  const levelSelection = {
    T: selectedTools.filter((tool) => tool.level === "T").length,
    E: selectedTools.filter((tool) => tool.level === "E").length,
    P: selectedTools.filter((tool) => tool.level === "P").length,
  };

  const categoryCostRows = Array.from(
    selectedTools.reduce((map, tool) => {
      const categoryMeta = TOOLING_CATEGORIES[tool.cat] || { label: tool.cat };
      const current = map.get(tool.cat) || createCostBucket(tool.cat, categoryMeta.label || tool.cat);
      applyToolCost(current, tool);
      map.set(tool.cat, current);
      return map;
    }, new Map())
  )
    .map(([, value]) => ({
      ...value,
      annualRenewals: annualizeCost(value.renewals, contractDurationMonths),
      annualService: annualizeCost(value.service, contractDurationMonths),
    }))
    .sort((left, right) => right.total - left.total);

  const subsystemCostRows = subsystemIds.map((subsystemId) => {
    const current = createCostBucket(subsystemId, subsystemId);
    selectedTools
      .filter((tool) => tool.subsystem === subsystemId)
      .forEach((tool) => applyToolCost(current, tool));
    return {
      ...current,
      annualRenewals: annualizeCost(current.renewals, contractDurationMonths),
      annualService: annualizeCost(current.service, contractDurationMonths),
    };
  });

  if (selectedTools.some((tool) => tool.ownership === "shared_project")) {
    const sharedBucket = createCostBucket(SHARED_SUBSYSTEM_ID, "Shared / depot pool");
    selectedTools
      .filter((tool) => tool.budgetBucketId === SHARED_SUBSYSTEM_ID)
      .forEach((tool) => applyToolCost(sharedBucket, tool));
    subsystemCostRows.push({
      ...sharedBucket,
      annualRenewals: annualizeCost(sharedBucket.renewals, contractDurationMonths),
      annualService: annualizeCost(sharedBucket.service, contractDurationMonths),
    });
  }

  const reportingSubsystemIds = selectedTools.some((tool) => tool.ownership === "shared_project")
    ? [...subsystemIds, SHARED_SUBSYSTEM_ID]
    : subsystemIds;

  const subsystemLevelRows = reportingSubsystemIds.map((subsystemId) => {
    const tools = selectedTools.filter((tool) => (tool.budgetBucketId || tool.subsystem) === subsystemId);
    const techMob = tools.filter((tool) => tool.level === "T").reduce((sum, tool) => sum + tool.mobilizationCost, 0);
    const teamMob = tools.filter((tool) => tool.level === "E").reduce((sum, tool) => sum + tool.mobilizationCost, 0);
    const projectMob = tools.filter((tool) => tool.level === "P").reduce((sum, tool) => sum + tool.mobilizationCost, 0);
    const techRenewals = tools.filter((tool) => tool.level === "T").reduce((sum, tool) => sum + tool.renewalCost, 0);
    const teamRenewals = tools.filter((tool) => tool.level === "E").reduce((sum, tool) => sum + tool.renewalCost, 0);
    const projectRenewals = tools.filter((tool) => tool.level === "P").reduce((sum, tool) => sum + tool.renewalCost, 0);
    const techService = tools.filter((tool) => tool.level === "T").reduce((sum, tool) => sum + tool.serviceCost, 0);
    const teamService = tools.filter((tool) => tool.level === "E").reduce((sum, tool) => sum + tool.serviceCost, 0);
    const projectService = tools.filter((tool) => tool.level === "P").reduce((sum, tool) => sum + tool.serviceCost, 0);

    return {
      subsystem: subsystemId,
      techMob,
      teamMob,
      projectMob,
      techRenewals,
      teamRenewals,
      projectRenewals,
      techService,
      teamService,
      projectService,
      techAnnualRenewals: annualizeCost(techRenewals, contractDurationMonths),
      teamAnnualRenewals: annualizeCost(teamRenewals, contractDurationMonths),
      projectAnnualRenewals: annualizeCost(projectRenewals, contractDurationMonths),
      techAnnualService: annualizeCost(techService, contractDurationMonths),
      teamAnnualService: annualizeCost(teamService, contractDurationMonths),
      projectAnnualService: annualizeCost(projectService, contractDurationMonths),
      total:
        techMob +
        teamMob +
        projectMob +
        techRenewals +
        teamRenewals +
        projectRenewals +
        techService +
        teamService +
        projectService,
    };
  });

  const subsystemCategoryRows = Object.fromEntries(
    reportingSubsystemIds.map((subsystemId) => {
      const rows = Array.from(
        selectedTools
          .filter((tool) => (tool.budgetBucketId || tool.subsystem) === subsystemId)
          .reduce((map, tool) => {
            const categoryMeta = TOOLING_CATEGORIES[tool.cat] || { label: tool.cat };
            const current = map.get(tool.cat) || {
              id: tool.cat,
              label: categoryMeta.label || tool.cat,
              techMob: 0,
              teamMob: 0,
              projectMob: 0,
              techRenewals: 0,
              teamRenewals: 0,
              projectRenewals: 0,
              techService: 0,
              teamService: 0,
              projectService: 0,
              total: 0,
            };

            if (tool.level === "T") {
              current.techMob += tool.mobilizationCost;
              current.techRenewals += tool.renewalCost;
              current.techService += tool.serviceCost;
            } else if (tool.level === "E") {
              current.teamMob += tool.mobilizationCost;
              current.teamRenewals += tool.renewalCost;
              current.teamService += tool.serviceCost;
            } else if (tool.level === "P") {
              current.projectMob += tool.mobilizationCost;
              current.projectRenewals += tool.renewalCost;
              current.projectService += tool.serviceCost;
            }

            current.total += tool.contractCost;
            map.set(tool.cat, current);
            return map;
          }, new Map())
      )
        .map(([, value]) => ({
          ...value,
          techAnnualRenewals: annualizeCost(value.techRenewals, contractDurationMonths),
          teamAnnualRenewals: annualizeCost(value.teamRenewals, contractDurationMonths),
          projectAnnualRenewals: annualizeCost(value.projectRenewals, contractDurationMonths),
          techAnnualService: annualizeCost(value.techService, contractDurationMonths),
          teamAnnualService: annualizeCost(value.teamService, contractDurationMonths),
          projectAnnualService: annualizeCost(value.projectService, contractDurationMonths),
          mobilization: value.techMob + value.teamMob + value.projectMob,
          renewals: value.techRenewals + value.teamRenewals + value.projectRenewals,
          service: value.techService + value.teamService + value.projectService,
          annualRenewals: annualizeCost(
            value.techRenewals + value.teamRenewals + value.projectRenewals,
            contractDurationMonths
          ),
          annualService: annualizeCost(
            value.techService + value.teamService + value.projectService,
            contractDurationMonths
          ),
        }))
        .sort((left, right) => right.total - left.total);

      return [subsystemId, rows];
    })
  );

  const subsystemCoverage = subsystemIds.map((subsystemId) => {
    const visibleTools = catalog.filter((tool) => getVisibleSubsystemIdsForTool(project, tool).includes(subsystemId));
    const visibleMandatory = visibleTools.filter((tool) => tool.statut === "OB");
    const selectedInSubsystem = selectedTools.filter((tool) => (tool.visibleSubsystemIds || []).includes(subsystemId));
    const selectedMandatory = selectedInSubsystem.filter((tool) => tool.statut === "OB");
    const renewalSensitive = selectedInSubsystem.filter((tool) => tool.renewalCount > 0);

    return {
      subsystem: subsystemId,
      visibleCount: visibleTools.length,
      selectedCount: selectedInSubsystem.length,
      mandatoryCount: visibleMandatory.length,
      selectedMandatoryCount: selectedMandatory.length,
      coveragePct: visibleMandatory.length
        ? Math.round((selectedMandatory.length / visibleMandatory.length) * 100)
        : 100,
      renewalSensitiveCount: renewalSensitive.length,
      renewalBudget: renewalSensitive.reduce((sum, tool) => sum + tool.renewalCost, 0),
      missingMandatoryCount: Math.max(0, visibleMandatory.length - selectedMandatory.length),
    };
  });

  const alerts = [];
  if (missingMandatoryTools.length > 0) {
    alerts.push({
      severity: "high",
      title: "Mandatory tooling gap",
      detail: `${missingMandatoryTools.length} mandatory reference(s) are still missing from the active project selection.`,
    });
  }
  if (selectedWithoutPriceReference.length > 0) {
    alerts.push({
      severity: "medium",
      title: "Undocumented price references",
      detail: `${selectedWithoutPriceReference.length} selected tool(s) have no explicit price source or year.`,
    });
  }
  if (selectedWithoutLifecycleReference.length > 0) {
    alerts.push({
      severity: "medium",
      title: "Undocumented lifecycle assumptions",
      detail: `${selectedWithoutLifecycleReference.length} selected tool(s) still rely on undocumented lifecycle assumptions.`,
    });
  }
  if (selectedWithoutServiceReference.length > 0) {
    alerts.push({
      severity: "medium",
      title: "Undocumented service cost references",
      detail: `${selectedWithoutServiceReference.length} selected tool(s) have a service cost without an explicit source or year.`,
    });
  }
  if (fragileLinkTools.length > 0) {
    alerts.push({
      severity: "low",
      title: "Fragile product links",
      detail: `${fragileLinkTools.length} selected reference(s) point to PDF or less stable product pages.`,
    });
  }

  return {
    visibleCatalogCount: catalog.length,
    selectedCount: selectedTools.length,
    mandatoryCount: mandatoryTools.length,
    selectedMandatoryCount: selectedMandatoryTools.length,
    missingMandatoryCount: missingMandatoryTools.length,
    missingMandatoryTools: missingMandatoryTools.slice(0, 10),
    coveragePct: mandatoryTools.length
      ? Math.round((selectedMandatoryTools.length / mandatoryTools.length) * 100)
      : 100,
    calibrationCount: calibrationTools.length,
    calibrationTools: calibrationTools.slice(0, 8),
    serviceTrackedCount: serviceTrackedTools.length,
    serviceTrackedTools: serviceTrackedTools.slice(0, 10),
    imageCoverage: catalogWithImages.length,
    imageCoveragePct: catalog.length ? Math.round((catalogWithImages.length / catalog.length) * 100) : 100,
    selectedWithoutImagesCount: selectedWithoutImages.length,
    fragileLinks: fragileLinkTools.length,
    fragileLinkTools: fragileLinkTools.slice(0, 8),
    subsystemCoverage,
    renewalExposure: renewalSensitiveTools.length,
    renewalSensitiveTools: renewalSensitiveTools.slice(0, 10),
    selectedWithoutPriceReferenceCount: selectedWithoutPriceReference.length,
    selectedWithoutPriceReference: selectedWithoutPriceReference.slice(0, 8),
    selectedWithoutLifecycleReferenceCount: selectedWithoutLifecycleReference.length,
    selectedWithoutLifecycleReference: selectedWithoutLifecycleReference.slice(0, 8),
    selectedWithoutServiceReferenceCount: selectedWithoutServiceReference.length,
    selectedWithoutServiceReference: selectedWithoutServiceReference.slice(0, 8),
    selectedWithManualPriceCount: selectedWithManualPrice.length,
    selectedWithManualLifecycleCount: selectedWithManualLifecycle.length,
    selectedWithManualServiceCount: selectedWithManualService.length,
    levelSelection,
    categoryCostRows,
    subsystemCostRows,
    subsystemLevelRows,
    subsystemCategoryRows,
    alerts,
  };
}
