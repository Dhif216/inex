import { prisma } from '../config/database.js';
import { Pickup } from '@prisma/client';

export class PickupService {
  /**
   * Reserve a pickup for a driver
   * Validates that pickup exists and is scheduled for today
   */
  async reservePickup(
    referenceNumber: string,
    truckPlate: string,
    driverName?: string,
    quantity?: number,
    trailerNumber?: string,
    driverCompany?: string,
    destination?: string
  ): Promise<{ success: boolean; pickup?: Pickup; error?: string }> {
    try {
      // Find pickup by reference number
      const pickup = await prisma.pickup.findUnique({
        where: { referenceNumber },
      });

      if (!pickup) {
        return {
          success: false,
          error: 'Pickup not found. Please check the reference number.',
        };
      }

      // Check if already reserved or completed
      if (pickup.status === 'RESERVED' || pickup.status === 'LOADED' || pickup.status === 'COMPLETED') {
        return {
          success: false,
          error: `Pickup is already ${pickup.status.toLowerCase()}. Contact admin if this is incorrect.`,
        };
      }

      // Check if scheduled for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const scheduledDate = new Date(pickup.scheduledDate);

      if (scheduledDate < today || scheduledDate >= tomorrow) {
        return {
          success: false,
          error: `Pickup is scheduled for ${scheduledDate.toLocaleDateString()}, not today.`,
        };
      }

      // Reserve the pickup
      const updatedPickup = await prisma.pickup.update({
        where: { id: pickup.id },
        data: {
          status: 'RESERVED',
          truckPlate: truckPlate.toUpperCase(),
          driverName: driverName || 'Not provided',
          quantity: quantity,
          trailerNumber: trailerNumber ? trailerNumber.toUpperCase() : undefined,
          driverCompany: driverCompany || undefined,
          destination: destination || undefined,
        },
      });

      return { success: true, pickup: updatedPickup };
    } catch (error) {
      console.error('Error reserving pickup:', error);
      return {
        success: false,
        error: 'System error. Please try again or contact admin.',
      };
    }
  }

  /**
   * Confirm loading completion
   * Updates status to LOADED, then COMPLETED
   */
  async confirmLoading(
    pickupId: string,
    finalQuantity: number,
    notes?: string
  ): Promise<{ success: boolean; pickup?: Pickup; error?: string }> {
    try {
      const pickup = await prisma.pickup.findUnique({
        where: { id: pickupId },
      });

      if (!pickup) {
        return { success: false, error: 'Pickup not found' };
      }

      if (pickup.status !== 'RESERVED') {
        return {
          success: false,
          error: `Cannot confirm loading. Pickup status is ${pickup.status}.`,
        };
      }

      // Update to LOADED status with quantity and notes
      const updatedPickup = await prisma.pickup.update({
        where: { id: pickupId },
        data: {
          status: 'LOADED',
          quantity: finalQuantity,
          notes: notes || null,
        },
      });

      return { success: true, pickup: updatedPickup };
    } catch (error) {
      console.error('Error confirming loading:', error);
      return { success: false, error: 'System error' };
    }
  }

  /**
   * Mark pickup as completed (after PDF generation)
   */
  async markCompleted(pickupId: string, pdfPath: string): Promise<Pickup> {
    return await prisma.pickup.update({
      where: { id: pickupId },
      data: {
        status: 'COMPLETED',
        pdfPath,
      },
    });
  }

  /**
   * Get today's pickups
   */
  async getTodaysPickups(): Promise<Pickup[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await prisma.pickup.findMany({
      where: {
        scheduledDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  /**
   * Get pickups with filters
   */
  async getPickups(filters?: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    company?: string;
  }): Promise<Pickup[]> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.scheduledDate = {};
      if (filters.startDate) {
        where.scheduledDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.scheduledDate.lte = filters.endDate;
      }
    }

    if (filters?.company) {
      where.company = {
        contains: filters.company,
      };
    }

    return await prisma.pickup.findMany({
      where,
      orderBy: { scheduledDate: 'desc' },
    });
  }

  /**
   * Get pickup by ID
   */
  async getPickupById(id: string): Promise<Pickup | null> {
    return await prisma.pickup.findUnique({
      where: { id },
    });
  }

  /**
   * Get pickup by reference number
   */
  async getPickupByReference(referenceNumber: string): Promise<Pickup | null> {
    return await prisma.pickup.findUnique({
      where: { referenceNumber },
    });
  }

  /**
   * Create a new pickup
   */
  async createPickup(data: {
    referenceNumber: string;
    company: string;
    scheduledDate: Date;
    goodsDescription: string;
    quantity?: number;
    trailerNumber?: string;
    notes?: string;
    pickupLocation?: string;
    imageUrl?: string;
    status: string;
  }): Promise<Pickup> {
    return await prisma.pickup.create({
      data: {
        referenceNumber: data.referenceNumber,
        company: data.company,
        scheduledDate: data.scheduledDate,
        goodsDescription: data.goodsDescription,
        quantity: data.quantity,
        trailerNumber: data.trailerNumber,
        notes: data.notes,
        pickupLocation: data.pickupLocation,
        imageUrl: data.imageUrl,
        status: data.status,
      },
    });
  }

  /**
   * Start loading - change status from RESERVED to LOADING and record start time
   */
  async startLoading(id: string): Promise<Pickup> {
    return await prisma.pickup.update({
      where: { id },
      data: {
        status: 'LOADING',
        loadingStartTime: new Date(),
      },
    });
  }

  /**
   * Confirm driver loaded - update status to LOADED, add QR and PDF, record end time
   */
  async confirmDriverLoaded(id: string, qrCode: string, pdfPath: string): Promise<Pickup> {
    return await prisma.pickup.update({
      where: { id },
      data: {
        status: 'LOADED',
        qrCode,
        pdfPath: pdfPath || undefined,
        loadingEndTime: new Date(),
      },
    });
  }

  /**
   * Update PDF path for a pickup
   */
  async updatePdfPath(id: string, pdfPath: string): Promise<Pickup> {
    return await prisma.pickup.update({
      where: { id },
      data: {
        pdfPath,
      },
    });
  }
}
