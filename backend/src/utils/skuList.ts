import skus from "../data/skus.json";

export const ALL_SKUS = Object.keys(skus);

export const randomSKU = () =>
  ALL_SKUS[Math.floor(Math.random() * ALL_SKUS.length)];

export const isValidSKU = (sku: string): boolean => ALL_SKUS.includes(sku);
