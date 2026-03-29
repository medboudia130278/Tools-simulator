import React from "react";
import LegacyRailwayTooling from "../../railway_tooling.jsx";

export default function InventoryPage({ subsystem, onSubsystemChange, context, onContextChange }) {
  return (
    <LegacyRailwayTooling
      embedded
      subsystem={subsystem}
      onSubsystemChange={onSubsystemChange}
      context={context}
      onContextChange={onContextChange}
    />
  );
}
