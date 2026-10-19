"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_ADDRESS, type Address } from "./data";

type AddressStore = {
  addressFor: (memberKey: string) => Address;
  setAddress: (memberKey: string, address: Address) => void;
};

const STORAGE_KEY = "thrive-proto-addresses";

const AddressStoreContext = createContext<AddressStore | null>(null);

/** Keeps per-member address changes for this browser tab only. */
export function AddressStoreProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, Address>>({});

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setOverrides(JSON.parse(saved));
    } catch {
      // Storage unavailable; changes just won't survive a reload.
    }
  }, []);

  const setAddress = useCallback((memberKey: string, address: Address) => {
    setOverrides((prev) => {
      const next = { ...prev, [memberKey]: address };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const addressFor = useCallback((memberKey: string) => overrides[memberKey] ?? DEFAULT_ADDRESS, [overrides]);

  return <AddressStoreContext.Provider value={{ addressFor, setAddress }}>{children}</AddressStoreContext.Provider>;
}

export function useAddressStore(): AddressStore {
  const ctx = useContext(AddressStoreContext);
  if (!ctx) throw new Error("useAddressStore must be used inside AddressStoreProvider");
  return ctx;
}
