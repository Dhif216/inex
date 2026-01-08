import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { Pickup } from '@prisma/client';

export class PDFService {
  private storagePath: string;

  constructor() {
    this.storagePath = process.env.PDF_STORAGE_PATH || './storage/pdfs';
    this.ensureStorageExists();
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageExists(): void {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  /**
   * Generate Rahtikirja (waybill) PDF for a pickup
   */
  async generateRahtikirja(pickup: Pickup): Promise<string> {
    try {
      console.log('Generating PDF for pickup:', {
        ref: pickup.referenceNumber,
        driver: pickup.driverName,
        company: pickup.driverCompany,
        truck: pickup.truckPlate,
        trailer: pickup.trailerNumber,
        destination: pickup.destination,
        location: pickup.pickupLocation,
        status: pickup.status,
      });

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const { width, height } = page.getSize();
      const margin = 50;
      let yPosition = height - margin;

      // Helper function to draw text
      const drawText = (
        text: string,
        x: number,
        y: number,
        size: number = 12,
        useBold: boolean = false
      ) => {
        page.drawText(text, {
          x,
          y,
          size,
          font: useBold ? boldFont : font,
          color: rgb(0, 0, 0),
        });
      };

      // Title with header box
      page.drawRectangle({
        x: margin,
        y: yPosition - 35,
        width: width - margin * 2,
        height: 40,
        color: rgb(0.2, 0.4, 0.7),
      });
      drawText('RAHTIKIRJA / WAYBILL', width / 2 - 120, yPosition - 10, 22, true);
      page.drawText('RAHTIKIRJA / WAYBILL', {
        x: width / 2 - 120,
        y: yPosition - 10,
        size: 22,
        font: boldFont,
        color: rgb(1, 1, 1),
      });
      yPosition -= 55;

      // Document Info Box
      page.drawRectangle({
        x: margin,
        y: yPosition - 85,
        width: width - margin * 2,
        height: 90,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      });
      yPosition -= 15;

      // Reference Number (Prominent)
      drawText('Reference Number:', margin + 10, yPosition, 14, true);
      drawText(pickup.referenceNumber, margin + 180, yPosition, 14, true);
      yPosition -= 25;

      // Date & Time
      drawText('Scheduled Date:', margin + 10, yPosition, 11, true);
      const dateStr = new Date(pickup.scheduledDate).toLocaleDateString('fi-FI');
      drawText(dateStr, margin + 180, yPosition, 11);
      yPosition -= 20;

      // Company
      drawText('Company:', margin + 10, yPosition, 11, true);
      drawText(pickup.company, margin + 180, yPosition, 11);
      yPosition -= 20;

      // Status
      drawText('Status:', margin + 10, yPosition, 11, true);
      drawText(pickup.status, margin + 180, yPosition, 11, true);
      yPosition -= 35;

      // Location & Destination Section
      page.drawRectangle({
        x: margin,
        y: yPosition - 75,
        width: width - margin * 2,
        height: 80,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      });
      yPosition -= 15;
      drawText('LOCATIONS', margin + 10, yPosition, 13, true);
      yPosition -= 25;

      // Pickup Location
      drawText('📍 Pickup Location:', margin + 10, yPosition, 11, true);
      drawText(pickup.pickupLocation || 'Not specified', margin + 180, yPosition, 11);
      yPosition -= 22;

      // Destination
      drawText('🎯 Destination:', margin + 10, yPosition, 11, true);
      drawText(pickup.destination || 'Not specified', margin + 180, yPosition, 11);
      yPosition -= 35;

      // Goods Section
      page.drawRectangle({
        x: margin,
        y: yPosition - 65,
        width: width - margin * 2,
        height: 70,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      });
      yPosition -= 15;

      drawText('GOODS INFORMATION', margin + 10, yPosition, 13, true);
      yPosition -= 25;

      drawText('Description:', margin + 10, yPosition, 11, true);
      drawText(pickup.goodsDescription, margin + 180, yPosition, 11);
      yPosition -= 22;

      drawText('Quantity:', margin + 10, yPosition, 11, true);
      drawText(
        pickup.quantity ? `${pickup.quantity} units` : 'Not specified',
        margin + 180,
        yPosition,
        11
      );
      yPosition -= 35;

      // Transport Section
      page.drawRectangle({
        x: margin,
        y: yPosition - 110,
        width: width - margin * 2,
        height: 115,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      });
      yPosition -= 15;

      drawText('TRANSPORT DETAILS', margin + 10, yPosition, 13, true);
      yPosition -= 25;

      drawText('Driver Name:', margin + 10, yPosition, 11, true);
      drawText(pickup.driverName || 'N/A', margin + 180, yPosition, 11);
      yPosition -= 22;

      drawText('Driver Company:', margin + 10, yPosition, 11, true);
      drawText(pickup.driverCompany || 'N/A', margin + 180, yPosition, 11);
      yPosition -= 22;

      drawText('🚛 Truck Plate:', margin + 10, yPosition, 11, true);
      drawText(pickup.truckPlate || 'N/A', margin + 180, yPosition, 11);
      yPosition -= 22;

      drawText('🚚 Trailer Number:', margin + 10, yPosition, 11, true);
      drawText(pickup.trailerNumber || 'N/A', margin + 180, yPosition, 11);
      yPosition -= 35;

      // Loading Times
      if (pickup.loadingStartTime || pickup.loadingEndTime) {
        const timesHeight = 65;
        page.drawRectangle({
          x: margin,
          y: yPosition - timesHeight,
          width: width - margin * 2,
          height: timesHeight,
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 1,
        });
        yPosition -= 15;
        drawText('⏱️ LOADING TIMES', margin + 10, yPosition, 13, true);
        yPosition -= 25;

        if (pickup.loadingStartTime) {
          drawText('Started:', margin + 10, yPosition, 11, true);
          drawText(
            new Date(pickup.loadingStartTime).toLocaleString('fi-FI'),
            margin + 180,
            yPosition,
            11
          );
          yPosition -= 22;
        }

        if (pickup.loadingEndTime) {
          drawText('Completed:', margin + 10, yPosition, 11, true);
          drawText(
            new Date(pickup.loadingEndTime).toLocaleString('fi-FI'),
            margin + 180,
            yPosition,
            11
          );
          yPosition -= 22;
        }
        yPosition -= 13;
      }

      // Notes
      if (pickup.notes) {
        page.drawLine({
          start: { x: margin, y: yPosition },
          end: { x: width - margin, y: yPosition },
          thickness: 1,
          color: rgb(0.7, 0.7, 0.7),
        });
        yPosition -= 25;

        drawText('NOTES', margin, yPosition, 14, true);
        yPosition -= 25;

        // Wrap notes text if too long
        const maxWidth = width - margin * 2 - 150;
        const words = pickup.notes.split(' ');
        let line = '';

        for (const word of words) {
          const testLine = line + word + ' ';
          const testWidth = font.widthOfTextAtSize(testLine, 12);

          if (testWidth > maxWidth) {
            drawText(line, margin, yPosition, 12);
            line = word + ' ';
            yPosition -= 20;
          } else {
            line = testLine;
          }
        }
        if (line) {
          drawText(line, margin, yPosition, 12);
          yPosition -= 40;
        }
      }

      // Status
      page.drawLine({
        start: { x: margin, y: yPosition },
        end: { x: width - margin, y: yPosition },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
      });
      yPosition -= 25;

      drawText('Status:', margin, yPosition, 12, true);
      drawText(pickup.status, margin + 150, yPosition, 12);
      yPosition -= 25;

      drawText('Generated:', margin, yPosition, 12, true);
      drawText(new Date().toLocaleString('fi-FI'), margin + 150, yPosition, 12);

      // Footer
      const footerY = margin;
      page.drawLine({
        start: { x: margin, y: footerY + 20 },
        end: { x: width - margin, y: footerY + 20 },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
      });
      drawText(
        'This document was automatically generated by the Pickup Management System',
        margin,
        footerY,
        8
      );

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const filename = `rahtikirja_${pickup.referenceNumber}_${Date.now()}.pdf`;
      const filepath = path.join(this.storagePath, filename);

      fs.writeFileSync(filepath, pdfBytes);

      // Return web-accessible URL instead of file path
      const webPath = `/storage/pdfs/${filename}`;
      console.log(`PDF generated: ${filepath} -> accessible at ${webPath}`);
      return webPath;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  /**
   * Get PDF file path
   */
  getPdfPath(pickup: Pickup): string | null {
    return pickup.pdfPath;
  }

  /**
   * Check if PDF exists
   */
  pdfExists(filepath: string): boolean {
    return fs.existsSync(filepath);
  }
}
