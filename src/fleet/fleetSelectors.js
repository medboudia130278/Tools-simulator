import { TOOLING_SUBSYSTEMS } from "../../railway_tooling.jsx";
import { getContractDurationMonths, getProjectSubsystemIds } from "../projects/projectSelectors.js";
import {
  FLEET_MAINTENANCE_MODES,
  FLEET_VEHICLE_TYPES,
  createFleetLine,
  getDefaultInvestmentPolicy,
  getFleetVehicleType,
} from "./fleetCatalog.js";
import {
  DEFAULT_FLEET_REGION_ID,
  FLEET_REGIONS,
  getFleetRegion,
  getFleetRegionalVehicleDefaults,
} from "./fleetRegionalDefaults.js";

const SUBSYSTEM_LABELS = Object.fromEntries(TOOLING_SUBSYSTEMS.map((subsystem) => [subsystem.id, subsystem.label]));
const MAINTENANCE_AGE_CURVES = {
  flat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  age_standard: [1, 1, 1.05, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7],
  age_heavy_duty: [1, 1.05, 1.1, 1.2, 1.35, 1.5, 1.7, 1.9, 2.1, 2.3],
};

function roundAmount(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function normalizePositiveNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
}

export function getDefaultProjectFleet() {
  return {
    regionId: DEFAULT_FLEET_REGION_ID,
    lines: [],
  };
}

export function getProjectFleet(project) {
  return {
    ...getDefaultProjectFleet(),
    ...(project?.fleet || {}),
    lines: Array.isArray(project?.fleet?.lines) ? project.fleet.lines : [],
  };
}

export function createRecommendedFleetLine(project, overrides = {}) {
  const subsystemId = overrides.subsystemId || getProjectSubsystemIds(project)[0] || "POS";
  return createFleetLine({
    subsystemId,
    ...overrides,
  });
}

function getMaintenanceMultiplier(maintenanceMode, vehicleAgeYears) {
  const curve = MAINTENANCE_AGE_CURVES[maintenanceMode] || MAINTENANCE_AGE_CURVES.flat;
  const index = Math.max(0, Math.min(curve.length - 1, vehicleAgeYears - 1));
  return curve[index];
}

function getEndOfContractResidualPct(vehicleAgeMonths, renewalCycleYears, residualValuePct) {
  const cycleMonths = Math.max(1, renewalCycleYears * 12);
  const normalizedAgeMonths = Math.max(0, vehicleAgeMonths);
  if (normalizedAgeMonths === 0) return 100;
  const interpolatedPct =
    100 - (Math.min(normalizedAgeMonths, cycleMonths) / cycleMonths) * (100 - residualValuePct);
  return Math.max(residualValuePct, interpolatedPct);
}

export function getResolvedFleetLine(project, line) {
  const fleet = getProjectFleet(project);
  const regionId = fleet.regionId || DEFAULT_FLEET_REGION_ID;
  const vehicle = getFleetVehicleType(line?.vehicleTypeId);
  const regionalDefaults = getFleetRegionalVehicleDefaults(regionId, vehicle.id);
  const overrides = line?.overrides || {};
  const quantity = Math.max(1, Number(line?.quantity) || 1);
  const kmPerMonth = Math.max(0, Number(line?.kmPerMonth) || 0);
  const consumptionLPer100Km = normalizePositiveNumber(
    overrides.consumptionLPer100Km,
    vehicle.defaultConsumptionLPer100Km
  );
  const monthlyRental = normalizePositiveNumber(overrides.monthlyRental, regionalDefaults.monthlyRental);
  const purchasePrice = normalizePositiveNumber(overrides.purchasePrice, regionalDefaults.purchasePrice);
  const annualMaintenance = normalizePositiveNumber(overrides.annualMaintenance, regionalDefaults.annualMaintenance);
  const annualL1Maintenance = normalizePositiveNumber(
    overrides.annualL1Maintenance,
    regionalDefaults.annualL1Maintenance
  );
  const fuelPricePerLitre = normalizePositiveNumber(overrides.fuelPricePerLitre, regionalDefaults.fuelPricePerLitre);
  const annualInsurance = normalizePositiveNumber(overrides.annualInsurance, regionalDefaults.annualInsurance);
  const annualRegistration = normalizePositiveNumber(
    overrides.annualRegistration,
    regionalDefaults.annualRegistration
  );
  const annualTyresReserve = normalizePositiveNumber(
    overrides.annualTyresReserve,
    regionalDefaults.annualTyresReserve
  );
  const defaultInvestmentPolicy = getDefaultInvestmentPolicy(vehicle.id);
  const investmentPolicy = {
    renewalCycleYears: Math.max(
      1,
      Number(line?.investmentPolicy?.renewalCycleYears) || defaultInvestmentPolicy.renewalCycleYears
    ),
    residualValuePct: Math.max(
      0,
      Math.min(90, Number(line?.investmentPolicy?.residualValuePct) || defaultInvestmentPolicy.residualValuePct)
    ),
    maintenanceMode: line?.investmentPolicy?.maintenanceMode || defaultInvestmentPolicy.maintenanceMode,
  };
  const contractDurationMonths = getContractDurationMonths(project);
  const contractYears = contractDurationMonths / 12;
  const annualFuelCost =
    quantity * kmPerMonth * 12 * (consumptionLPer100Km / 100) * fuelPricePerLitre;
  const rentalAnnualInsurance = 0;
  const rentalAnnualRegistration = 0;
  const annualRentalBase =
    quantity *
    ((monthlyRental * 12) + annualL1Maintenance + rentalAnnualInsurance + rentalAnnualRegistration + annualTyresReserve);
  const annualInvestmentBase =
    quantity * (annualMaintenance + annualInsurance + annualRegistration + annualTyresReserve);
  const mobilizationCapex = line?.strategy === "investment" ? quantity * purchasePrice : 0;
  const residualValuePerRenewal = quantity * purchasePrice * (investmentPolicy.residualValuePct / 100);
  const renewalCycleMonths = Math.max(1, investmentPolicy.renewalCycleYears * 12);
  let maintenanceContractTotal = 0;
  let insuranceContractTotal = 0;
  let registrationContractTotal = 0;
  let tyresContractTotal = 0;
  let renewalCapexGross = 0;
  let renewalResaleCredit = 0;
  let lastAcquisitionMonth = 0;

  if (line?.strategy === "investment") {
    let remainingMonths = contractDurationMonths;
    let currentAgeYears = 1;
    let elapsedMonths = 0;
    while (remainingMonths > 0) {
      const isRenewalPoint =
        elapsedMonths > 0 && elapsedMonths % renewalCycleMonths === 0;
      const monthsRemainingAfterRenewal = contractDurationMonths - elapsedMonths;

      if (isRenewalPoint && monthsRemainingAfterRenewal > 12) {
        renewalCapexGross += quantity * purchasePrice;
        renewalResaleCredit += residualValuePerRenewal;
        currentAgeYears = 1;
        lastAcquisitionMonth = elapsedMonths;
      }

      const sliceMonths = Math.min(12, remainingMonths);
      const sliceFactor = sliceMonths / 12;
      const maintenanceMultiplier = getMaintenanceMultiplier(investmentPolicy.maintenanceMode, currentAgeYears);

      maintenanceContractTotal += quantity * annualMaintenance * maintenanceMultiplier * sliceFactor;
      insuranceContractTotal += quantity * annualInsurance * sliceFactor;
      registrationContractTotal += quantity * annualRegistration * sliceFactor;
      tyresContractTotal += quantity * annualTyresReserve * sliceFactor;

      remainingMonths -= sliceMonths;
      elapsedMonths += sliceMonths;
      currentAgeYears += 1;
    }
  }

  const fuelContractTotal = annualFuelCost * contractYears;
  const rentalContractTotal =
    (quantity *
      ((monthlyRental * 12) + annualL1Maintenance + rentalAnnualInsurance + rentalAnnualRegistration + annualTyresReserve) +
      annualFuelCost) *
    contractYears;
  const investmentRecurringTotal =
    maintenanceContractTotal +
    insuranceContractTotal +
    registrationContractTotal +
    tyresContractTotal +
    fuelContractTotal;
  const renewalCapexNet = renewalCapexGross - renewalResaleCredit;
  const finalVehicleAgeMonths = Math.max(0, contractDurationMonths - lastAcquisitionMonth);
  const endOfContractResidualPct =
    line?.strategy === "investment"
      ? getEndOfContractResidualPct(
          finalVehicleAgeMonths,
          investmentPolicy.renewalCycleYears,
          investmentPolicy.residualValuePct
        )
      : 0;
  const endOfContractResidualCredit =
    line?.strategy === "investment"
      ? quantity * purchasePrice * (endOfContractResidualPct / 100)
      : 0;
  const annualOperatingCost =
    line?.strategy === "investment"
      ? investmentRecurringTotal / Math.max(contractYears, 1)
      : annualRentalBase + annualFuelCost;
  const contractTotal =
    line?.strategy === "investment"
      ? mobilizationCapex + renewalCapexNet + investmentRecurringTotal - endOfContractResidualCredit
      : rentalContractTotal;

  return {
    ...line,
    subsystemLabel: SUBSYSTEM_LABELS[line?.subsystemId] || line?.subsystemId || "Unknown",
    vehicle,
    regionId,
    regionLabel: getFleetRegion(regionId).label,
    defaults: regionalDefaults,
    quantity,
    kmPerMonth,
    consumptionLPer100Km,
    monthlyRental,
    purchasePrice,
    annualMaintenance,
    annualL1Maintenance,
    fuelPricePerLitre,
    annualInsurance,
    annualRegistration,
    annualTyresReserve,
    investmentPolicy,
    annualFuelCost: roundAmount(annualFuelCost),
    annualRentalBase: roundAmount(annualRentalBase),
    annualInvestmentBase: roundAmount(annualInvestmentBase),
    mobilizationCapex: roundAmount(mobilizationCapex),
    renewalCapexGross: roundAmount(renewalCapexGross),
    renewalResaleCredit: roundAmount(renewalResaleCredit),
    renewalCapexNet: roundAmount(renewalCapexNet),
    finalVehicleAgeMonths,
    endOfContractResidualPct: roundAmount(endOfContractResidualPct),
    endOfContractResidualCredit: roundAmount(endOfContractResidualCredit),
    maintenanceContractTotal: roundAmount(maintenanceContractTotal),
    insuranceContractTotal: roundAmount(insuranceContractTotal),
    registrationContractTotal: roundAmount(registrationContractTotal),
    tyresContractTotal: roundAmount(tyresContractTotal),
    fuelContractTotal: roundAmount(fuelContractTotal),
    annualOperatingCost: roundAmount(annualOperatingCost),
    contractYears,
    contractTotal: roundAmount(contractTotal),
  };
}

export function getProjectFleetMetrics(project) {
  const fleet = getProjectFleet(project);
  const resolvedLines = fleet.lines.map((line) => getResolvedFleetLine(project, line));
  const summary = {
    region: getFleetRegion(fleet.regionId),
    contractYears: getContractDurationMonths(project) / 12,
    mobilizationCapex: 0,
    annualOperatingCost: 0,
    annualRenewalCapex: 0,
    annualFuelCost: 0,
    annualMaintenanceCost: 0,
    annualRentalCost: 0,
    annualInsuranceCost: 0,
    annualRegistrationCost: 0,
    annualTyresCost: 0,
    renewalCapexGross: 0,
    renewalResaleCredit: 0,
    renewalCapexNet: 0,
    endOfContractResidualCredit: 0,
    contractTotal: 0,
    bySubsystem: [],
    byStrategy: [],
    byVehicleType: [],
    lines: resolvedLines,
  };

  const bySubsystem = new Map();
  const byStrategy = new Map();
  const byVehicleType = new Map();

  resolvedLines.forEach((line) => {
    summary.mobilizationCapex += line.mobilizationCapex;
    summary.annualOperatingCost += line.annualOperatingCost;
    summary.annualFuelCost += line.annualFuelCost;
    summary.annualInsuranceCost += line.quantity * line.annualInsurance;
    summary.annualRegistrationCost += line.quantity * line.annualRegistration;
    summary.annualTyresCost += line.quantity * line.annualTyresReserve;
    summary.renewalCapexGross += line.renewalCapexGross;
    summary.renewalResaleCredit += line.renewalResaleCredit;
    summary.renewalCapexNet += line.renewalCapexNet;
    summary.endOfContractResidualCredit += line.endOfContractResidualCredit;
    summary.contractTotal += line.contractTotal;

    if (line.strategy === "investment") {
      summary.annualMaintenanceCost += line.maintenanceContractTotal / Math.max(summary.contractYears, 1);
    } else {
      summary.annualMaintenanceCost += line.quantity * line.annualL1Maintenance;
      summary.annualRentalCost += line.quantity * line.monthlyRental * 12;
    }

    const subsystemBucket = bySubsystem.get(line.subsystemId) || {
      subsystemId: line.subsystemId,
      label: line.subsystemLabel,
      quantity: 0,
      mobilizationCapex: 0,
      renewalCapexNet: 0,
      annualRenewalCapex: 0,
      annualCost: 0,
      contractTotal: 0,
    };
    subsystemBucket.quantity += line.quantity;
    subsystemBucket.mobilizationCapex += line.mobilizationCapex;
    subsystemBucket.renewalCapexNet += line.renewalCapexNet;
    subsystemBucket.annualRenewalCapex += line.renewalCapexNet / Math.max(summary.contractYears, 1);
    subsystemBucket.annualCost += line.annualOperatingCost;
    subsystemBucket.contractTotal += line.contractTotal;
    bySubsystem.set(line.subsystemId, subsystemBucket);

    const strategyBucket = byStrategy.get(line.strategy) || {
      strategy: line.strategy,
      quantity: 0,
      mobilizationCapex: 0,
      renewalCapexNet: 0,
      annualRenewalCapex: 0,
      annualCost: 0,
      contractTotal: 0,
    };
    strategyBucket.quantity += line.quantity;
    strategyBucket.mobilizationCapex += line.mobilizationCapex;
    strategyBucket.renewalCapexNet += line.renewalCapexNet;
    strategyBucket.annualRenewalCapex += line.renewalCapexNet / Math.max(summary.contractYears, 1);
    strategyBucket.annualCost += line.annualOperatingCost;
    strategyBucket.contractTotal += line.contractTotal;
    byStrategy.set(line.strategy, strategyBucket);

    const typeBucket = byVehicleType.get(line.vehicle.id) || {
      vehicleTypeId: line.vehicle.id,
      label: line.vehicle.label,
      quantity: 0,
      mobilizationCapex: 0,
      renewalCapexNet: 0,
      annualRenewalCapex: 0,
      annualCost: 0,
      contractTotal: 0,
    };
    typeBucket.quantity += line.quantity;
    typeBucket.mobilizationCapex += line.mobilizationCapex;
    typeBucket.renewalCapexNet += line.renewalCapexNet;
    typeBucket.annualRenewalCapex += line.renewalCapexNet / Math.max(summary.contractYears, 1);
    typeBucket.annualCost += line.annualOperatingCost;
    typeBucket.contractTotal += line.contractTotal;
    byVehicleType.set(line.vehicle.id, typeBucket);
  });

  summary.annualRenewalCapex = summary.renewalCapexNet / Math.max(summary.contractYears, 1);

  summary.bySubsystem = Array.from(bySubsystem.values()).sort((left, right) => left.label.localeCompare(right.label));
  summary.byStrategy = Array.from(byStrategy.values()).sort((left, right) => left.strategy.localeCompare(right.strategy));
  summary.byVehicleType = Array.from(byVehicleType.values()).sort((left, right) => left.label.localeCompare(right.label));

  Object.keys(summary).forEach((key) => {
    if (typeof summary[key] === "number") {
      summary[key] = roundAmount(summary[key]);
    }
  });

  return summary;
}

export { FLEET_MAINTENANCE_MODES, FLEET_REGIONS, FLEET_VEHICLE_TYPES };
