import type { Customer } from "../types";

export const customers: Customer[] = [
  {
    id: "c1",
    name: "Chanho Kim",
    email: "chanho@example.com",
    homeAddress: {
      line1: "123 St Catherine St",
      city: "Montreal",
      postal: "H3B 1K4",
      lat: 45.5048,
      lng: -73.5772
    },
    deliveryAddress: {
      line1: "450 Rue Sainte-Catherine Ouest",
      city: "Montreal",
      postal: "H3B 1A6",
      lat: 45.4995,
      lng: -73.5641
    }
  },
  {
    id: "c2",
    name: "Sophia Li",
    email: "sophia@example.com",
    homeAddress: {
      line1: "900 Blvd René-Lévesque Ouest",
      city: "Montreal",
      postal: "H3B 4X9",
      lat: 45.4990,
      lng: -73.5670
    },
    deliveryAddress: {
      line1: "990 Sherbrooke St W",
      city: "Montreal",
      postal: "H3A 1G5",
      lat: 45.5042,
      lng: -73.5741
    }
  }
];