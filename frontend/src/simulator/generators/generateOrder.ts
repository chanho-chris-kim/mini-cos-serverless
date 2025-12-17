// frontend/src/simulator/generators/generateOrder.ts
import { useSimStore } from "../store";
import { createOrder } from "../../api/orders";
import { fetchLowStock } from "../../api/analytics";
import addresses from "../../data/canadian_addresses.json";

const FIRST_NAMES = [
  "Emily",
  "Noah",
  "Olivia",
  "Liam",
  "Sophia",
  "William",
  "Mia",
  "James",
  "Benjamin",
  "Ava",
  "Lucas",
  "Charlotte",
  "Elijah",
  "Amelia",
  "Logan",
];

const LAST_NAMES = [
  "Smith",
  "Brown",
  "Tremblay",
  "Martin",
  "Roy",
  "Lee",
  "Wilson",
  "Garcia",
  "Rodriguez",
  "Anderson",
  "Chan",
  "Kim",
  "Singh",
  "Patel",
  "Walker",
];

function pickRandomName() {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
}

export async function generateOrder() {
  const log = useSimStore.getState().log;
  const { skus, loadSkus } = useSimStore.getState();

  if (!skus || skus.length === 0) {
    await loadSkus();
  }
  const skuList = useSimStore.getState().skus;
  if (!skuList || skuList.length === 0) {
    log("No SKUs available to generate order");
    return;
  }
  const randomSku = () =>
    skuList[Math.floor(Math.random() * skuList.length)];

  const itemCount = Math.floor(Math.random() * 12) + 1;
  const items = Array.from({ length: itemCount }).map(() => ({
    sku: randomSku(),
    qty: Math.floor(Math.random() * 3) + 1,
  }));

  const randomAddress =
    addresses[Math.floor(Math.random() * addresses.length)] ?? addresses[0];
  const destination = {
    address: randomAddress.street,
    city: randomAddress.city,
    province: randomAddress.province,
    postal: randomAddress.postal,
    street: randomAddress.street,
    lat: randomAddress.lat,
    lng: randomAddress.lng,
  };

  const payload = {
    customerName: pickRandomName(),
    items,
    destination,
  };

  const res = await createOrder(payload);
  const name = (res as any)?.order?.customerName ?? (res as any)?.customerName ?? "(unknown)";
  const id = (res as any)?.order?.id ?? (res as any)?.id ?? "(unknown)";
  log(`New order created: ${name} (${id})`);

  try {
    const low = await fetchLowStock();
    (low as any[])
      .filter((w) => w.lowStock && w.lowStock.length > 0)
      .forEach((w) => {
        const msg = w.lowStock
          .map((i: any) => `${i.sku} (${i.qty} left)`)
          .join(", ");
        log(`[SIM ALERT] Low stock in ${w.warehouseId}: ${msg}`);
      });
  } catch (err) {
    console.error("Failed to fetch low stock:", err);
  }
}
