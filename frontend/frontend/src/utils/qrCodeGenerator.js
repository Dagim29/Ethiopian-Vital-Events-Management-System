import QRCode from 'qrcode';

/**
 * Generate QR code data URL for certificate verification
 * @param {Object} certificateData - Certificate information
 * @returns {Promise<string>} - Data URL of QR code image
 */
export const generateCertificateQRCode = async (certificateData) => {
  try {
    const { certificateNumber, recordType, recordId, issuedDate } = certificateData;
    
    // Create verification URL with certificate details
    const verificationData = {
      certNum: certificateNumber,
      type: recordType,
      id: recordId,
      issued: issuedDate,
      timestamp: Date.now()
    };
    
    // Encode data as JSON string
    const qrData = JSON.stringify(verificationData);
    
    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H', // High error correction
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate verification URL for certificate
 * @param {Object} certificateData - Certificate information
 * @returns {string} - Verification URL
 */
export const generateVerificationURL = (certificateData) => {
  const { certificateNumber, recordType } = certificateData;
  const baseURL = window.location.origin;
  return `${baseURL}/verify-certificate?cert=${certificateNumber}&type=${recordType}`;
};

/**
 * Parse QR code data
 * @param {string} qrData - QR code data string
 * @returns {Object} - Parsed certificate data
 */
export const parseQRCodeData = (qrData) => {
  try {
    const data = JSON.parse(qrData);
    return {
      certificateNumber: data.certNum,
      recordType: data.type,
      recordId: data.id,
      issuedDate: data.issued,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('Error parsing QR code data:', error);
    throw new Error('Invalid QR code data');
  }
};

/**
 * Generate QR code for canvas/image embedding
 * @param {Object} certificateData - Certificate information
 * @param {HTMLCanvasElement} canvas - Canvas element to draw QR code
 * @returns {Promise<void>}
 */
export const generateQRCodeToCanvas = async (certificateData, canvas) => {
  try {
    const verificationData = {
      certNum: certificateData.certificateNumber,
      type: certificateData.recordType,
      id: certificateData.recordId,
      issued: certificateData.issuedDate,
      timestamp: Date.now()
    };
    
    const qrData = JSON.stringify(verificationData);
    
    await QRCode.toCanvas(canvas, qrData, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Error generating QR code to canvas:', error);
    throw new Error('Failed to generate QR code');
  }
};
