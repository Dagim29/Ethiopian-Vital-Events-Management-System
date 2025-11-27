# Quick Start: QR Codes in Certificates

## 🚀 Quick Overview

QR codes are now automatically added to all certificate downloads. No additional code changes needed!

## ✅ What's Already Done

1. **QR Code Generation** - Automatic
2. **Certificate Embedding** - Automatic  
3. **Verification System** - Ready to use
4. **Error Handling** - Built-in

## 📋 For Certificate Templates

### Required: Add QR Code Container

Add this to your certificate template:

```jsx
<div className="qr-code-container">
  {/* QR code will appear here automatically */}
</div>
```

### Styling Example

```jsx
<div className="qr-code-container" style={{
  width: '120px',
  height: '120px',
  border: '2px solid #000',
  padding: '8px',
  backgroundColor: '#fff'
}}>
  <p style={{ fontSize: '10px', textAlign: 'center', marginTop: '4px' }}>
    Scan to Verify
  </p>
</div>
```

## 🎯 Usage

### Download Certificate (with QR code)

```javascript
import { downloadCertificate } from './utils/certificateDownload';

// That's it! QR code is added automatically
await downloadCertificate(
  certificateElement,
  record,      // Must include: _id, certificate_number, created_at
  'birth',     // Type: birth, death, marriage, divorce
  'auto'       // Method: auto, print_to_pdf, html2canvas
);
```

## 🔍 Verification

### For Users
1. Download certificate
2. Scan QR code with phone
3. View certificate details
4. Verify authenticity

### Verification URL
```
https://your-domain.com/verify-certificate
```

## 📱 QR Code Contains

- Certificate Number
- Record Type
- Record ID
- Issue Date
- Timestamp

## ⚠️ Troubleshooting

### QR Code Not Showing?

**Check 1:** Certificate template has QR container
```jsx
<div className="qr-code-container"></div>
```

**Check 2:** Record object has required fields
```javascript
{
  _id: "...",
  certificate_number: "BC-2024-001234",
  created_at: "2024-01-15T10:30:00Z"
}
```

**Check 3:** Console for errors
```javascript
// Open browser console (F12)
// Look for QR-related errors
```

### QR Code Not Scanning?

- Make QR code bigger (min 100x100px)
- Ensure high contrast (black on white)
- Check QR code is not blurry
- Try different QR scanner app

## 🎨 Customization

### Change QR Code Size

In your certificate template:
```jsx
<div className="qr-code-container" style={{ width: '150px', height: '150px' }}>
  {/* Larger QR code */}
</div>
```

### Add Custom Styling

```jsx
<div className="qr-code-container border-2 border-gray-800 p-2 bg-white rounded-lg shadow-md">
  <div className="text-xs text-center mt-1 font-semibold">
    Scan to Verify Certificate
  </div>
</div>
```

## 📊 Testing

### Test QR Code Generation

1. Download a certificate
2. Check PDF includes QR code
3. Scan QR code with phone
4. Verify data is correct

### Test Verification

1. Scan QR code
2. Navigate to verification page
3. Check certificate details display
4. Verify status shows correctly

## 🔐 Security

- ✅ High error correction (30% recovery)
- ✅ Tamper detection built-in
- ✅ Database verification required
- ✅ Timestamp validation
- ✅ Secure data encoding

## 📚 More Information

- **Full Integration Guide**: `QR_CODE_CERTIFICATE_INTEGRATION.md`
- **Verification System**: `QR_CODE_VERIFICATION_SYSTEM.md`
- **Summary**: `QR_CODE_INTEGRATION_SUMMARY.md`

## 💡 Tips

1. **QR Code Size**: 100-150px works best
2. **Placement**: Bottom right or bottom center
3. **Contrast**: Always black on white background
4. **Border**: Add border for better scanning
5. **Label**: Add "Scan to Verify" text

## ✨ That's It!

QR codes are now automatically included in all certificate downloads. Just make sure your certificate template has a QR code container, and everything else is handled automatically!

---

**Questions?** Check the detailed documentation files or contact support.
