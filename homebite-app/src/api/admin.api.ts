import api from './axiosInstance';

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPendingVendors: () => api.get('/admin/vendors/pending'),
  getAllVendors: (params?: Record<string, string>) => api.get('/admin/vendors', { params }),
  getVendorById: (id: string) => api.get(`/admin/vendors/${id}`),
  approveVendor: (id: string) => api.patch(`/admin/vendors/${id}/approve`),
  rejectVendor: (id: string, reason: string) => api.patch(`/admin/vendors/${id}/reject`, { reason }),
  suspendVendor: (id: string) => api.patch(`/admin/vendors/${id}/suspend`),
  getUsers: (params?: Record<string, string>) => api.get('/admin/users', { params }),
  toggleBlockUser: (id: string) => api.patch(`/admin/users/${id}/block`),
  getAllOrders: (params?: Record<string, string>) => api.get('/admin/orders', { params }),
};
