import type { Worker } from "../types";

export const workers: Worker[] = [
  {
    id: "w1",
    name: "Alex Martin",
    role: "Warehouse Picker",
    maxTasks: 10,
    currentTasks: 2,
    homeBase: {
      line1: "123 Logistics Ave",
      city: "Montreal",
      postal: "H4T 1A1",
      lat: 45.5101,
      lng: -73.6650
    }
  },
  {
    id: "w2",
    name: "Maya Thompson",
    role: "Delivery Specialist",
    maxTasks: 5,
    currentTasks: 1,
    homeBase: {
      line1: "500 Rue du College",
      city: "Montreal",
      postal: "H4T 1V5",
      lat: 45.5003,
      lng: -73.6542
    }
  },
  {
    id: "w3",
    name: "David Lee",
    role: "Warehouse Picker",
    maxTasks: 8,
    currentTasks: 0,
    homeBase: {
      line1: "800 Logistics Blvd",
      city: "Montreal",
      postal: "H4T 2B3",
      lat: 45.5142,
      lng: -73.6601
    }
  }
];
