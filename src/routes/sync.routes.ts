import { Router, Request, Response } from 'express';
import { OutlookSyncService } from '../services/outlook.service.js';

const router = Router();
const outlookService = new OutlookSyncService();

/**
 * POST /api/sync/outlook
 * Manually trigger Outlook calendar sync
 * Query param: daysAhead (default: 30)
 */
router.post('/outlook', async (req: Request, res: Response) => {
  try {
    const daysAhead = parseInt(req.query.daysAhead as string) || 30;

    console.log(`Starting Outlook sync for next ${daysAhead} days...`);

    const result = await outlookService.syncCalendarEvents(daysAhead);

    return res.json({
      success: true,
      message: `Synced ${result.synced} events from Outlook`,
      synced: result.synced,
      errors: result.errors,
    });
  } catch (error: any) {
    console.error('Error syncing Outlook:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync Outlook calendar',
    });
  }
});

/**
 * GET /api/sync/status
 * Get sync status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await outlookService.getSyncStatus();

    return res.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get sync status',
    });
  }
});

export default router;
