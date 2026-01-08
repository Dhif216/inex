import QRCode from 'qrcode';

export class QRService {
  /**
   * Generate QR code data URL for pickup verification
   */
  async generateQRCode(pickupId: string, referenceNumber: string): Promise<string> {
    try {
      const verificationUrl = `${process.env.PUBLIC_URL || 'http://localhost:3000'}/verify?id=${pickupId}&ref=${referenceNumber}`;
      
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return qrDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }
}
