import { Router, Request, Response } from 'express';
import { PickupService } from '../services/pickup.service';
import { PDFService } from '../services/pdf.service';
import { QRService } from '../services/qr.service';

const router = Router();
const pickupService = new PickupService();
const pdfService = new PDFService();
const qrService = new QRService();

/**
 * POST /api/driver/reserve
 * Reserve a pickup for today
 * Body: { referenceNumber: string, truckPlate: string, driverName?: string, quantity?: number, trailerNumber?: string }
 */
router.post('/reserve', async (req: Request, res: Response) => {
  try {
    const { referenceNumber, truckPlate, driverName, quantity, trailerNumber, driverCompany, destination } = req.body;

    // Validation
    if (!referenceNumber || !truckPlate) {
      return res.status(400).json({
        success: false,
        error: 'Reference number and truck plate are required',
      });
    }

    const result = await pickupService.reservePickup(
      referenceNumber.trim(),
      truckPlate.trim(),
      driverName?.trim(),
      quantity ? parseInt(quantity) : undefined,
      trailerNumber?.trim(),
      driverCompany?.trim(),
      destination?.trim()
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json({
      success: true,
      message: 'Pickup reserved successfully',
      pickup: {
        id: result.pickup!.id,
        referenceNumber: result.pickup!.referenceNumber,
        company: result.pickup!.company,
        scheduledDate: result.pickup!.scheduledDate,
        status: result.pickup!.status,
        truckPlate: result.pickup!.truckPlate,
        trailerNumber: result.pickup!.trailerNumber,
        driverName: result.pickup!.driverName,
        quantity: result.pickup!.quantity,
        pdfPath: result.pickup!.pdfPath,
      },
    });
  } catch (error) {
    console.error('Error in reserve endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error. Please try again.',
    });
  }
});

/**
 * POST /api/driver/start-loading/:id
 * Driver arrives and starts loading - change status from RESERVED to LOADING
 */
router.post('/start-loading/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the pickup
    const pickup = await pickupService.getPickupById(id);
    
    if (!pickup) {
      return res.status(404).json({
        success: false,
        error: 'Pickup not found',
      });
    }

    if (pickup.status !== 'RESERVED') {
      return res.status(400).json({
        success: false,
        error: `Cannot start loading. Current status: ${pickup.status}`,
      });
    }

    // Update status to LOADING and record start time
    const updatedPickup = await pickupService.startLoading(id);

    return res.json({
      success: true,
      message: 'Loading started',
      pickup: updatedPickup,
    });
  } catch (error) {
    console.error('Error starting loading:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error. Please try again.',
    });
  }
});

/**
 * POST /api/driver/confirm-loaded/:id
 * Driver confirms loading is complete - generates PDF & QR, changes status to LOADED
 */
router.post('/confirm-loaded/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find the pickup
    const pickup = await pickupService.getPickupById(id);
    
    if (!pickup) {
      return res.status(404).json({
        success: false,
        error: 'Pickup not found',
      });
    }

    if (pickup.status !== 'LOADING') {
      return res.status(400).json({
        success: false,
        error: `Cannot confirm loading. Current status: ${pickup.status}`,
      });
    }

    // Generate QR code
    const qrCode = await qrService.generateQRCode(pickup.referenceNumber);

    // Update pickup with loading end time first (without PDF yet)
    const updatedPickupTemp = await pickupService.confirmDriverLoaded(id, qrCode, '');

    // Generate PDF with the complete updated data
    const pdfPath = await pdfService.generateRahtikirja(updatedPickupTemp);

    // Update pickup again with the PDF path
    const finalPickup = await pickupService.updatePdfPath(id, pdfPath);

    return res.json({
      success: true,
      message: 'Loading confirmed! Documents generated.',
      pickup: finalPickup,
      pdfPath,
    });
  } catch (error) {
    console.error('Error confirming loaded:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error. Please try again.',
    });
  }
});

/**
 * POST /api/driver/confirm-loading/:id
 * Confirm loading completion and generate PDF (driver side) - OLD METHOD
 */
router.post('/confirm-loading/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, notes } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required',
      });
    }

    // Confirm loading
    const result = await pickupService.confirmLoading(id, parseInt(quantity), notes);

    if (!result.success || !result.pickup) {
      return res.status(400).json(result);
    }

    // Generate PDF
    const pdfPath = await pdfService.generateRahtikirja(result.pickup);

    // Mark as completed
    const completedPickup = await pickupService.markCompleted(id, pdfPath);

    return res.json({
      success: true,
      message: 'Loading confirmed and PDF generated',
      pickup: completedPickup,
      pdfPath,
    });
  } catch (error) {
    console.error('Error confirming loading:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * GET /api/driver/pickups/today
 * Get all pickups for today (for status checking)
 */
router.get('/pickups/today', async (req: Request, res: Response) => {
  try {
    const pickups = await pickupService.getTodaysPickups();
    
    return res.json({
      success: true,
      pickups: pickups.map((p) => ({
        id: p.id,
        referenceNumber: p.referenceNumber,
        company: p.company,
        scheduledDate: p.scheduledDate,
        goodsDescription: p.goodsDescription,
        quantity: p.quantity,
        status: p.status,
        truckPlate: p.truckPlate,
        driverName: p.driverName,
        pdfPath: p.pdfPath,
      })),
    });
  } catch (error) {
    console.error('Error getting today pickups:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * GET /api/driver/pickups
 * Get all pickups (for status checking across all dates)
 */
router.get('/pickups', async (req: Request, res: Response) => {
  try {
    const pickups = await pickupService.getPickups();
    
    return res.json({
      success: true,
      pickups: pickups.map((p) => ({
        id: p.id,
        referenceNumber: p.referenceNumber,
        company: p.company,
        scheduledDate: p.scheduledDate,
        goodsDescription: p.goodsDescription,
        quantity: p.quantity,
        status: p.status,
        truckPlate: p.truckPlate,
        driverName: p.driverName,
        pdfPath: p.pdfPath,
      })),
    });
  } catch (error) {
    console.error('Error getting all pickups:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * GET /api/driver/check/:referenceNumber
 * Check if a pickup exists and can be reserved
 */
router.get('/check/:referenceNumber', async (req: Request, res: Response) => {
  try {
    const { referenceNumber } = req.params;

    const pickup = await pickupService.getPickupByReference(referenceNumber);

    if (!pickup) {
      return res.status(404).json({
        exists: false,
        message: 'Pickup not found',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const scheduledDate = new Date(pickup.scheduledDate);
    const isToday = scheduledDate >= today && scheduledDate < tomorrow;

    return res.json({
      exists: true,
      isToday,
      canReserve: isToday && pickup.status === 'PENDING',
      pickup: {
        id: pickup.id,
        referenceNumber: pickup.referenceNumber,
        company: pickup.company,
        scheduledDate: pickup.scheduledDate,
        goodsDescription: pickup.goodsDescription,
        quantity: pickup.quantity,
        status: pickup.status,
        pickupLocation: pickup.pickupLocation,
        imageUrl: pickup.imageUrl,
        driverName: pickup.driverName,
        driverCompany: pickup.driverCompany,
        truckPlate: pickup.truckPlate,
        trailerNumber: pickup.trailerNumber,
        destination: pickup.destination,
        qrCode: pickup.qrCode,
        pdfPath: pickup.pdfPath,
        loadingStartTime: pickup.loadingStartTime,
        loadingEndTime: pickup.loadingEndTime,
        notes: pickup.notes,
      },
    });
  } catch (error) {
    console.error('Error checking pickup:', error);
    return res.status(500).json({
      exists: false,
      error: 'Server error',
    });
  }
});

/**
 * GET /api/driver/pickup/:id/pdf
 * Download PDF for a reserved pickup
 */
router.get('/pickup/:id/pdf', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pickup = await pickupService.getPickupById(id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        error: 'Pickup not found',
      });
    }

    if (!pickup.pdfPath) {
      return res.status(404).json({
        success: false,
        error: 'PDF not available yet',
      });
    }

    // Send the PDF file
    res.download(pickup.pdfPath, `rahtikirja_${pickup.referenceNumber}.pdf`);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * GET /api/driver/qr/:id
 * Generate QR code for pickup verification
 */
router.get('/qr/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pickup = await pickupService.getPickupById(id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        error: 'Pickup not found',
      });
    }

    const qrCode = await qrService.generateQRCode(pickup.id, pickup.referenceNumber);

    return res.json({
      success: true,
      qrCode,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * GET /api/verify/:id
 * Verify pickup status by ID (for QR code scanning)
 */
router.get('/verify/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pickup = await pickupService.getPickupById(id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        error: 'Pickup not found',
      });
    }

    return res.json({
      success: true,
      pickup: {
        id: pickup.id,
        referenceNumber: pickup.referenceNumber,
        company: pickup.company,
        scheduledDate: pickup.scheduledDate,
        status: pickup.status,
        truckPlate: pickup.truckPlate,
        trailerNumber: pickup.trailerNumber,
        driverName: pickup.driverName,
        quantity: pickup.quantity,
        pdfPath: pickup.pdfPath,
      },
    });
  } catch (error) {
    console.error('Error verifying pickup:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

export default router;
