import React from "react";
import LegacyRailwayTooling from "../../railway_tooling.jsx";

export default function InventoryPage({ subsystem, onSubsystemChange }) {
  return <LegacyRailwayTooling embedded subsystem={subsystem} onSubsystemChange={onSubsystemChange} />;
}
