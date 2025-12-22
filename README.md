# Mini-COS — Warehouse Operations Platform (Serverless + React)

Mini-COS is a **production-inspired warehouse operations system** that simulates how modern e-commerce companies manage **orders, inventory, tasks, workers, and fulfillment workflows** at scale.

It’s designed to resemble real internal WMS / COS tools: **clean architecture, strong domain boundaries, performance-minded UI**, and an API that can evolve toward **event-driven** workflows.

> 🚧 **Status:** Active development — core domains, APIs, and UI scaffolding are implemented; more features and hardening are planned.

---

## ✨ Highlights

- **Order lifecycle management**
  - Create / track orders and statuses
  - Generate fulfillment workflows: **PICK → PACK → SHIP**
- **Automated warehouse assignment**
  - Assigns orders to the best warehouse using distance + capacity/load signals
- **Task orchestration**
  - Create/assign tasks to workers and track execution
- **Real-time warehouse events (SSE)**
  - Stream operational events to the UI
- **Role-based UI + auth foundation**
  - Protected routes and role-aware navigation (UI)
- **Domain-driven structure**
  - Clear separation of Orders, Tasks, Warehouses, Workers, Customers, Inventory, Returns, Events, AI Assignment
- **Serverless-ready backend**
  - Built to scale horizontally and deploy via Serverless Framework (AWS)

---

## 🧠 Repository Structure

This repo is a **monorepo** with a React frontend and a Serverless/TypeScript backend.

```
mini-cos/
├── backend/                 # Serverless + TypeScript API (DDD-style domains)
│   ├── serverless.yaml
│   ├── src/
│   │   ├── api/             # Controllers + routes
│   │   ├── domain/          # Business domains (orders/tasks/warehouses/etc.)
│   │   ├── lib/             # Dynamo + sync helpers
│   │   ├── middleware/      # Auth + integration middleware
│   │   ├── seed/            # Seed data (users, warehouses, workers, products)
│   │   └── lambda.ts        # Lambda entry
│   └── tests/               # Backend tests (Jest)
├── frontend/                # React + Vite + TypeScript dashboard
│   ├── src/
│   │   ├── api/             # API client + typed endpoints
│   │   ├── components/      # Reusable UI components (tables, kanban, layout)
│   │   ├── hooks/           # Auth sync, SSE events, low-stock, etc.
│   │   ├── pages/           # Dashboard pages (Orders/Tasks/Warehouses/etc.)
│   │   └── simulator/       # Local sim engine + generators + UI
│   └── vite.config.ts
├── infra/                   # Infrastructure config (shared serverless.yml, etc.)
├── shared/                  # Shared JSON/config artifacts
└── README.md
```

---

## 🏗️ Backend Architecture (Serverless API)

**Backend location:** `./backend`

The backend follows **domain-driven organization**, where each domain encapsulates:
- Models/entities
- Services (business logic)
- Repository contracts + Dynamo implementations (where applicable)

Key areas:
- `src/domain/orders` — order models, repositories, services
- `src/domain/tasks` — task lifecycle and task services
- `src/domain/warehouses` / `workers` / `customers` — operational entities
- `src/domain/ai` — warehouse assignment logic (distance + load heuristics)
- `src/domain/events` — event logging + SSE manager + event repositories
- `src/api` — controllers + route definitions
- `src/middleware` — auth, dev bypass, integrations/auth

---

## 🖥️ Frontend Architecture (React Dashboard)

**Frontend location:** `./frontend`

The frontend is a **React + Vite + TypeScript** dashboard with:
- Typed API clients in `src/api`
- Shared UI components in `src/components` (tables, kanban, layout, topbar/sidebar)
- Role-aware routing via `ProtectedRoute`
- Hooks for:
  - auth sync (`useAuthSync`)
  - real-time updates via SSE (`useWarehouseEventsSSE`)
  - low-stock insights (`useLowStock`)
- A local simulator module (`src/simulator`) to generate realistic operational activity

---

## 🧰 Tech Stack

**Frontend**
- React + TypeScript + Vite
- Tailwind CSS
- Client-side routing + protected routes
- SSE consumption for live updates

**Backend**
- Node.js + TypeScript
- Serverless Framework
- REST APIs (Express-style routing in Lambda)
- DynamoDB integration (repositories)
- Jest for tests

---

## 🔄 Core Workflows

### Fulfillment workflow
1. Order is received/created
2. Best warehouse is selected automatically (assignment service)
3. PICK → PACK → SHIP tasks are generated
4. Workers complete tasks, updating task & order status
5. Events are logged and streamed to the UI (SSE)

### Warehouse assignment signals
- Distance to customer (haversine)
- Warehouse capacity and current load (active tasks)
- Worker availability / operational constraints
- Inventory thresholds (low-stock logic)

---

## 🚀 Getting Started (Local)

### Prerequisites
- Node.js (LTS recommended)
- npm

### Install (root)
```bash
npm install
```

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### Run Backend (local)
```bash
cd backend
npm install
npm run dev
```

> Note: Local backend run/deploy commands may evolve as AWS resources and environments are finalized.

---

## 🧪 Tests

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

---

## 🗺️ Roadmap (Planned)

- Harden auth + role-based permissions end-to-end
- Expand E2E coverage (frontend + backend)
- Event-driven processing (SQS / EventBridge) for task pipelines
- Analytics dashboards (operational + seasonal insights)
- AI-assisted routing optimization (more signals, constraints, explainability)
- CI/CD automation for deploy + previews

---

## 👤 Author

**Chanho Kim**  
Montreal, QC, Canada

- Website: chanhokim.ca  
- GitHub: github.com/chanho-chris-kim  
- LinkedIn: linkedin.com/in/chanho-chris-kim

---

## 📄 License 

This project is licensed under the **Creative Commons Attribution–NonCommercial–NoDerivatives 4.0 International (CC BY-NC-ND 4.0)** license.

The repository is published **for portfolio and educational review purposes only**.

You may:
- View and review the source code
- Clone and run the project locally for evaluation
- Share the repository **unchanged** with attribution

You may **not**:
- Use this project or its code for commercial purposes
- Modify and redistribute the code
- Integrate this code into production or internal business systems

For full terms, see the [`LICENSE`](./LICENSE) file.
