import { api, authConfig } from './api';

export function getAllOrders(token) {
  return api.get('/api/orders', authConfig(token));
}

export function updateOrderStatus(orderId, status, token) {
  return api.put(`/api/orders/${orderId}/status`, { status }, authConfig(token));
}

export function createOrder({ userId, shippingAddress, notes = '', items }) {
  return api.post('/api/orders', {
    user_id: userId,
    shipping_address: shippingAddress,
    notes,
    items: items.map((item) => ({
      product_id: item.id,
      quantity: item.qty,
    })),
  });
}
