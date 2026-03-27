import api from './axiosInstance';

export const orderApi = {
  place: (addressId: string, notes?: string) => api.post('/orders', { addressId, notes }),
  getMyOrders: (params?: Record<string, string>) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
  // Vendor
  getVendorOrders: (params?: Record<string, string>) =>
    api.get('/orders/vendor/incoming', { params }),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
  // Admin
  getAll: (params?: Record<string, string>) => api.get('/admin/orders', { params }),
};
