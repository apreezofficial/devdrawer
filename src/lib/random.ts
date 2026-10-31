/** Uniform inclusive integer sampling, including ranges wider than 32 bits. */
export function randomInteger(min: number, max: number): number {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min > max) {
    throw new RangeError("Enter safe whole numbers for the minimum and maximum.");
  }
  const low = BigInt(min), range = BigInt(max) - low + 1n;
  const space = 1n << 64n;
  const limit = space - space % range;
  const bytes = new Uint32Array(2);
  let sample: bigint;
  do {
    crypto.getRandomValues(bytes);
    sample = (BigInt(bytes[0]) << 32n) | BigInt(bytes[1]);
  } while (sample >= limit);
  return Number(low + sample % range);
}
