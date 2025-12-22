import { OrderService } from '../src/domain/orders/order.service'

describe('OrderService', () => {
  test('creates an order', async () => {
    const svc = new OrderService()
    const payload = { items: [{ sku: 'SOFA-3P-GREY', qty: 1 }], customer: { name: 'Test' } }
    const result = await svc.createOrder(payload)

    expect(result.order).toBeDefined()
    expect(result.order.id).toBeTruthy()
    expect(result.order.boxes[0].sku).toBe('SOFA-3P-GREY')
    expect(result.order.status).toBe('PENDING')
    expect(result.tasks.length).toBeGreaterThan(0)
  })
})
