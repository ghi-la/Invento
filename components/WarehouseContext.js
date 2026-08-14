"use client";
import { createContext, useContext, useMemo } from "react";

const ROLE_RANK = { viewer: 0, editor: 1, admin: 2, owner: 3 };

const WarehouseContext = createContext(null);

export function WarehouseProvider({ warehouse, children }) {
  const value = useMemo(() => {
    const role = warehouse?.role;
    return {
      warehouse,
      role,
      can: (required) => (ROLE_RANK[role] ?? -1) >= (ROLE_RANK[required] ?? Infinity),
    };
  }, [warehouse]);

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>;
}

export function useWarehouse() {
  const ctx = useContext(WarehouseContext);
  if (!ctx) throw new Error("useWarehouse must be used within a WarehouseProvider");
  return ctx;
}
