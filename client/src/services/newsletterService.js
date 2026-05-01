import { api } from './api';

export function subscribeToNewsletter(email) {
  return api.post('/api/newsletter/subscribe', { email });
}
