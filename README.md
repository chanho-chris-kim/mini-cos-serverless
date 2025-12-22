# Mini-COS — Serverless Warehouse Operations Platform

Mini-COS is a **production-inspired, serverless warehouse operations system** designed to simulate how modern e-commerce companies manage orders, inventory, tasks, and fulfillment workflows at scale.

This project is intentionally built to mirror **real-world logistics platforms** (WMS / COS systems) with clean architecture, scalability, and extensibility in mind.

> 🚧 **Status:** In active development — core domain architecture and services implemented, with additional features planned.

---

## ✨ Key Features

- **Order lifecycle management**
  - Receive and track customer orders
  - Generate PICK → PACK → SHIP workflows
- **Automated warehouse assignment**
  - Assigns orders to the most suitable warehouse based on distance, capacity, and load
- **Task orchestration**
  - Creates and manages warehouse tasks across workers and locations
- **Domain-driven design**
  - Clear separation of Orders, Tasks, Warehouses, Workers, Inventory, Returns
- **Serverless-first architecture**
  - Designed for horizontal scalability and cost efficiency
- **Extensible foundation**
  - Built to support future AI routing, analytics, and event-driven workflows

---

## 🧠 System Architecture

```
mini-cos-serverless/
├── src/
│   ├── domain/
│   │   ├── orders/
│   │   ├── tasks/
│   │   ├── warehouses/
│   │   ├── workers/
│   │   ├── inventory/
│   │   ├── returns/
│   │   └── ai/
│   ├── events/
│   ├── utils/
│   ├── config/
│   └── seed/
├── serverless.yml
├── package.json
└── README.md
```

Each domain encapsulates:
- Entities & models
- Business rules
- Services & workflows
- Repository abstractions

This structure keeps business logic **framework-agnostic**, testable, and easy to evolve.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js + TypeScript
- **Architecture:** Serverless Framework
- **API:** RESTful services
- **Cloud (planned):**
  - AWS Lambda
  - API Gateway
  - DynamoDB
  - SQS / EventBridge
- **Tooling:** ESLint, Prettier, GitHub

---

## 🔄 Core Workflows

### Order Fulfillment
1. Customer order is received
2. Best warehouse is selected automatically
3. PICK → PACK → SHIP tasks are generated
4. Workers complete tasks, updating order status

### Warehouse Assignment Logic
- Distance to customer
- Active workload per warehouse
- Worker availability
- Inventory thresholds

---

## 🧪 Development Status

### Implemented
- Core domain models and services
- Warehouse assignment logic
- Task lifecycle workflows
- Seed data for simulation
- Clean domain-driven structure

### Planned
- Authentication & role-based access
- Frontend dashboard (React)
- Event-driven task processing
- Analytics & reporting
- AI-assisted routing optimization
- Automated tests

---

## 🚀 Getting Started

```bash
git clone https://github.com/chanho-chris-kim/mini-cos-serverless.git
cd mini-cos-serverless
npm install
```

Local execution and deployment steps will evolve as cloud integrations are finalized.

---

## 📌 Project Goals

- Simulate real-world warehouse operations
- Demonstrate scalable backend architecture
- Showcase clean domain-driven design
- Serve as a portfolio-grade systems project

---

## 👤 Author

**Chanho Kim**  
Front-End / Full-Stack Developer  
📍 Montreal, Canada  

- Website: https://chanhokim.ca  
- GitHub: https://github.com/chanho-chris-kim  
- LinkedIn: https://linkedin.com/in/chanho-chris-kim  

---

## 📄 License

MIT License
