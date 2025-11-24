import type { Warehouse } from "../types";

export const warehouses: Warehouse[] = [
  {
    id: "wh1",
    name: "Montreal Main Warehouse",
    location: {
      line1: "600 Logistics Dr",
      city: "Montreal",
      postal: "H4T 1J4",
      lat: 45.5088,
      lng: -73.6530
    },
    inventory: {
      "QWRERTDS": 120,
      "ASDFDGQ": 80,
      "ASDF": 300,
      "COZEY001": 55
    }
  }
];
