import { api, authConfig } from './api';

export function getAllOrders(token) {
  return api.get('/api/orders', authConfig(token));
}

export function updateOrderStatus(orderId, status, token) {
  return api.put(`/api/orders/${orderId}/status`, { status }, authConfig(token));
}

export function createOrder({
  firstName,
  lastName,
  phone,
  email = '',
  city,
  address,
  shippingAddress,
  paymentMethod = 'cash',
  notes = '',
  items,
}, token) {
  return api.post('/api/orders', {
    first_name: firstName,
    last_name: lastName,
    phone,
    email,
    city,
    address,
    shipping_address: shippingAddress,
    payment_method: paymentMethod,
    notes,
    items: items.map((item) => ({
      product_id: item.id,
      quantity: item.qty,
    })),
  }, authConfig(token));
}
