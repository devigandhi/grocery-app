export const ROLES = ["ADMIN", "USER"] as const;
export type Role = (typeof ROLES)[number];

export const UNITS = ["PCS", "KG", "G", "L", "ML", "PACK", "DOZEN"] as const;
export type Unit = (typeof UNITS)[number];

export const UNIT_LABELS: Record<Unit, string> = {
  PCS: "Pieces",
  KG: "Kilograms",
  G: "Grams",
  L: "Liters",
  ML: "Milliliters",
  PACK: "Pack",
  DOZEN: "Dozen",
};

export const SHARE_CHANNELS = ["WHATSAPP", "EMAIL"] as const;
export type ShareChannel = (typeof SHARE_CHANNELS)[number];
