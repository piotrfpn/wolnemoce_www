export function normalizeNip(input: string) {
  return input.replace(/\D/g, "");
}

export function isValidNip(input: string) {
  const nip = normalizeNip(input);

  if (!/^\d{10}$/.test(nip)) {
    return false;
  }

  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const checksum =
    weights.reduce((sum, weight, index) => sum + weight * Number(nip[index]), 0) %
    11;

  return checksum !== 10 && checksum === Number(nip[9]);
}
