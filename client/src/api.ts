import axios from 'axios';
import type { Pickup, ReservationRequest, LoadingConfirmation, SyncStatus } from './types';

// Determine if we're in Capacitor (mobile app) or web environment
const isCapacitor = !!(window as any).Capacitor;

// Use actual IP address for mobile apps, proxy for web dev
const baseURL = isCapacitor 
  ? 'http://192.168.1.148:3000/api'  // Your PC's local IP
  : '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Driver API
export const driverApi = {
  reservePickup: async (data: ReservationRequest) => {
    const response = await api.post<{ success: boolean; message: string; pickup: Pickup }>('/driver/reserve', data);
    return response.data.pickup;
  },
  
  checkPickup: async (referenceNumber: string) => {
    const response = await api.get<{ exists: boolean; isToday: boolean; canReserve: boolean; pickup?: Pickup }>(`/driver/check/${referenceNumber}`);
    return response.data;
  },

  verifyReference: async (referenceNumber: string) => {
    const response = await api.get<{ exists: boolean; isToday: boolean; canReserve: boolean; pickup?: Pickup }>(`/driver/check/${referenceNumber}`);
    return response.data;
  },

  startLoading: async (id: string) => {
    const response = await api.post<{ success: boolean; pickup: Pickup }>(`/driver/start-loading/${id}`);
    return response.data.pickup;
  },

  confirmLoaded: async (id: string) => {
    const response = await api.post<{ success: boolean; pickup: Pickup; pdfPath: string }>(`/driver/confirm-loaded/${id}`);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  getAllPickups: async (params?: { status?: string; date?: string; company?: string }) => {
    const response = await api.get<{ success: boolean; pickups: Pickup[] }>('/admin/pickups', { params });
    return response.data.pickups;
  },

  getTodayPickups: async () => {
    const response = await api.get<{ success: boolean; pickups: Pickup[] }>('/admin/pickups/today');
    return response.data.pickups;
  },

  createPickup: async (data: {
    referenceNumber: string;
    company: string;
    scheduledDate: string;
    goodsDescription: string;
    quantity?: number;
    notes?: string;
    pickupLocation: string;
    imageUrl?: string;
  }) => {
    const response = await api.post<{ success: boolean; pickup: Pickup }>('/admin/pickup', data);
    return response.data.pickup;
  },

  confirmLoading: async (id: string, data: LoadingConfirmation) => {
    const response = await api.post<{ success: boolean; pickup: Pickup }>(`/admin/confirm-loading/${id}`, data);
    return response.data.pickup;
  },
};

// Sync API
export const syncApi = {
  syncOutlook: async () => {
    const response = await api.post<{ success: boolean; message: string; synced: number }>('/sync/outlook');
    return { message: response.data.message, syncedCount: response.data.synced };
  },

  getSyncStatus: async () => {
    const response = await api.get<{ success: boolean; status: SyncStatus }>('/sync/status');
    return response.data.status;
  },
};

export default api;
