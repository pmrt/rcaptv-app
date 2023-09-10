const interpColor = (rgbA: number[], rgbB: number[], f: number) => {
  return rgbA
    .slice()
    .map((rgb, i) => Math.round(rgb + f * (rgbB[i] - rgbA[i])));
};

// const outliers = (sorted: number[]) => {
//   const q1 = sorted[Math.floor(sorted.length / 4)];
//   const q3 = sorted[Math.floor((3 * sorted.length) / 4)];
//   const iqr = q3 - q1;
//   return [q1 - 1.5 * iqr, q3 + 1.5 * iqr];
// };

export const colorize = (rgbA: number[], rgbB: number[], arr: number[]) => {
  const sorted = arr.sort((a, b) => a - b);
  // const [lower, upper] = outliers(sorted);
  // const filtered = sorted.filter((n) => n >= lower && n <= upper);
  return (idx: number) =>
    interpColor(rgbA, rgbB, (1 / (sorted.length - 1)) * idx);
};
