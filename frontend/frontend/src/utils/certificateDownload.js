/**
 * Certificate Download Utility
 * Provides multiple methods for downloading certificates with optimal quality
 * Includes QR code generation for certificate verification
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generateCertificateQRCode } from './qrCodeGenerator';

/**
 * Download methods available
 */
export const DOWNLOAD_METHODS = {
  PRINT_TO_PDF: 'print_to_pdf',      // Browser native (best quality)
  HTML2CANVAS: 'html2canvas',         // DOM to image conversion
  DIRECT_PDF: 'direct_pdf',           // Direct PDF generation
};

/**
 * Certificate configurations for different types
 */
const CERTIFICATE_CONFIG = {
  birth: {
    color: '#009639',
    name: 'Birth Certificate',
    prefix: 'BC',
  },
  death: {
    color: '#DA121A',
    name: 'Death Certificate',
    prefix: 'DC',
  },
  marriage: {
    color: '#E91E63',
    name: 'Marriage Certificate',
    prefix: 'MC',
  },
  divorce: {
    color: '#FF9800',
    name: 'Divorce Certificate',
    prefix: 'DV',
  },
};

/**
 * Add QR code to certificate element
 * @param {HTMLElement} element - Certificate element
 * @param {Object} certificateData - Certificate data for QR code
 * @returns {Promise<boolean>} - Success status
 */
export const addQRCodeToCertificate = async (element, certificateData) => {
  try {
    if (!element || !certificateData) {
      console.warn('Missing element or certificate data for QR code');
      return false;
    }
    
    const qrCodeData = await generateCertificateQRCode(certificateData);
    
    // Find QR code container
    let qrContainer = element.querySelector('.qr-code-container');
    if (!qrContainer) {
      qrContainer = element.querySelector('[class*="qr"]');
    }
    
    if (qrContainer) {
      const qrImg = qrContainer.querySelector('img') || document.createElement('img');
      qrImg.src = qrCodeData;
      qrImg.alt = 'Certificate QR Code';
      qrImg.style.width = '100%';
      qrImg.style.height = 'auto';
      if (!qrImg.parentElement) {
        qrContainer.appendChild(qrImg);
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error adding QR code to certificate:', error);
    return false;
  }
};

/**
 * Method 1: Browser Print-to-PDF (Recommended)
 * Uses browser's native print functionality for perfect quality
 */
export const downloadViaPrint = async (certificateNumber, type, record = null) => {
  // Add QR code if record data is available
  if (record && certificateNumber) {
    try {
      const certificateElement = document.querySelector('.certificate-content');
      if (certificateElement) {
        await addQRCodeToCertificate(certificateElement, {
          certificateNumber: certificateNumber,
          recordType: type,
          recordId: record._id || record.id,
          issuedDate: record.issued_date || record.created_at || new Date().toISOString()
        });
        // Wait for QR code to render
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (qrError) {
      console.error('Failed to add QR code for print:', qrError);
      // Continue without QR code
    }
  }
  
  // Add print-specific styles
  const printStyles = document.createElement('style');
  printStyles.id = 'certificate-print-styles';
  printStyles.textContent = `
    @media print {
      /* Hide everything except certificate */
      body * {
        visibility: hidden !important;
      }
      
      .certificate-content,
      .certificate-content * {
        visibility: visible !important;
      }
      
      .certificate-content {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
      }
      
      /* Ensure colors print */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      /* Hide action buttons */
      button,
      .no-print {
        display: none !important;
      }
      
      /* Page setup */
      @page {
        size: A4 portrait;
        margin: 0;
      }
      
      /* Ensure proper page breaks */
      .certificate-content {
        page-break-inside: avoid;
        page-break-after: avoid;
      }
    }
  `;
  
  document.head.appendChild(printStyles);
  
  // Trigger print dialog
  window.print();
  
  // Clean up after print dialog closes
  setTimeout(() => {
    const styles = document.getElementById('certificate-print-styles');
    if (styles) {
      styles.remove();
    }
  }, 1000);
  
  return {
    success: true,
    method: DOWNLOAD_METHODS.PRINT_TO_PDF,
    message: 'Print dialog opened. Select "Save as PDF" to download.',
  };
};

/**
 * Method 2: Capture Certificate View as PDF
 * Captures the exact certificate displayed on screen with QR code
 */
export const downloadViaCertificateCapture = async (element, certificateNumber, type, record = null) => {
  try {
    if (!element) {
      console.error('Element is null or undefined');
      throw new Error('Certificate element not found');
    }
    
    const config = CERTIFICATE_CONFIG[type] || CERTIFICATE_CONFIG.birth;
    
    console.log('Starting certificate capture...');
    
    // Generate and add QR code if record data is available
    if (record && certificateNumber) {
      try {
        const qrCodeData = await generateCertificateQRCode({
          certificateNumber: certificateNumber,
          recordType: type,
          recordId: record._id || record.id,
          issuedDate: record.issued_date || record.created_at || new Date().toISOString()
        });
        
        // Find or create QR code container in the certificate
        let qrContainer = element.querySelector('.qr-code-container');
        if (!qrContainer) {
          qrContainer = element.querySelector('[class*="qr"]');
        }
        
        if (qrContainer) {
          // Add QR code image
          const qrImg = qrContainer.querySelector('img') || document.createElement('img');
          qrImg.src = qrCodeData;
          qrImg.alt = 'Certificate QR Code';
          qrImg.style.width = '100%';
          qrImg.style.height = 'auto';
          if (!qrImg.parentElement) {
            qrContainer.appendChild(qrImg);
          }
          console.log('QR code added to certificate');
        } else {
          console.warn('QR code container not found in certificate');
        }
      } catch (qrError) {
        console.error('Failed to generate QR code:', qrError);
        // Continue without QR code
      }
    }
    
    // Wait for QR code rendering
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get dimensions
    const rect = element.getBoundingClientRect();
    console.log('Element dimensions:', rect.width, 'x', rect.height);
    
    // Capture with html2canvas - handle oklch colors
    console.log('Capturing with html2canvas...');
    
    // Temporarily suppress console warnings for oklch
    const originalWarn = console.warn;
    const originalError = console.error;
    console.warn = (...args) => {
      const message = args[0]?.toString() || '';
      if (!message.includes('oklch') && !message.includes('Attempting to parse')) {
        originalWarn.apply(console, args);
      }
    };
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      if (!message.includes('oklch') && !message.includes('Attempting to parse')) {
        originalError.apply(console, args);
      }
    };
    
    let canvas;
    try {
      canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: rect.width,
        height: rect.height,
        windowWidth: rect.width,
        windowHeight: rect.height,
        ignoreElements: (element) => {
          // Skip elements that might have oklch colors
          return false;
        },
        onclone: (clonedDoc) => {
          // Ensure QR code images are visible in clone
          const qrImages = clonedDoc.querySelectorAll('.qr-code-container img');
          qrImages.forEach(img => {
            img.style.display = 'block';
            img.style.visibility = 'visible';
          });
          
          // Convert any oklch colors to hex in the cloned document
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            
            // Convert background color
            if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('oklch')) {
              el.style.backgroundColor = '#ffffff';
            }
            
            // Convert text color
            if (computedStyle.color && computedStyle.color.includes('oklch')) {
              el.style.color = '#000000';
            }
            
            // Convert border color
            if (computedStyle.borderColor && computedStyle.borderColor.includes('oklch')) {
              el.style.borderColor = '#000000';
            }
          });
        }
      });
    } catch (err) {
      console.log('First attempt failed, retrying with simpler options...', err);
      // If html2canvas fails, try with minimal options
      try {
        canvas = await html2canvas(element, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          ignoreElements: () => false,
        });
      } catch (secondErr) {
        console.error('Both html2canvas attempts failed:', secondErr);
        throw new Error('Failed to capture certificate. Please try using the Print method instead.');
      }
    } finally {
      // Restore console methods
      console.warn = originalWarn;
      console.error = originalError;
    }
    
    if (!canvas) {
      throw new Error('Failed to create canvas');
    }
    
    console.log('Canvas created:', canvas.width, 'x', canvas.height);
    
    // Convert to image
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calculate dimensions to fit A4
    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Scale to fit with margins
    const margin = 10;
    const availableWidth = pdfWidth - (2 * margin);
    const availableHeight = pdfHeight - (2 * margin);
    
    const scale = Math.min(
      availableWidth / (imgWidth * 0.264583),
      availableHeight / (imgHeight * 0.264583)
    );
    
    const scaledWidth = (imgWidth * 0.264583) * scale;
    const scaledHeight = (imgHeight * 0.264583) * scale;
    
    // Center on page
    const x = (pdfWidth - scaledWidth) / 2;
    const y = (pdfHeight - scaledHeight) / 2;
    
    // Add image
    pdf.addImage(imgData, 'JPEG', x, y, scaledWidth, scaledHeight);
    
    // Add metadata
    pdf.setProperties({
      title: `${config.name} - ${certificateNumber}`,
      subject: config.name,
      author: 'Ethiopian Vital Events Management System',
      creator: 'EVEMS',
    });
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${config.prefix}_${certificateNumber || 'Certificate'}_${timestamp}.pdf`;
    
    console.log('Saving PDF:', filename);
    
    // Save
    pdf.save(filename);
    
    return {
      success: true,
      method: 'certificate_capture',
      filename,
      message: 'Certificate downloaded successfully',
    };
  } catch (error) {
    console.error('Error in downloadViaCertificateCapture:', error);
    throw error;
  }
};

/**
 * Method 3: Direct PDF Generation
 * Generates PDF directly from data (future implementation)
 */
export const downloadViaDirectPDF = async (record, type) => {
  // This would generate PDF directly from data without DOM rendering
  // Useful for server-side generation or batch processing
  // Implementation would use jsPDF with manual layout
  
  throw new Error('Direct PDF generation not yet implemented. Use HTML2Canvas method instead.');
};

/**
 * Fallback: Simple window.print method
 * Most reliable, always works
 */
export const downloadViaSimplePrint = (certificateNumber, type) => {
  try {
    window.print();
    return {
      success: true,
      method: 'simple_print',
      message: 'Print dialog opened. Select "Save as PDF" to download.',
    };
  } catch (error) {
    console.error('Error in downloadViaSimplePrint:', error);
    throw error;
  }
};

/**
 * Smart download function that chooses the best method
 */
export const downloadCertificate = async (element, record, type, method = 'auto') => {
  const certificateNumber = record?.certificate_number || 'Unknown';
  
  try {
    // Validate inputs
    if (!element && method === DOWNLOAD_METHODS.HTML2CANVAS) {
      throw new Error('Certificate element is required for capture method');
    }
    
    // Auto-select best method - default to certificate capture
    if (method === 'auto') {
      method = DOWNLOAD_METHODS.HTML2CANVAS; // This captures the actual certificate view
    }
    
    console.log('Executing download method:', method);
    console.log('Certificate data:', { certificateNumber, type, recordId: record?._id || record?.id });
    
    // Execute selected method with fallback
    try {
      switch (method) {
        case DOWNLOAD_METHODS.PRINT_TO_PDF:
          return await downloadViaPrint(certificateNumber, type, record);
        
        case DOWNLOAD_METHODS.HTML2CANVAS:
          return await downloadViaCertificateCapture(element, certificateNumber, type, record);
        
        case DOWNLOAD_METHODS.DIRECT_PDF:
          return await downloadViaDirectPDF(record, type);
        
        default:
          throw new Error(`Unknown download method: ${method}`);
      }
    } catch (methodError) {
      console.error(`Method ${method} failed:`, methodError);
      throw methodError;
    }
  } catch (error) {
    console.error('Certificate download error:', error);
    return {
      success: false,
      error: error.message,
      message: error.message || 'Failed to download certificate. Please try again.',
    };
  }
};

/**
 * Batch download multiple certificates
 */
export const downloadMultipleCertificates = async (certificates, method = 'auto') => {
  const results = [];
  
  for (const cert of certificates) {
    try {
      const result = await downloadCertificate(
        cert.element,
        cert.record,
        cert.type,
        method
      );
      results.push({ ...result, certificateId: cert.id });
      
      // Add delay between downloads to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      results.push({
        success: false,
        certificateId: cert.id,
        error: error.message,
      });
    }
  }
  
  return results;
};

/**
 * Validate certificate element before download
 */
export const validateCertificateElement = (element) => {
  if (!element) {
    return { valid: false, error: 'Certificate element not found' };
  }
  
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return { valid: false, error: 'Certificate element has no dimensions' };
  }
  
  return { valid: true };
};

/**
 * Get download method recommendations based on browser
 */
export const getRecommendedMethod = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Chrome/Edge - Print to PDF works best
  if (userAgent.includes('chrome') || userAgent.includes('edg')) {
    return {
      method: DOWNLOAD_METHODS.PRINT_TO_PDF,
      reason: 'Browser print provides best quality in Chrome/Edge',
    };
  }
  
  // Firefox - Print to PDF works well
  if (userAgent.includes('firefox')) {
    return {
      method: DOWNLOAD_METHODS.PRINT_TO_PDF,
      reason: 'Browser print provides best quality in Firefox',
    };
  }
  
  // Safari - HTML2Canvas might be more reliable
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return {
      method: DOWNLOAD_METHODS.HTML2CANVAS,
      reason: 'HTML2Canvas provides more consistent results in Safari',
    };
  }
  
  // Default
  return {
    method: DOWNLOAD_METHODS.PRINT_TO_PDF,
    reason: 'Browser print is the recommended default method',
  };
};

export default {
  downloadCertificate,
  downloadViaPrint,
  downloadViaCertificateCapture,
  downloadViaDirectPDF,
  downloadViaSimplePrint,
  downloadMultipleCertificates,
  validateCertificateElement,
  getRecommendedMethod,
  addQRCodeToCertificate,
  DOWNLOAD_METHODS,
  CERTIFICATE_CONFIG,
};
