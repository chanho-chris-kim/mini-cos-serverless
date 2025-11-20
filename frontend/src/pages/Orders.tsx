import { useEffect, useState, useCallback } from "react";
import type { Order, Task } from "../types";
import * as OrdersAPI from "../api/orders";
import * as TasksAPI from "../api/tasks";
import CreateOrderForm from "../components/orders/CreateOrderForm";
import OrdersTable from "../components/orders/OrdersTable";
import TasksTable from "../components/orders/TasksTable";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const data = await OrdersAPI.fetchOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const data = await TasksAPI.fetchTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadTasks();
  }, [loadOrders, loadTasks]);

  const handleAssignTasks = async () => {
    setLoadingTasks(true);
    try {
      await TasksAPI.assignTasks();
      await loadTasks();
    } catch (err) {
      console.error("Failed to assign tasks:", err);
      alert("Failed to assign tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await OrdersAPI.deleteOrder(orderId);
      await loadOrders();
      await loadTasks();  
    } catch (err) {
      console.error("Failed to delete order:", err);
      alert("Failed to delete order");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-secondary text-textPrimary">
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">
        Mini-COS Dashboard
      </h1>

      <section aria-labelledby="orders-heading" className="mb-12">
        <CreateOrderForm
          onOrderCreated={async () => {
            await loadOrders();
            await loadTasks();
          }}
        />
        <h2
          id="orders-heading"
          className="text-2xl font-semibold mb-4 text-primary"
        >
          Orders
        </h2>
        <OrdersTable orders={orders} onDeleteOrder={handleDeleteOrder} />
      </section>

      <section aria-labelledby="tasks-heading">
        <h2
          id="tasks-heading"
          className="text-2xl font-semibold mb-4 text-primary"
        >
          Warehouse Tasks
        </h2>
        <button
          onClick={handleAssignTasks}
          disabled={loadingTasks}
          className={`px-4 py-2 rounded text-secondary mb-4 ${
            loadingTasks
              ? "bg-primary-hover cursor-not-allowed"
              : "bg-primary hover:bg-primary-hover"
          }`}
        >
          {loadingTasks ? "Assigning..." : "Assign Tasks"}
        </button>
        <TasksTable tasks={tasks} onTasksUpdated={loadTasks} />
      </section>
    </div>
  );
}
