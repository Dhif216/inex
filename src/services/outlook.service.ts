import { getGraphClient, getGraphConfig } from '../config/graph.js';
import { prisma } from '../config/database.js';
import { Event } from '@microsoft/microsoft-graph-types';

export interface OutlookEvent {
  id: string;
  subject: string;
  start: string;
  end: string;
  body?: string;
}

export class OutlookSyncService {
  /**
   * Sync calendar events from Outlook to local database
   * Extracts pickup information from event details
   */
  async syncCalendarEvents(daysAhead: number = 30): Promise<{ synced: number; errors: string[] }> {
    try {
      const client = await getGraphClient();
      const config = getGraphConfig();

      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysAhead);
      endDate.setHours(23, 59, 59, 999);

      // Query calendar events
      const response = await client
        .api(`/users/${config.userEmail}/calendar/events`)
        .filter(
          `start/dateTime ge '${startDate.toISOString()}' and start/dateTime le '${endDate.toISOString()}'`
        )
        .select('id,subject,start,end,body')
        .top(100)
        .get();

      const events: Event[] = response.value || [];
      let synced = 0;
      const errors: string[] = [];

      for (const event of events) {
        try {
          const pickupData = this.parseEventToPickup(event);
          
          if (pickupData) {
            // Upsert: create if doesn't exist, update if it does
            await prisma.pickup.upsert({
              where: { outlookEventId: event.id || '' },
              create: {
                ...pickupData,
                outlookEventId: event.id || undefined,
              },
              update: {
                company: pickupData.company,
                scheduledDate: pickupData.scheduledDate,
                goodsDescription: pickupData.goodsDescription,
              },
            });
            synced++;
          }
        } catch (error) {
          errors.push(`Failed to sync event ${event.subject}: ${error}`);
          console.error('Error syncing event:', error);
        }
      }

      console.log(`Synced ${synced} events from Outlook`);
      return { synced, errors };
    } catch (error) {
      console.error('Error syncing Outlook calendar:', error);
      throw error;
    }
  }

  /**
   * Parse Outlook event into Pickup data
   * Expected format in subject or body:
   * REF-12345 | Company Name | Goods description
   */
  private parseEventToPickup(event: Event): {
    referenceNumber: string;
    company: string;
    scheduledDate: Date;
    goodsDescription: string;
  } | null {
    try {
      const subject = event.subject || '';
      const body = event.body?.content || '';
      const startDate = event.start?.dateTime;

      if (!startDate) {
        console.warn('Event missing start date:', subject);
        return null;
      }

      // Try to parse from subject first: "REF-12345 | CompanyName | Goods"
      const subjectParts = subject.split('|').map((s) => s.trim());
      
      if (subjectParts.length >= 2) {
        const referenceNumber = subjectParts[0].trim();
        const company = subjectParts[1].trim();
        const goodsDescription = subjectParts[2]?.trim() || 'Not specified';

        // Validate reference number format
        if (!referenceNumber || referenceNumber.length < 3) {
          console.warn('Invalid reference number in event:', subject);
          return null;
        }

        return {
          referenceNumber,
          company,
          scheduledDate: new Date(startDate),
          goodsDescription,
        };
      }

      // Alternative: try parsing from body
      const bodyText = this.stripHtml(body);
      const refMatch = bodyText.match(/REF[:\-\s]*([A-Z0-9\-]+)/i);
      const companyMatch = bodyText.match(/Company[:\-\s]*([^\n]+)/i);
      const goodsMatch = bodyText.match(/Goods[:\-\s]*([^\n]+)/i);

      if (refMatch && companyMatch) {
        return {
          referenceNumber: refMatch[1].trim(),
          company: companyMatch[1].trim(),
          scheduledDate: new Date(startDate),
          goodsDescription: goodsMatch?.[1]?.trim() || 'Not specified',
        };
      }

      console.warn('Could not parse pickup data from event:', subject);
      return null;
    } catch (error) {
      console.error('Error parsing event:', error);
      return null;
    }
  }

  /**
   * Strip HTML tags from string
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
  }

  /**
   * Get sync status and last sync time
   */
  async getSyncStatus(): Promise<{
    lastSync: Date | null;
    totalPickups: number;
    pendingPickups: number;
  }> {
    const pickups = await prisma.pickup.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const totalPickups = await prisma.pickup.count();
    const pendingPickups = await prisma.pickup.count({
      where: { status: 'PENDING' },
    });

    return {
      lastSync: pickups[0]?.createdAt || null,
      totalPickups,
      pendingPickups,
    };
  }
}
