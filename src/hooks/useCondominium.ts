import { useContext } from "react";
import { CondominiumContext } from "../context/CondominiumContext";

export function useCondominium() {
  const ctx = useContext(CondominiumContext);
  if (!ctx) throw new Error("useCondominium deve ser usado dentro de <CondominiumProvider>");
  return ctx;
}

