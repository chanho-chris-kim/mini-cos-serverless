# COS (Cozey Operating System) - Warehouse & Logistics Platform

## Overview
COS is a full end-to-end internal operations system inspired by Cozey.ca’s real warehouse and post‑purchase logistics workflows.  
This project simulates how a modern e-commerce furniture brand manages orders, boxes, workers, warehouses, tasks, shipping integrations, and returns.

This README is written as if this were *actively used by Cozey Engineering staff*, matching their job description for a Senior Software Engineer.

---
## Quick start (local)
Prereqs: Node 18+, npm, (optional) Serverless Framework for deploys.

```bash
git clone <repo-url>
cd mini-cos
npm install
# Run backend in dev
cd backend && npm run dev
# Run frontend in dev
cd ../frontend && npm run dev
```

# Key Features
- **Complete Post‑Purchase Journey**
  - Order ingestion  
  - Multi‑warehouse routing  
  - Automated task creation  
  - Picking, packing, shipping workflows  
  - Courier tracking + customer updates  

- **AI‑Driven Warehouse Automation**
  - Auto task assignment  
  - Smart routing engine (multi‑warehouse, modular furniture)  
  - QA classification assistant for returns  

- **State Machines**
  - Forward fulfillment state machine  
  - Reverse (returns) state machine with classification  

- **Scanning System**
  - Workers scan → COS interprets the meaning automatically  
  - No dropdowns, no decisions  
  - Context-aware transitions  

- **Serverless Architecture**
  - AWS Lambda  
  - DynamoDB  
  - SQS  
  - SNS  
  - API Gateway  
  - EventBridge  

- **Role‑Based Access**
  - Admin, Ops, Warehouse Manager, Worker, QA, Support  

---

# System Architecture

```
                ┌───────────────┐
                │   Customer    │
                └───────┬───────┘
                        │ Order webhook
                        ▼
                ┌───────────────────┐
                │       COS         │
                └────────┬──────────┘
                         │
         ┌───────────────┼────────────────┐
         ▼               ▼                ▼
 ┌────────────┐   ┌────────────┐   ┌────────────┐
 │ Router/AI  │   │  Task Eng. │   │  Scan API  │
 └────────────┘   └─────┬──────┘   └──────┬─────┘
                         │               Scan
                         ▼                 │
                ┌───────────────────┐      │
                │   Warehouse WMS   │◄─────┘
                └───────────────────┘
                         │
         ┌───────────────┼─────────────────────────────┐
         ▼               ▼                             ▼
  ┌────────────┐   ┌────────────┐              ┌────────────┐
  │ Picking    │   │ Packing    │              │ Shipping   │
  └────────────┘   └────────────┘              └────────────┘

                     RETURN FLOW
                           ▼
                     ┌──────────┐
                     │ RETURNS  │
                     └─────┬────┘
                           ▼
                    ┌───────────┐
                    │   QA      │
                    └─────┬─────┘
                           ▼
         ┌────────────┬──────────────┬──────────────┬─────────────┐
         ▼            ▼              ▼              ▼             ▼
   FULL_PRICE   DISCOUNT       REFURBISH       SALVAGE        TRASH
```

---

# Fulfillment Workflow (Forward Flow)

## Box State Machine

```
PENDING
  → PICK_ASSIGNED
  → PICKED
  → PACKED
  → OUTBOUND
  → SHIPPED
  → IN_TRANSIT
  → DELIVERED
```

### Description

| State | Meaning |
|-------|---------|
| **PENDING** | Order created, box not processed |
| **PICK_ASSIGNED** | Task created + assigned |
| **PICKED** | Box scanned in picking zone |
| **PACKED** | Scanned in packing zone |
| **OUTBOUND** | Label printed, courier scheduled |
| **SHIPPED** | Courier pickup scan |
| **IN_TRANSIT** | Courier movement |
| **DELIVERED** | Customer delivery scan |

---

# Return Workflow (Reverse Flow)

## Return State Machine

```
RETURN_RECEIVED
  → QA_PENDING
  → QA_IN_PROGRESS
  → QA_DONE
  → RETURN_CLASSIFIED
```

### Classification Categories
```
FULL_PRICE
DISCOUNT
REFURBISH
SALVAGE
TRASH
```

### Meaning

| Category | Meaning |
|----------|---------|
| **FULL_PRICE** | Item is like‑new → restock |
| **DISCOUNT** | Minor damage → open-box sale |
| **REFURBISH** | Needs repair or cleaning |
| **SALVAGE** | Used for parts |
| **TRASH** | Cannot be reused |

---

# Scanning Logic

Workers only **scan**.  
COS decides the correct next state.

## Scan API

### `POST /scan`

#### Request:
```json
{
  "userId": "U1002",
  "boxId": "BX34955",
  "warehouseId": "W-MTL",
  "zone": "PICKING"
}
```

#### Response:
```json
{
  "status": "PICKED",
  "message": "Box BX34955 marked as PICKED"
}
```

---

# Data Models

## Order
```ts
interface Order {
  orderId: string;
  customerId: string;
  createdAt: string;
  status: "PENDING" | "PARTIAL" | "FULFILLED" | "DELIVERED" | "RETURNED";
  boxes: string[];
  warehouseRoutes: Record<string,string[]>;
  courierTracking?: Record<string,string>;
}
```

## Box
```ts
interface Box {
  boxId: string;
  orderId: string;
  sku: string;
  state:
    | "PENDING"
    | "PICK_ASSIGNED"
    | "PICKED"
    | "PACKED"
    | "OUTBOUND"
    | "SHIPPED"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "RETURN_RECEIVED"
    | "QA_PENDING"
    | "QA_IN_PROGRESS"
    | "QA_DONE"
    | "RETURN_CLASSIFIED";

  fulfillmentWarehouseId?: string;
  trackingNumber?: string;
  returnCategory?:
    | "FULL_PRICE"
    | "DISCOUNT"
    | "REFURBISH"
    | "SALVAGE"
    | "TRASH";
}
```

## Task
```ts
interface Task {
  taskId: string;
  warehouseId: string;
  type: "PICK" | "PACK" | "SHIP" | "REFURBISH" | "QA";
  boxId: string;
  assignedTo?: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "FAILED";
  createdAt: string;
  updatedAt: string;
}
```

## Warehouse
```ts
interface Warehouse {
  warehouseId: string;
  name: string;
  region: string;
  zones: string[];
  stock: Record<string,number>;
}
```

## User
```ts
interface User {
  userId: string;
  role: "ADMIN" | "OPS_MANAGER" | "WAREHOUSE_MANAGER" | "WORKER" | "QA" | "SUPPORT";
  warehouseId?: string;
}
```

---

# AI Agents

## Task Assignment Agent
Assigns tasks automatically based on:
- worker speed  
- workload  
- warehouse zone availability  

## Routing Engine
Determines:
- which warehouse fulfills which box  
- closest stock available  
- split-shipment optimization  

## QA Classification Assistant
Helps warehouse QA workers classify returns.

---

# Testing
- Jest unit tests  
- Integration tests for state machine  
- End-to-end flows using mocked scans  

---

# Frontend UI (Planned)
- React + TypeScript  
- Tailwind  
- Role‑based dashboards  
- Worker “scan interface” optimized for tablets  
- QA return classification UI  

---

# Deployment (AWS Serverless)
- API Gateway  
- Lambda  
- DynamoDB  
- SQS Task Queue  
- SNS Notifications  
- EventBridge Scheduled Automation  

---

# Roadmap
- Worker performance dashboard  
- Live warehouse heatmaps  
- Courier rate optimization  
- Real-time order tracking map  
- AI‑powered forecasting  

---

# License
This project is licensed under the **Creative Commons Attribution–NonCommercial–NoDerivatives 4.0 International License** (CC BY-NC-ND 4.0).

You may:
- View and share the project for portfolio or educational purposes.

You may **not**:
- Use the software commercially  
- Modify, remix, or build upon the code  
- Redistribute modified versions  
- Integrate the code into commercial or internal business systems  

See the full license here: [LICENSE](./LICENSE)

---

# 👤 Author
**Chanho Chris Kim**  
GitHub: https://github.com/chanho-chris-kim  
Website: https://chanhokim.ca  

