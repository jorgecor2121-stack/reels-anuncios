import React, { createContext, useContext } from "react";
import { C } from "./colors";

// Vestimenta del avatar. "polo" = polo negro original; "blazer" = blazer azul marino con camiseta blanca.
export type Vestimenta = "polo" | "blazer" | "hoodie" | "denim";
export type Outfit = { tipo: Vestimenta; shirt: string; shirtLine: string; inner: string; lapel: string };

export const OUTFITS: Record<Vestimenta, Outfit> = {
  polo: { tipo: "polo", shirt: C.shirt, shirtLine: C.shirtLine, inner: C.shirt, lapel: C.shirt },
  blazer: { tipo: "blazer", shirt: "#1F2C52", shirtLine: "#33467A", inner: "#F3F1EC", lapel: "#172140" },
  hoodie: { tipo: "hoodie", shirt: "#5E6B3C", shirtLine: "#46512C", inner: "#F2EFE6", lapel: "#4C5730" },
  denim: { tipo: "denim", shirt: "#4A78AE", shirtLine: "#2F5585", inner: "#FAFAF7", lapel: "#3B6599" },
};

const Ctx = createContext<Outfit>(OUTFITS.polo);
export const OutfitProvider: React.FC<{ vestimenta?: Vestimenta; children: React.ReactNode }> = ({ vestimenta = "polo", children }) => (
  <Ctx.Provider value={OUTFITS[vestimenta]}>{children}</Ctx.Provider>
);
export const useOutfit = () => useContext(Ctx);
