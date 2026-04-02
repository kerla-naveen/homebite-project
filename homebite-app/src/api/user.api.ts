import api from './axiosInstance';

export interface AddressPayload {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: { name?: string; phone?: string }) => api.put('/users/me', data),
  getAddresses: () => api.get('/users/me/addresses'),
  addAddress: (payload: AddressPayload) => api.post('/users/me/address', payload),
  updateAddress: (id: string, payload: Partial<AddressPayload>) => api.put(`/users/me/address/${id}`, payload),
  deleteAddress: (id: string) => api.delete(`/users/me/address/${id}`),
};
