import { Router, Request, Response } from 'express';
import { PickupService } from '../services/pickup.service';
import { PDFService } from '../services/pdf.service';

const router = Router();
const pickupService = new PickupService();
const pdfService = new PDFService();

/**
 * POST /api/admin/pickup
 * Create a new pickup
 */
router.post('/pickup', async (req: Request, res: Response) => {
  try {
    const { 
      referenceNumber, 
      company, 
      scheduledDate, 
      goodsDescription, 
      quantity, 
      trailerNumber, 
      notes,
      pickupLocation,
      imageUrl 
    } = req.body;

    // Validation
    if (!referenceNumber || !company || !scheduledDate || !goodsDescription) {
      return res.status(400).json({
        success: false,
        error: 'Reference number, company, scheduled date, and goods description are required',
      });
    }

    if (!pickupLocation) {
      return res.status(400).json({
        success: false,
        error: 'Pickup location is required',
      });
    }

    const pickupData = {
      referenceNumber: referenceNumber.trim(),
      company: company.trim(),
      scheduledDate: new Date(scheduledDate),
      goodsDescription: goodsDescription.trim(),
      quantity: quantity ? parseInt(quantity) : undefined,
      trailerNumber: trailerNumber?.trim(),
      notes: notes?.trim(),
      pickupLocation: pickupLocation.trim(),
      imageUrl: imageUrl || undefined,
      status: 'PENDING' as const,
    };

    const pickup = await pickupService.createPickup(pickupData);

    return res.json({
      success: true,
      message: 'Pickup created successfully',
      pickup,
    });
  } catch (error: any) {
    console.error('Error creating pickup:', error);
    
    // Handle duplicate reference number
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'A pickup with this reference number already exists',
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
});

/**
 * POST /api/admin/confirm-loading/:id
 * Confirm loading completion and generate PDF
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
 * GET /api/admin/pickups
 * Get all pickups with optional filters
 * Query params: status, startDate, endDate, date, company
 */
router.get('/pickups', async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate, date, company } = req.query;

    const filters: any = {};

    if (status && typeof status === 'string') {
      filters.status = status;
    }

    // Handle single date filter
    if (date && typeof date === 'string') {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      filters.startDate = startOfDay;
      filters.endDate = endOfDay;
    } else {
      // Handle date range filters
      if (startDate && typeof startDate === 'string') {
        filters.startDate = new Date(startDate);
      }

      if (endDate && typeof endDate === 'string') {
        filters.endDate = new Date(endDate);
      }
    }

    if (company && typeof company === 'string') {
      filters.company = company;
    }

    const pickups = await pickupService.getPickups(filters);

    return res.json({
      success: true,
      count: pickups.length,
      pickups,
    });
  } catch (error) {
    console.error('Error fetching pickups:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * GET /api/admin/pickups/today
 * Get today's pickups
 */
router.get('/pickups/today', async (req: Request, res: Response) => {
  try {
    const pickups = await pickupService.getTodaysPickups();

    // Group by status
    const grouped = {
      pending: pickups.filter((p) => p.status === 'PENDING'),
      reserved: pickups.filter((p) => p.status === 'RESERVED'),
      loaded: pickups.filter((p) => p.status === 'LOADED'),
      completed: pickups.filter((p) => p.status === 'COMPLETED'),
    };

    return res.json({
      success: true,
      total: pickups.length,
      grouped,
      pickups,
    });
  } catch (error) {
    console.error('Error fetching today\'s pickups:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * GET /api/admin/pickups/:id
 * Get single pickup by ID
 */
router.get('/pickups/:id', async (req: Request, res: Response) => {
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
      pickup,
    });
  } catch (error) {
    console.error('Error fetching pickup:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * GET /api/admin/pickup/:id/pdf
 * Download PDF for a pickup
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
        error: 'PDF not generated yet',
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
 * POST /api/admin/pickup/:id/generate-pdf
 * Generate PDF without confirming loading (for already completed pickups)
 */
router.post('/pickup/:id/generate-pdf', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pickup = await pickupService.getPickupById(id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        error: 'Pickup not found',
      });
    }

    // Generate PDF
    const pdfPath = await pdfService.generateRahtikirja(pickup);

    // Update pickup with PDF path
    const updatedPickup = await pickupService.markCompleted(id, pdfPath);

    return res.json({
      success: true,
      message: 'PDF generated successfully',
      pickup: updatedPickup,
      pdfPath,
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysPickups = await pickupService.getTodaysPickups();
    const allPickups = await pickupService.getPickups();

    const stats = {
      today: {
        total: todaysPickups.length,
        pending: todaysPickups.filter((p) => p.status === 'PENDING').length,
        reserved: todaysPickups.filter((p) => p.status === 'RESERVED').length,
        loaded: todaysPickups.filter((p) => p.status === 'LOADED').length,
        completed: todaysPickups.filter((p) => p.status === 'COMPLETED').length,
      },
      overall: {
        total: allPickups.length,
        pending: allPickups.filter((p) => p.status === 'PENDING').length,
        reserved: allPickups.filter((p) => p.status === 'RESERVED').length,
        loaded: allPickups.filter((p) => p.status === 'LOADED').length,
        completed: allPickups.filter((p) => p.status === 'COMPLETED').length,
      },
    };

    return res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
});

export default router;
