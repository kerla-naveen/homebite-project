import api from './axiosInstance';

export const cartApi = {
  get: () => api.get('/cart'),
  addItem: (foodItemId: string, quantity?: number) =>
    api.post('/cart/items', { foodItemId, quantity: quantity || 1 }),
  updateItem: (foodItemId: string, quantity: number) =>
    api.put(`/cart/items/${foodItemId}`, { quantity }),
  removeItem: (foodItemId: string) => api.delete(`/cart/items/${foodItemId}`),
  clear: () => api.delete('/cart'),
};
