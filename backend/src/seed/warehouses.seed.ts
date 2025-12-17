// backend/src/seed/warehouses.seed.ts
import type { WarehouseEntity } from "../domain/warehouses/warehouse.model";
import addresses from "../data/canadian_addresses.json";
import { INVENTORY } from "../utils/inventory";

const toronto = addresses.find((a) => a.city === "Toronto");
const montreal = addresses.find((a) => a.city === "Montreal");
const vancouver = addresses.find((a) => a.city === "Vancouver");
const calgary = addresses.find((a) => a.city === "Calgary");

export const warehouseSeed: WarehouseEntity[] = [
  {
    id: "WH-TOR-01",
    name: "Toronto Fulfillment Hub",
    location: {
      line1: toronto?.street ?? "1 Front St E",
      city: toronto?.city ?? "Toronto",
      province: toronto?.province ?? "ON",
      postal: toronto?.postal ?? "M5E 1B2",
      lat: toronto?.lat ?? 43.6475,
      lng: toronto?.lng ?? -79.3763,
    },
    activeWorkerCount: 10,
    dailyCapacity: 700,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inventory: { ...INVENTORY },
  },
  {
    id: "WH-MTL-01",
    name: "Montreal Fulfillment Hub",
    location: {
      line1: montreal?.street ?? "200 Boulevard René-Lévesque Ouest",
      city: montreal?.city ?? "Montreal",
      province: montreal?.province ?? "QC",
      postal: montreal?.postal ?? "H2Z 1X4",
      lat: montreal?.lat ?? 45.503,
      lng: montreal?.lng ?? -73.572,
    },
    activeWorkerCount: 10,
    dailyCapacity: 650,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inventory: { ...INVENTORY },
  },
  {
    id: "WH-VAN-01",
    name: "Vancouver Pacific Warehouse",
    location: {
      line1: vancouver?.street ?? "999 Canada Pl",
      city: vancouver?.city ?? "Vancouver",
      province: vancouver?.province ?? "BC",
      postal: vancouver?.postal ?? "V6C 3E1",
      lat: vancouver?.lat ?? 49.2885,
      lng: vancouver?.lng ?? -123.1128,
    },
    activeWorkerCount: 10,
    dailyCapacity: 600,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inventory: { ...INVENTORY },
  },
  {
    id: "WH-CGY-01",
    name: "Calgary Prairie Logistics Center",
    location: {
      line1: calgary?.street ?? "1231 8 St SW",
      city: calgary?.city ?? "Calgary",
      province: calgary?.province ?? "AB",
      postal: calgary?.postal ?? "T2R 1B1",
      lat: calgary?.lat ?? 51.0425,
      lng: calgary?.lng ?? -114.0861,
    },
    activeWorkerCount: 10,
    dailyCapacity: 550,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inventory: { ...INVENTORY },
  },
];
