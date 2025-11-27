# QR Code Integration with Certificate Downloads

## Overview
QR codes are now automatically generated and embedded in certificates during the download process. This enables easy verification of certificate authenticity.

## How It Works

### 1. QR Code Generation
When a certificate is downloaded, a QR code is automatically generated containing:
- Certificate Number
- Record Type (birth, death, marriage, divorce)
- Record ID
- Issue Date
- Timestamp

### 2. QR Code Embedding
The QR code is embedded in the certificate before PDF generation:

**For HTML2Canvas Method:**
- QR code is generated as a data URL
- Inserted into the certificate's QR code container
- Certificate is captured with the QR code included

**For Print-to-PDF Method:**
- QR code is added to the certificate element
- Browser's native print includes the QR code
- User saves as PDF with QR code embedded

### 3. Certificate Verification
Users can verify certificates by:
1. Scanning the QR code with any QR code reader
2. Visiting the verification URL: `/verify-certificate`
3. Entering certificate details manually

## Implementation Details

### Certificate Download Flow
```javascript
// 1. User initiates download
downloadCertificate(element, record, type, method)

// 2. QR code is generated
generateCertificateQRCode({
  certificateNumber,
  recordType,
  recordId,
  issuedDate
})

// 3. QR code is added to certificate
addQRCodeToCertificate(element, certificateData)

// 4. Certificate is captured/printed with QR code
```

### QR Code Data Structure
```json
{
  "certNum": "BC-2024-001234",
  "type": "birth",
  "id": "507f1f77bcf86cd799439011",
  "issued": "2024-01-15T10:30:00Z",
  "timestamp": 1705318200000
}
```

## Certificate Template Requirements

For QR codes to be embedded properly, certificate templates must include a QR code container:

```jsx
<div className="qr-code-container">
  {/* QR code will be inserted here automatically */}
</div>
```

Or any element with "qr" in the class name:
```jsx
<div className="certificate-qr">
  {/* QR code will be inserted here */}
</div>
```

## Usage Examples

### Basic Download with QR Code
```javascript
import { downloadCertificate } from './utils/certificateDownload';

const handleDownload = async () => {
  const certificateElement = document.querySelector('.certificate-content');
  
  const result = await downloadCertificate(
    certificateElement,
    record,        // Full record object with _id, certificate_number, etc.
    'birth',       // Record type
    'auto'         // Method (auto, print_to_pdf, html2canvas)
  );
  
  if (result.success) {
    console.log('Certificate downloaded with QR code');
  }
};
```

### Manual QR Code Addition
```javascript
import { addQRCodeToCertificate } from './utils/certificateDownload';

const addQRCode = async () => {
  const certificateElement = document.querySelector('.certificate-content');
  
  const success = await addQRCodeToCertificate(certificateElement, {
    certificateNumber: 'BC-2024-001234',
    recordType: 'birth',
    recordId: '507f1f77bcf86cd799439011',
    issuedDate: '2024-01-15T10:30:00Z'
  });
  
  if (success) {
    console.log('QR code added successfully');
  }
};
```

## Verification Process

### Public Verification Page
Users can verify certificates at `/verify-certificate`:

1. **Scan QR Code**: Use any QR code scanner app
2. **View Details**: Certificate information is displayed
3. **Verify Authenticity**: System checks against database
4. **Get Status**: Shows if certificate is valid, revoked, or not found

### API Endpoint
```
GET /api/certificates/verify/:certificateNumber
```

Returns:
```json
{
  "valid": true,
  "certificate": {
    "certificate_number": "BC-2024-001234",
    "record_type": "birth",
    "status": "approved",
    "issued_date": "2024-01-15T10:30:00Z"
  }
}
```

## Security Features

1. **High Error Correction**: QR codes use error correction level 'H' for reliability
2. **Timestamp Validation**: Each QR code includes generation timestamp
3. **Database Verification**: All certificates are verified against the database
4. **Tamper Detection**: Any modification to certificate data is detectable

## Browser Compatibility

QR code generation works in all modern browsers:
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Troubleshooting

### QR Code Not Appearing
1. Check that certificate template has QR code container
2. Verify record object contains required fields
3. Check browser console for errors
4. Ensure qrcode package is installed: `npm install qrcode`

### QR Code Not Scanning
1. Ensure QR code is clear and not pixelated
2. Try increasing QR code size in template
3. Check that QR code data is valid JSON
4. Verify error correction level is set to 'H'

### Download Without QR Code
If QR code generation fails, the download continues without it:
- Error is logged to console
- Certificate downloads normally
- User can still verify manually

## Future Enhancements

1. **Digital Signatures**: Add cryptographic signatures to QR codes
2. **Blockchain Integration**: Store certificate hashes on blockchain
3. **Batch Verification**: Verify multiple certificates at once
4. **Mobile App**: Dedicated mobile app for scanning and verification
5. **Offline Verification**: Cache verified certificates for offline checking

## Related Files

- `src/utils/certificateDownload.js` - Main download utility with QR integration
- `src/utils/qrCodeGenerator.js` - QR code generation functions
- `src/pages/VerifyCertificate.jsx` - Public verification page
- `QR_CODE_VERIFICATION_SYSTEM.md` - Detailed verification system documentation

## Support

For issues or questions about QR code integration:
1. Check console logs for error messages
2. Verify certificate template structure
3. Review QR_CODE_VERIFICATION_SYSTEM.md
4. Contact system administrator
