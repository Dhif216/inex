// API Types
export interface Pickup {
  id: string;
  referenceNumber: string;
  company: string;
  scheduledDate: string;
  goodsDescription: string;
  quantity: number | null;
  status: 'PENDING' | 'LOADING' | 'LOADED' | 'COMPLETED';
  truckPlate: string | null;
  trailerNumber: string | null;
  driverName: string | null;
  driverCompany: string | null;
  destination: string | null;
  pickupLocation: string | null;
  imageUrl: string | null;
  loadingStartTime: string | null;
  loadingEndTime: string | null;
  qrCode: string | null;
  outlookEventId: string | null;
  pdfPath: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationRequest {
  referenceNumber: string;
  truckPlate: string;
  trailerNumber?: string;
  driverName: string;
  driverCompany: string;
  destination: string;
  notes?: string;
}

export interface LoadingConfirmation {
  quantity: number;
  notes?: string;
}

export interface SyncStatus {
  lastSync: string | null;
  status: string;
  pickupsFound?: number;
}

export interface ApiError {
  error: string;
  message?: string;
}
