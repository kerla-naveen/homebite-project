import api from './axiosInstance';

export const vendorApi = {
  list: (params?: Record<string, string>) => api.get('/vendors', { params }),
  getById: (id: string) => api.get(`/vendors/${id}`),
  onboard: (data: Record<string, unknown>) => api.post('/vendors/onboard', data),
  getMyProfile: () => api.get('/vendors/profile/me'),
  updateMyProfile: (data: Record<string, unknown>) => api.put('/vendors/profile/me', data),
};
