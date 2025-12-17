import { ALL_SKUS } from "../utils/skuList";

export function chance(prob: number) {
  return Math.random() < prob;
}

export function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomSKU() {
  return pickOne(ALL_SKUS);
}

export function randomAddress() {
  const cities = ["Toronto", "Montreal", "Vancouver", "Calgary", "Ottawa"];
  const streets = ["Main St", "Broadway", "Queen St", "King St", "Elm St"];

  return {
    street: `${Math.floor(Math.random() * 2000)} ${pickOne(streets)}`,
    city: pickOne(cities),
    postalCode: "A1A1A1",
    country: "Canada",
  };
}

export function generateRandomOrder() {
  const customerNames = ["John", "Jane", "Alex", "Chris", "Emily", "Sam"];
  const now = Date.now();
  const destination = randomAddress();
  return {
    orderId: `AUTO-${now}`,
    customerName: pickOne(customerNames),
    destination,
    boxes: [
      {
        id: `BOX-${now}-1`,
        sku: randomSKU(),
      },
    ],
  };
}
