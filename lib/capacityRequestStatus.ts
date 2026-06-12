import type { CapacityRequestStatus } from "@/lib/capacityRequests";

type CapacityRequestExpirationInput = {
  status: string | null | undefined;
  expiresAt: string | null | undefined;
  now: Date;
};

export function isCapacityRequestEffectivelyExpired({
  status,
  expiresAt,
  now,
}: CapacityRequestExpirationInput) {
  if (status === "expired") {
    return true;
  }

  if (status !== "active" || !expiresAt) {
    return false;
  }

  const expiresAtTime = new Date(expiresAt).getTime();

  return Number.isFinite(expiresAtTime) && expiresAtTime <= now.getTime();
}

export function getEffectiveCapacityRequestStatus(
  input: CapacityRequestExpirationInput
): CapacityRequestStatus {
  if (isCapacityRequestEffectivelyExpired(input)) {
    return "expired";
  }

  switch (input.status) {
    case "draft":
    case "pending":
    case "active":
    case "rejected":
    case "archived":
      return input.status;
    default:
      return "pending";
  }
}
