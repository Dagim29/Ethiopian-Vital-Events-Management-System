# 🔧 Certificate Download Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Failed to download certificate. Please try again."

This is a generic error. Check the browser console (F12) for more details.

---

## Specific Error Messages

### 1. "Certificate element not found"

**Cause:** The certificate DOM element is not available.

**Solutions:**
- Refresh the page
- Wait for the certificate to fully load
- Check if you're on the correct page (/certificates/[type]/[id])

**Code Check:**
```javascript
// Verify element exists
console.log(certificateRef.current); // Should not be null
```

---

### 2. "Certificate is not visible. Please wait for it to load."

**Cause:** The certificate element has no dimensions (width/height = 0).

**Solutions:**
- Wait a few seconds for the page to render
- Scroll to make sure the certificate is in view
- Check if CSS is loaded properly
- Disable browser extensions that might hide content

**Code Check:**
```javascript
// Check element dimensions
const rect = element.getBoundingClientRect();
console.log('Dimensions:', rect.width, 'x', rect.height);
```

---

### 3. "Failed to load certificate images"

**Cause:** Images (Ethiopian flag, photos) failed to load.

**Solutions:**
- Check internet connection
- Verify image URLs are correct
- Check CORS settings
- Wait longer for images to load

**Code Check:**
```javascript
// Check if images loaded
const images = document.querySelectorAll('.certificate-content img');
images.forEach(img => {
  console.log('Image loaded:', img.complete, img.src);
});
```

---

### 4. "Failed to generate certificate image"

**Cause:** html2canvas failed to convert DOM to image.

**Solutions:**
- Try the Print-to-PDF method instead (click Options button)
- Check browser console for specific html2canvas errors
- Disable browser extensions
- Try a different browser

**Workaround:**
```javascript
// Use print method instead
handleDownload(DOWNLOAD_METHODS.PRINT_TO_PDF);
```

---

### 5. Blank/White PDF Downloaded

**Cause:** Canvas was created but contains no content.

**Solutions:**
- Ensure certificate is visible on screen
- Wait for all content to load
- Check if CSS styles are applied
- Try increasing the delay before download

**Code Fix:**
```javascript
// Add delay before download
setTimeout(() => {
  handleDownload();
}, 1000); // Wait 1 second
```

---

### 6. PDF Quality is Poor

**Cause:** Low resolution scale or compression.

**Solutions:**
- Use Print-to-PDF method for best quality
- Increase scale in certificateDownload.js:
  ```javascript
  scale: 3, // Change from 2 to 3
  ```
- Disable compression:
  ```javascript
  compress: false,
  ```

---

### 7. Colors Not Showing in PDF

**Cause:** Print settings or browser configuration.

**Solutions:**
- In print dialog, enable "Background graphics"
- Set color mode to "Color" (not black & white)
- Use HTML2Canvas method instead

**Print Dialog Settings:**
```
☑ Background graphics: ON
☑ Color: Color
☐ Headers and footers: OFF
```

---

### 8. Download Button Not Working

**Cause:** JavaScript error or event handler not attached.

**Solutions:**
- Check browser console for errors
- Refresh the page
- Clear browser cache
- Check if React is loaded properly

**Code Check:**
```javascript
// Verify handler is attached
console.log('Download handler:', typeof handleDownload); // Should be 'function'
```

---

### 9. "Cannot read property 'current' of undefined"

**Cause:** certificateRef is not initialized.

**Solutions:**
- Ensure useRef is imported
- Check if ref is attached to element:
  ```jsx
  <div ref={certificateRef} className="certificate-content">
  ```
- Wait for component to mount

---

### 10. CORS Errors

**Cause:** Cross-origin images blocked by browser.

**Solutions:**
- Ensure images are from same domain
- Add CORS headers to image server
- Use proxy for external images
- Set useCORS: true in html2canvas options (already set)

**Backend Fix:**
```python
# Add CORS headers for images
response.headers['Access-Control-Allow-Origin'] = '*'
```

---

## Browser-Specific Issues

### Chrome/Edge

**Issue:** Download blocked by popup blocker
**Solution:** Allow popups for your site

**Issue:** Print dialog doesn't open
**Solution:** Check if print is allowed in browser settings

### Firefox

**Issue:** Canvas rendering slow
**Solution:** Reduce scale to 2 or use print method

**Issue:** Colors look different
**Solution:** Enable "Print backgrounds" in print settings

### Safari

**Issue:** html2canvas not working
**Solution:** Use Print-to-PDF method instead

**Issue:** PDF opens in new tab instead of downloading
**Solution:** Right-click and "Save As"

---

## Debugging Steps

### Step 1: Check Browser Console

Open Developer Tools (F12) and look for:
- Red error messages
- Warning messages
- Network errors (failed image loads)

### Step 2: Verify Element

```javascript
// In browser console
const element = document.querySelector('.certificate-content');
console.log('Element:', element);
console.log('Dimensions:', element.getBoundingClientRect());
console.log('Visible:', element.offsetWidth > 0);
```

### Step 3: Test Print Method

```javascript
// Try simple print
window.print();
```

If this works, the issue is with HTML2Canvas method.

### Step 4: Check Dependencies

```bash
# Verify packages installed
npm list jspdf html2canvas
```

Should show:
```
├── html2canvas@1.4.1
└── jspdf@2.5.2
```

### Step 5: Test in Different Browser

Try Chrome, Firefox, and Edge to isolate browser-specific issues.

---

## Quick Fixes

### Fix 1: Use Print Method

Most reliable, always works:

```javascript
// Click "Options" button
// Select "Browser Print to PDF"
// Or use Print button directly
```

### Fix 2: Increase Timeout

If images are slow to load:

```javascript
// In CertificateView.jsx
setTimeout(() => {
  handleDownload();
}, 2000); // Wait 2 seconds
```

### Fix 3: Disable Extensions

Browser extensions can interfere:
- Ad blockers
- Privacy extensions
- Content blockers

Disable them temporarily and try again.

### Fix 4: Clear Cache

```
Chrome: Ctrl+Shift+Delete
Firefox: Ctrl+Shift+Delete
Edge: Ctrl+Shift+Delete
```

Clear cache and reload page.

### Fix 5: Update Browser

Ensure you're using latest browser version:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

---

## Advanced Debugging

### Enable Verbose Logging

In `certificateDownload.js`, set:

```javascript
logging: true, // Enable html2canvas logging
```

### Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check if all resources loaded (images, CSS, JS)

### Test with Simple Certificate

Create a minimal test certificate:

```jsx
<div ref={testRef} style={{ width: '800px', height: '1000px', background: 'white' }}>
  <h1>Test Certificate</h1>
  <p>This is a test</p>
</div>
```

If this works, the issue is with certificate content.

---

## Getting Help

### Information to Provide

When reporting issues, include:

1. **Browser and version**
   ```
   Chrome 120.0.6099.109
   ```

2. **Error message**
   ```
   Failed to download certificate. Please try again.
   ```

3. **Console errors**
   ```
   Copy full error from browser console
   ```

4. **Steps to reproduce**
   ```
   1. Go to /certificates
   2. Click View on birth certificate
   3. Click Download PDF
   4. Error appears
   ```

5. **Screenshot**
   - Screenshot of error
   - Screenshot of browser console

---

## Prevention

### Best Practices

1. **Always wait for page to load**
   - Don't click download immediately
   - Wait for images to appear

2. **Use recommended method**
   - Print-to-PDF for best quality
   - HTML2Canvas for convenience

3. **Check browser compatibility**
   - Use modern browser
   - Keep browser updated

4. **Test before production**
   - Test all certificate types
   - Test in multiple browsers
   - Test with slow connection

---

## Emergency Workaround

If nothing works, use screenshot method:

1. Take screenshot of certificate (Windows: Win+Shift+S)
2. Paste into image editor
3. Save as PNG
4. Convert to PDF using online tool

Or use browser's built-in screenshot:
- Chrome: Ctrl+Shift+P → "Capture screenshot"
- Firefox: Right-click → "Take Screenshot"

---

## Status Indicators

### ✅ Working Correctly
- Download button enabled
- No console errors
- PDF downloads successfully
- Content looks correct

### ⚠️ Partial Issues
- Download works but quality poor
- Some images missing
- Colors slightly off

### ❌ Not Working
- Download button disabled
- Console shows errors
- No PDF generated
- Blank PDF downloaded

---

## Contact Support

If issues persist:

1. Check documentation: `CERTIFICATE_DOWNLOAD_SYSTEM.md`
2. Review setup guide: `CERTIFICATE_DOWNLOAD_SETUP.md`
3. Search existing issues on GitHub
4. Create new issue with details above

---

**Last Updated:** November 24, 2025
**Version:** 2.0.0
