# QR Code Certificate Verification System

## Overview
The QR Code Verification System adds an additional layer of security and authenticity to vital records certificates. Each certificate can include a QR code that contains encrypted certificate information, allowing anyone to verify the authenticity of a certificate instantly.

## Features

### 1. QR Code Generation
- Automatic QR code generation for all certificates
- High error correction level (Level H - 30% recovery)
- Embedded certificate metadata (number, type, issue date)
- Tamper-resistant encoding

### 2. Certificate Verification
- Public verification page (no login required)
- Instant verification results
- Detailed certificate information display
- Status checking (approved/pending/rejected)

### 3. Security Features
- Timestamp-based verification
- Certificate number validation
- Record type matching
- Status verification (only approved certificates are valid)

## Implementation

### Frontend Components

#### 1. QR Code Generator Utility (`src/utils/qrCodeGenerator.js`)
```javascript
// Generate QR code for certificate
const qrCode = await generateCertificateQRCode({
  certificateNumber: 'CERT-2024-001',
  recordType: 'birth',
  recordId: '507f1f77bcf86cd799439011',
  issuedDate: '2024-01-15'
});
```

#### 2. Verification Page (`src/pages/VerifyCertificate.jsx`)
- Accessible at: `/verify-certificate`
- Public access (no authentication required)
- Manual entry or QR code scan
- Real-time verification

### Usage

#### For Certificate Holders
1. Receive certificate with QR code
2. Share QR code or certificate number with verifier
3. Verifier scans QR code or enters certificate number
4. Instant verification result

#### For Verifiers
1. Visit: `https://your-domain.com/verify-certificate`
2. Enter certificate number OR scan QR code
3. Select record type (Birth/Death/Marriage/Divorce)
4. Click "Verify Certificate"
5. View verification result

## Integration with Certificate Download

### Adding QR Code to Certificates

To add QR codes to your certificate templates, update the certificate download utility:

```javascript
import { generateCertificateQRCode } from '../utils/qrCodeGenerator';

// In your certificate generation function
const qrCodeDataURL = await generateCertificateQRCode({
  certificateNumber: record.certificate_number,
  recordType: 'birth', // or 'death', 'marriage', 'divorce'
  recordId: record._id,
  issuedDate: record.registration_date
});

// Add QR code to certificate (PDF/Image)
// For jsPDF:
doc.addImage(qrCodeDataURL, 'PNG', x, y, width, height);

// For Canvas:
const img = new Image();
img.src = qrCodeDataURL;
ctx.drawImage(img, x, y, width, height);
```

## QR Code Data Structure

```json
{
  "certNum": "CERT-2024-001",
  "type": "birth",
  "id": "507f1f77bcf86cd799439011",
  "issued": "2024-01-15",
  "timestamp": 1705334400000
}
```

## Verification Flow

```
1. User scans QR code or enters certificate number
   ↓
2. System extracts certificate data
   ↓
3. Query database for matching record
   ↓
4. Verify:
   - Certificate number matches
   - Record type matches
   - Status is "approved"
   ↓
5. Display verification result:
   ✓ Valid: Show certificate details
   ✗ Invalid: Show error message
```

## Security Considerations

### What the QR Code Protects Against:
- ✅ Fake certificates (not in database)
- ✅ Altered certificate numbers
- ✅ Unapproved certificates
- ✅ Wrong record type claims

### What It Doesn't Protect Against:
- ❌ Cloned QR codes (same QR on multiple documents)
- ❌ Database tampering (requires additional measures)
- ❌ Insider fraud (requires audit trails)

### Recommendations for Enhanced Security:
1. **Digital Signatures**: Add cryptographic signatures
2. **Blockchain**: Store certificate hashes on blockchain
3. **Watermarks**: Add visible/invisible watermarks
4. **Holographic Elements**: Physical security features
5. **Rate Limiting**: Prevent verification abuse

## API Endpoints

### Verify Certificate (Frontend)
```
GET /verify-certificate?cert=CERT-2024-001&type=birth
```

### Future Backend Endpoint (Recommended)
```
POST /api/verify-certificate
Body: {
  "certificateNumber": "CERT-2024-001",
  "recordType": "birth"
}
Response: {
  "valid": true,
  "record": { ... },
  "verifiedAt": "2024-01-15T10:30:00Z"
}
```

## Testing

### Test Scenarios

1. **Valid Certificate**
   - Certificate number: [Use actual certificate from database]
   - Expected: ✓ Verification successful

2. **Invalid Certificate Number**
   - Certificate number: FAKE-2024-999
   - Expected: ✗ Certificate not found

3. **Pending Certificate**
   - Certificate number: [Pending record]
   - Expected: ✗ Not yet approved

4. **Wrong Record Type**
   - Certificate number: [Birth certificate]
   - Record type: Death
   - Expected: ✗ Not found

## Deployment Checklist

- [ ] Install qrcode package: `npm install qrcode`
- [ ] Add verification route to App.jsx
- [ ] Update certificate download to include QR codes
- [ ] Test verification with sample certificates
- [ ] Add verification link to certificates
- [ ] Update user documentation
- [ ] Train staff on verification process
- [ ] Add verification instructions to certificates

## Future Enhancements

### Phase 2
- [ ] QR code scanner (camera integration)
- [ ] Mobile app for verification
- [ ] Batch verification
- [ ] Verification history/logs
- [ ] Email verification reports

### Phase 3
- [ ] Blockchain integration
- [ ] Digital signatures
- [ ] Biometric verification
- [ ] International verification standards
- [ ] API for third-party verification

## Troubleshooting

### QR Code Not Generating
- Check if qrcode package is installed
- Verify certificate data is complete
- Check console for errors

### Verification Fails
- Ensure certificate is approved
- Check certificate number format
- Verify record type matches
- Check database connectivity

### QR Code Not Scanning
- Increase QR code size
- Improve print quality
- Check error correction level
- Ensure good lighting when scanning

## Support

For issues or questions:
1. Check this documentation
2. Review console logs
3. Test with known valid certificates
4. Contact system administrator

## Compliance

This system helps meet:
- Data authenticity requirements
- Anti-fraud regulations
- Digital verification standards
- Public transparency mandates

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Implemented
