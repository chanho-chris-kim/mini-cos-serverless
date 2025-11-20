import { OrderService } from '../src/services/orderService'

describe('OrderService', () => {
  test('creates an order', async () => {
    const svc = new OrderService()
    const payload = { items: [{ sku: 'SKU1', qty: 1 }], customer: { name: 'Test' } }
    const order = await svc.createOrder(payload)
    expect(order).toHaveProperty('id')
    expect(order.items[0].sku).toBe('SKU1')
    expect(order.status).toBe('NEW')
  })
})
