export const gusMockNips = ["0000000000", "1111111111"] as const;

export function isGusMockNip(nip: string) {
  return gusMockNips.includes(nip as (typeof gusMockNips)[number]);
}
