export function getSafeNextPath(
  value: string | null | undefined,
  fallback = ""
) {
  if (
    value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\")
  ) {
    return value;
  }

  return fallback;
}
