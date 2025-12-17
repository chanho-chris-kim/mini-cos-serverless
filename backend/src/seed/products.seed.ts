import type { ProductEntity } from "../domain/products/product.model";
import { ALL_SKUS } from "../utils/skuList";

export const productSeed: ProductEntity[] = ALL_SKUS.map((sku) => ({
  sku,
  name: sku,
  category: "MISC",
  price: 0,
  currency: "CAD",
}));
